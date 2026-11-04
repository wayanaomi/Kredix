import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireUser(["ADMIN"]);
    const applications = await prisma.financingApplication.findMany({
      orderBy: { createdAt: "desc" },
      include: { business: true, referrals: { include: { lender: true } } },
      take: 100,
    });
    const lenders = await prisma.lender.findMany();
    return NextResponse.json({ applications, lenders });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["ADMIN"]);
    const body = await req.json().catch(() => null);
    const applicationId = body?.applicationId as string | undefined;
    const lenderId = body?.lenderId as string | undefined;
    if (!applicationId || !lenderId) {
      return NextResponse.json({ error: "applicationId and lenderId are required" }, { status: 400 });
    }

    const application = await prisma.financingApplication.findUnique({ where: { id: applicationId } });
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    const referral = await prisma.lenderReferral.upsert({
      where: { applicationId_lenderId: { applicationId, lenderId } },
      create: { applicationId, lenderId, status: application.status },
      update: {},
    });

    await writeAudit({
      actorUserId: user.id,
      actorRole: user.role,
      action: "REFERRAL_ASSIGNED",
      entityType: "LenderReferral",
      entityId: referral.id,
      metadata: { applicationId, lenderId },
    });

    return NextResponse.json({ referral });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
