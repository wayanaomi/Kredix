import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { storefrontSchema } from "@/lib/validation/catalogue";

async function getOwnedBusiness(userId: string) {
  const business = await prisma.business.findFirst({ where: { ownerId: userId } });
  if (!business) throw new AuthError("Create your business profile first", 400);
  return business;
}

export async function GET() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ storefront: null });
    const storefront = await prisma.storefront.findUnique({ where: { businessId: business.id } });
    return NextResponse.json({ storefront });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await getOwnedBusiness(user.id);
    const body = await req.json().catch(() => null);
    const parsed = storefrontSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const slugTaken = await prisma.storefront.findFirst({
      where: { slug: parsed.data.slug, businessId: { not: business.id } },
    });
    if (slugTaken) {
      return NextResponse.json({ error: "That shop URL is already taken. Try another." }, { status: 409 });
    }

    const data = {
      slug: parsed.data.slug,
      headline: parsed.data.headline || null,
      themeColor: parsed.data.themeColor,
      logoUrl: parsed.data.logoUrl || null,
      bannerUrl: parsed.data.bannerUrl || null,
    };

    const existing = await prisma.storefront.findUnique({ where: { businessId: business.id } });
    const storefront = existing
      ? await prisma.storefront.update({ where: { id: existing.id }, data })
      : await prisma.storefront.create({ data: { ...data, businessId: business.id } });

    await prisma.business.update({ where: { id: business.id }, data: { onboardingStep: "PRODUCTS" } });

    return NextResponse.json({ storefront });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
