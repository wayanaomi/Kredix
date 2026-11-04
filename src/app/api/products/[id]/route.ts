import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { productSchema } from "@/lib/validation/catalogue";
import { nairaToKobo } from "@/lib/money";

async function getOwnedProduct(userId: string, productId: string) {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { business: true } });
  if (!product || product.business.ownerId !== userId) {
    throw new AuthError("Product not found", 404);
  }
  return product;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser(["SME_OWNER"]);
    await getOwnedProduct(user.id, id);

    const body = await req.json().catch(() => null);
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description || null }),
        ...(parsed.data.priceNaira !== undefined && { priceMinor: nairaToKobo(parsed.data.priceNaira) }),
        ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
        ...(parsed.data.isAvailable !== undefined && { isAvailable: parsed.data.isAvailable }),
        ...(parsed.data.inventoryQty !== undefined && { inventoryQty: parsed.data.inventoryQty ?? null }),
      },
    });

    return NextResponse.json({ product });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser(["SME_OWNER"]);
    await getOwnedProduct(user.id, id);

    await prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isAvailable: false } });

    return NextResponse.json({ deleted: true });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
