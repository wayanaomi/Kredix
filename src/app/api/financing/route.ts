import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";

export async function GET() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ applications: [] });

    const applications = await prisma.financingApplication.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      include: { statusHistory: { orderBy: { createdAt: "asc" } }, referrals: { include: { lender: true } } },
    });

    return NextResponse.json({ applications });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
