import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { productSchema } from "@/lib/validation/catalogue";
import { nairaToKobo } from "@/lib/money";

export async function GET() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ products: [] });
    const products = await prisma.product.findMany({
      where: { businessId: business.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

    const body = await req.json().catch(() => null);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        priceMinor: nairaToKobo(parsed.data.priceNaira),
        imageUrl: parsed.data.imageUrl || null,
        isAvailable: parsed.data.isAvailable,
        inventoryQty: parsed.data.inventoryQty ?? null,
      },
    });

    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
