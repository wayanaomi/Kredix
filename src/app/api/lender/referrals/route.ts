import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireLenderProfile, AuthError } from "@/lib/auth/guard";

export async function GET() {
  try {
    const user = await requireUser(["LENDER"]);
    const lender = await requireLenderProfile(user.id);

    const referrals = await prisma.lenderReferral.findMany({
      where: { lenderId: lender.id },
      orderBy: { createdAt: "desc" },
      include: {
        application: { include: { business: true } },
      },
    });

    const withPassport = await Promise.all(
      referrals.map(async (r) => {
        const passport = await prisma.financialPassport.findUnique({
          where: { businessId: r.application.businessId },
        });
        return { ...r, passportData: passport ? JSON.parse(passport.dataJson) : null };
      })
    );

    return NextResponse.json({ referrals: withPassport });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
