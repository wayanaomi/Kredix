import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { getOrRecalculateScore } from "@/lib/scoring";
import { formatNgn } from "@/lib/money";

export const PASSPORT_VERSION = "1.0.0";
const SHARE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export interface PassportData {
  version: string;
  businessName: string;
  tenureMonths: number | null;
  location: string | null;
  industry: string | null;
  totalRevenueMinor: number;
  totalRevenueFormatted: string;
  transactionCount: number;
  firstTransactionAt: string | null;
  lastTransactionAt: string | null;
  healthScore: number | null;
  healthScoreFactors: unknown[];
  generatedAt: string;
  fields: {
    label: string;
    value: string;
    status: "VERIFIED" | "SELF_DECLARED" | "SYSTEM_CALCULATED" | "AI_GENERATED";
  }[];
}

export async function generateOrRefreshPassport(businessId: string) {
  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
  const scoreResult = await getOrRecalculateScore(businessId);

  if (scoreResult.eligibility === "NOT_ELIGIBLE") {
    return { eligibility: "NOT_ELIGIBLE" as const, missingRequirements: scoreResult.missingRequirements };
  }

  const transactions = await prisma.transaction.findMany({
    where: { businessId },
    orderBy: { occurredAt: "asc" },
  });
  const totalRevenueMinor = transactions.reduce((a, t) => a + t.amountMinor, 0);

  const data: PassportData = {
    version: PASSPORT_VERSION,
    businessName: business.name,
    tenureMonths: business.tenureMonths,
    location: business.location,
    industry: business.industry,
    totalRevenueMinor,
    totalRevenueFormatted: formatNgn(totalRevenueMinor),
    transactionCount: transactions.length,
    firstTransactionAt: transactions[0]?.occurredAt.toISOString() ?? null,
    lastTransactionAt: transactions[transactions.length - 1]?.occurredAt.toISOString() ?? null,
    healthScore: scoreResult.score,
    healthScoreFactors: scoreResult.factors,
    generatedAt: new Date().toISOString(),
    fields: [
      { label: "Business name", value: business.name, status: "SELF_DECLARED" },
      { label: "Industry", value: business.industry ?? "—", status: "SELF_DECLARED" },
      { label: "Location", value: business.location ?? "—", status: "SELF_DECLARED" },
      {
        label: "Business tenure",
        value: business.tenureMonths ? `${business.tenureMonths} months` : "—",
        status: "SELF_DECLARED",
      },
      {
        label: "Total recorded revenue",
        value: formatNgn(totalRevenueMinor),
        status: "SYSTEM_CALCULATED",
      },
      {
        label: "Recorded transactions",
        value: String(transactions.length),
        status: "SYSTEM_CALCULATED",
      },
      {
        label: "Business Health Score",
        value: scoreResult.score !== null ? `${scoreResult.score}/100` : "—",
        status: "SYSTEM_CALCULATED",
      },
    ],
  };

  const passport = await prisma.financialPassport.upsert({
    where: { businessId },
    create: {
      businessId,
      version: PASSPORT_VERSION,
      eligibility: "ELIGIBLE",
      dataJson: JSON.stringify(data),
    },
    update: {
      version: PASSPORT_VERSION,
      eligibility: "ELIGIBLE",
      dataJson: JSON.stringify(data),
    },
  });

  return { eligibility: "ELIGIBLE" as const, passport, data };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPassportShare(passportId: string, createdById: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SHARE_TTL_MS);

  const share = await prisma.passportShare.create({
    data: { passportId, tokenHash, createdById, expiresAt },
  });

  return { share, token };
}

export async function resolvePassportShare(token: string, ipAddress?: string) {
  const tokenHash = hashToken(token);
  const share = await prisma.passportShare.findUnique({
    where: { tokenHash },
    include: { passport: { include: { business: true } } },
  });

  if (!share) {
    return { outcome: "DENIED_INVALID" as const, share: null };
  }
  if (share.revokedAt) {
    await prisma.passportAccessLog.create({ data: { shareId: share.id, outcome: "DENIED_REVOKED", ipAddress } });
    return { outcome: "DENIED_REVOKED" as const, share: null };
  }
  if (share.expiresAt < new Date()) {
    await prisma.passportAccessLog.create({ data: { shareId: share.id, outcome: "DENIED_EXPIRED", ipAddress } });
    return { outcome: "DENIED_EXPIRED" as const, share: null };
  }

  await prisma.passportAccessLog.create({ data: { shareId: share.id, outcome: "SUCCESS", ipAddress } });
  await prisma.passportShare.update({ where: { id: share.id }, data: { lastAccessedAt: new Date() } });

  return { outcome: "SUCCESS" as const, share };
}

export async function revokePassportShare(shareId: string) {
  await prisma.passportShare.update({ where: { id: shareId }, data: { revokedAt: new Date() } });
}
