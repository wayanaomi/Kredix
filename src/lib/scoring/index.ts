import { prisma } from "@/lib/db";

export const SCORING_VERSION = "1.0.0";

const MIN_TRANSACTIONS = 5;
const MIN_OBSERVATION_DAYS = 14;

export interface ScoreFactor {
  key: string;
  label: string;
  weight: number;
  value: number; // normalised 0-100
  explanation: string;
}

export interface ScoreResult {
  eligibility: "ELIGIBLE" | "NOT_ELIGIBLE";
  score: number | null;
  version: string;
  factors: ScoreFactor[];
  missingRequirements: string[];
  calculatedAt: Date;
}

function weeksOfYear(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / (values.length || 1);
}

function stdDev(values: number[]): number {
  const m = mean(values);
  const variance = mean(values.map((v) => (v - m) ** 2));
  return Math.sqrt(variance);
}

export async function calculateBusinessHealthScore(businessId: string): Promise<ScoreResult> {
  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId } });
  const transactions = await prisma.transaction.findMany({
    where: { businessId },
    orderBy: { occurredAt: "asc" },
  });

  const missingRequirements: string[] = [];
  if (transactions.length < MIN_TRANSACTIONS) {
    missingRequirements.push(
      `At least ${MIN_TRANSACTIONS} recorded transactions are needed (currently ${transactions.length}).`
    );
  }

  let observationDays = 0;
  if (transactions.length >= 2) {
    const first = transactions[0].occurredAt.getTime();
    const last = transactions[transactions.length - 1].occurredAt.getTime();
    observationDays = Math.floor((last - first) / (1000 * 60 * 60 * 24));
  }
  if (observationDays < MIN_OBSERVATION_DAYS) {
    missingRequirements.push(
      `At least ${MIN_OBSERVATION_DAYS} days of transaction history are needed (currently ${observationDays}).`
    );
  }

  const profileComplete = Boolean(business.name && business.industry && business.location && business.tenureMonths !== null);
  if (!profileComplete) {
    missingRequirements.push("Complete your business profile (industry, location and tenure).");
  }

  if (missingRequirements.length > 0) {
    return {
      eligibility: "NOT_ELIGIBLE",
      score: null,
      version: SCORING_VERSION,
      factors: [],
      missingRequirements,
      calculatedAt: new Date(),
    };
  }

  // Factor 1: transaction-record consistency (last 8 ISO weeks with >= 1 transaction)
  const now = new Date();
  const recentWeeks = new Set<string>();
  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    recentWeeks.add(weeksOfYear(d));
  }
  const weeksWithActivity = new Set(
    transactions
      .filter((t) => recentWeeks.has(weeksOfYear(t.occurredAt)))
      .map((t) => weeksOfYear(t.occurredAt))
  );
  const consistency = Math.min(100, (weeksWithActivity.size / 8) * 100);

  // Factor 2: revenue-record completeness
  const wellFormed = transactions.filter((t) => t.amountMinor > 0 && t.productLabel).length;
  const completeness = (wellFormed / transactions.length) * 100;

  // Factor 3: business tenure
  const tenureScore = Math.min((business.tenureMonths ?? 0) / 36, 1) * 100;

  // Factor 4: transaction regularity (lower coefficient of variation = more regular)
  const weekBuckets = new Map<string, number>();
  for (const t of transactions) {
    const w = weeksOfYear(t.occurredAt);
    weekBuckets.set(w, (weekBuckets.get(w) ?? 0) + 1);
  }
  const counts = Array.from(weekBuckets.values());
  const cv = counts.length > 1 && mean(counts) > 0 ? stdDev(counts) / mean(counts) : 1;
  const regularity = Math.max(0, Math.min(100, 100 - cv * 100));

  // Factor 5: business information completeness
  const optionalFields = [business.description, business.employeeCount, business.registrationStatus];
  const infoCompleteness = (optionalFields.filter(Boolean).length / optionalFields.length) * 100;

  const factors: ScoreFactor[] = [
    {
      key: "consistency",
      label: "Transaction-record consistency",
      weight: 0.3,
      value: Math.round(consistency),
      explanation: `${weeksWithActivity.size} of the last 8 weeks had at least one recorded sale.`,
    },
    {
      key: "completeness",
      label: "Revenue-record completeness",
      weight: 0.2,
      value: Math.round(completeness),
      explanation: `${wellFormed} of ${transactions.length} transactions have a complete amount and description.`,
    },
    {
      key: "tenure",
      label: "Business tenure",
      weight: 0.2,
      value: Math.round(tenureScore),
      explanation: `Business has reported trading for ${business.tenureMonths ?? 0} months.`,
    },
    {
      key: "regularity",
      label: "Transaction regularity",
      weight: 0.2,
      value: Math.round(regularity),
      explanation: `Weekly sales counts show ${(cv * 100).toFixed(0)}% relative variability.`,
    },
    {
      key: "infoCompleteness",
      label: "Business information completeness",
      weight: 0.1,
      value: Math.round(infoCompleteness),
      explanation: `${optionalFields.filter(Boolean).length} of ${optionalFields.length} optional profile fields are filled in.`,
    },
  ];

  const weighted = factors.reduce((acc, f) => acc + f.value * f.weight, 0);
  const score = Math.max(0, Math.min(100, Math.round(weighted)));

  return {
    eligibility: "ELIGIBLE",
    score,
    version: SCORING_VERSION,
    factors,
    missingRequirements: [],
    calculatedAt: new Date(),
  };
}

export async function getOrRecalculateScore(businessId: string) {
  const latest = await prisma.businessHealthScore.findFirst({
    where: { businessId },
    orderBy: { calculatedAt: "desc" },
  });

  const lastTxn = await prisma.transaction.findFirst({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });

  const isStale =
    !latest || (lastTxn && lastTxn.createdAt > latest.calculatedAt) || latest.version !== SCORING_VERSION;

  if (!isStale && latest) {
    return {
      eligibility: latest.eligibility as "ELIGIBLE" | "NOT_ELIGIBLE",
      score: latest.score,
      version: latest.version,
      factors: JSON.parse(latest.factorsJson) as ScoreFactor[],
      missingRequirements: [],
      calculatedAt: latest.calculatedAt,
    };
  }

  const result = await calculateBusinessHealthScore(businessId);
  await prisma.businessHealthScore.create({
    data: {
      businessId,
      score: result.score,
      version: result.version,
      eligibility: result.eligibility,
      factorsJson: JSON.stringify(result.factors),
    },
  });
  return result;
}
