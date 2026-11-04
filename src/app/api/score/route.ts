import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { getOrRecalculateScore } from "@/lib/scoring";

export async function GET() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ score: null });

    const score = await getOrRecalculateScore(business.id);
    return NextResponse.json({ score });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
