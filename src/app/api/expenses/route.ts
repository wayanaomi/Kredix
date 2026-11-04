import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { expenseSchema } from "@/lib/validation/sales";
import { nairaToKobo } from "@/lib/money";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

    const body = await req.json().catch(() => null);
    const parsed = expenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        businessId: business.id,
        amountMinor: nairaToKobo(parsed.data.amountNaira),
        category: parsed.data.category,
        occurredAt: new Date(parsed.data.occurredAt),
        note: parsed.data.note || null,
      },
    });

    return NextResponse.json({ expense });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
