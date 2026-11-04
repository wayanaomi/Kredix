import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { getDashboardMetrics } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ metrics: null });

    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") ?? 30);
    const to = new Date();
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);

    const metrics = await getDashboardMetrics(business.id, { from, to });
    return NextResponse.json({ metrics });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
