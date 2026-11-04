import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";

export async function GET(req: NextRequest) {
  try {
    await requireUser(["ADMIN"]);
    const q = new URL(req.url).searchParams.get("q")?.trim();

    const businesses = await prisma.business.findMany({
      where: q
        ? { OR: [{ name: { contains: q } }, { owner: { email: { contains: q } } }, { owner: { phone: { contains: q } } }] }
        : undefined,
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        storefront: true,
        _count: { select: { products: true, transactions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ businesses });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
