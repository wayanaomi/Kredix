import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { businessProfileSchema } from "@/lib/validation/business";

export async function GET() {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    return NextResponse.json({ business });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const body = await req.json().catch(() => null);
    const parsed = businessProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const existing = await prisma.business.findFirst({ where: { ownerId: user.id } });
    const data = { ...parsed.data, description: parsed.data.description || null, onboardingStep: "STOREFRONT" };

    const business = existing
      ? await prisma.business.update({ where: { id: existing.id }, data })
      : await prisma.business.create({ data: { ...data, ownerId: user.id } });

    return NextResponse.json({ business });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
