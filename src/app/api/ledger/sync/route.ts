import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { manualSaleSchema } from "@/lib/validation/sales";
import { nairaToKobo } from "@/lib/money";

/**
 * Idempotent sync endpoint for manually/offline-recorded sales. Uniquely keyed by the
 * client-generated clientTxnId (Transaction.clientTxnId @unique) — re-POSTing the same sale
 * after a retry is a safe no-op, never a duplicate ledger entry.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return NextResponse.json({ error: "Create your business profile first" }, { status: 400 });

    const body = await req.json().catch(() => null);
    const parsed = manualSaleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const existing = await prisma.transaction.findUnique({ where: { clientTxnId: parsed.data.clientTxnId } });
    if (existing) {
      // Already synced in a prior attempt — idempotent no-op.
      return NextResponse.json({ transaction: existing, alreadySynced: true });
    }

    const transaction = await prisma.transaction.create({
      data: {
        businessId: business.id,
        clientTxnId: parsed.data.clientTxnId,
        source: "MANUAL",
        amountMinor: nairaToKobo(parsed.data.amountNaira),
        productLabel: parsed.data.productLabel,
        occurredAt: new Date(parsed.data.occurredAt),
        syncStatus: "SYNCED",
        recordedById: user.id,
      },
    });

    return NextResponse.json({ transaction });
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
