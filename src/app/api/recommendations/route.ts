import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { persistRecommendations } from "@/lib/recommendations";

export async function GET() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ recommendations: [], insufficientDataReason: null });

    const recommendations = await persistRecommendations(business.id);
    const insufficientDataReason =
      recommendations.length === 0
        ? "Not enough recorded transactions yet to generate a reliable recommendation. Keep recording sales in your ledger."
        : null;

    return NextResponse.json({ recommendations, insufficientDataReason });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
