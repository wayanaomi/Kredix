import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { createPassportShare } from "@/lib/passport";
import { writeAudit } from "@/lib/audit";
import { getEnv } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    if (body?.consentAccepted !== true) {
      return NextResponse.json({ error: "Consent is required before sharing your Financial Passport" }, { status: 400 });
    }

    const passport = await prisma.financialPassport.findUnique({ where: { businessId: business.id } });
    if (!passport) return NextResponse.json({ error: "Generate your Financial Passport first" }, { status: 400 });

    await prisma.consentRecord.create({
      data: {
        businessId: business.id,
        type: "PASSPORT_SHARE",
        grantedById: user.id,
        scopeJson: JSON.stringify({ passportId: passport.id }),
      },
    });

    const { share, token } = await createPassportShare(passport.id, user.id);

    await writeAudit({
      actorUserId: user.id,
      actorRole: user.role,
      action: "PASSPORT_SHARE_CREATED",
      entityType: "PassportShare",
      entityId: share.id,
    });

    const appUrl = getEnv().NEXT_PUBLIC_APP_URL;
    return NextResponse.json({ shareUrl: `${appUrl}/p/${token}`, expiresAt: share.expiresAt });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function GET() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ shares: [] });
    const passport = await prisma.financialPassport.findUnique({ where: { businessId: business.id } });
    if (!passport) return NextResponse.json({ shares: [] });
    const shares = await prisma.passportShare.findMany({
      where: { passportId: passport.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { accessLogs: true } } },
    });
    return NextResponse.json({ shares });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
