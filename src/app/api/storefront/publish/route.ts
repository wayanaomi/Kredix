import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";

export async function POST() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

    const storefront = await prisma.storefront.findUnique({ where: { businessId: business.id } });
    if (!storefront) {
      return NextResponse.json({ error: "Set up your storefront before publishing" }, { status: 400 });
    }

    const productCount = await prisma.product.count({ where: { businessId: business.id, deletedAt: null } });
    if (productCount === 0) {
      return NextResponse.json({ error: "Add at least one product before publishing" }, { status: 400 });
    }

    const updated = await prisma.storefront.update({
      where: { id: storefront.id },
      data: { isPublished: true, publishedAt: new Date() },
    });
    await prisma.business.update({ where: { id: business.id }, data: { onboardingStep: "COMPLETE" } });

    return NextResponse.json({ storefront: updated });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
