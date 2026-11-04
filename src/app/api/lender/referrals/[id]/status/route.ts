import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireLenderProfile, AuthError } from "@/lib/auth/guard";
import { financingStatusUpdateSchema } from "@/lib/validation/financing";
import { transitionFinancingStatus, InvalidTransitionError } from "@/lib/financing";
import { sendNotification, templates } from "@/lib/notifications";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser(["LENDER"]);
    const lender = await requireLenderProfile(user.id);

    // Never trust a client-supplied referral ID alone — re-check it belongs to this lender.
    const referral = await prisma.lenderReferral.findUnique({
      where: { id },
      include: { application: { include: { business: { include: { owner: true } } } } },
    });
    if (!referral || referral.lenderId !== lender.id) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = financingStatusUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const updated = await transitionFinancingStatus({
      applicationId: referral.applicationId,
      toStatus: parsed.data.status,
      changedById: user.id,
      changedByRole: user.role,
      note: parsed.data.note,
    });

    await prisma.lenderReferral.update({ where: { id }, data: { status: updated.status, decisionNote: parsed.data.note } });

    const owner = referral.application.business.owner;
    await sendNotification({
      userId: owner.id,
      businessId: referral.application.businessId,
      payload: {
        channel: "SMS",
        to: owner.phone ?? owner.email ?? "",
        template: "financing_status_update",
        message: templates.financingStatusUpdate(referral.application.reference, updated.status),
      },
    });

    return NextResponse.json({ application: updated });
  } catch (e) {
    if (e instanceof InvalidTransitionError) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
