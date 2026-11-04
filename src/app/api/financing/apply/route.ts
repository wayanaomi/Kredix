import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { financingApplicationSchema } from "@/lib/validation/financing";
import { generateApplicationReference } from "@/lib/financing";
import { getOrRecalculateScore } from "@/lib/scoring";
import { nairaToKobo } from "@/lib/money";
import { writeAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

    const score = await getOrRecalculateScore(business.id);
    if (score.eligibility !== "ELIGIBLE") {
      return NextResponse.json(
        { error: "Your business does not yet meet the eligibility requirements for financing. Build more transaction history first." },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = financingApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const consent = await prisma.consentRecord.create({
      data: {
        businessId: business.id,
        type: "FINANCING_REFERRAL",
        grantedById: user.id,
        scopeJson: JSON.stringify({ purpose: "financing_application" }),
      },
    });

    const application = await prisma.financingApplication.create({
      data: {
        businessId: business.id,
        consentId: consent.id,
        requestedAmountMinor: nairaToKobo(parsed.data.requestedAmountNaira),
        purpose: parsed.data.purpose,
        reference: generateApplicationReference(),
        status: "SUBMITTED",
      },
    });

    await prisma.applicationStatusHistory.create({
      data: { applicationId: application.id, toStatus: "SUBMITTED", changedById: user.id },
    });

    await writeAudit({
      actorUserId: user.id,
      actorRole: user.role,
      action: "FINANCING_APPLICATION_SUBMITTED",
      entityType: "FinancingApplication",
      entityId: application.id,
    });

    return NextResponse.json({ application });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
