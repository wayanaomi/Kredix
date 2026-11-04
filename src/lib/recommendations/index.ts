import { prisma } from "@/lib/db";
import type { RecommendationType } from "@/lib/enums";

export interface RecommendationOutput {
  type: RecommendationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  periodStart?: Date;
  periodEnd?: Date;
}

const MIN_TRANSACTIONS_FOR_INSIGHTS = 5;

/**
 * Deterministic, rule-based recommendation engine. No external AI/LLM call is made (see
 * docs/assumptions.md) — every recommendation is derived directly from persisted ledger data
 * and cites the specific figures and period behind it.
 */
export async function generateRecommendations(businessId: string): Promise<{
  recommendations: RecommendationOutput[];
  insufficientDataReason: string | null;
}> {
  const transactions = await prisma.transaction.findMany({
    where: { businessId },
    orderBy: { occurredAt: "asc" },
  });

  if (transactions.length < MIN_TRANSACTIONS_FOR_INSIGHTS) {
    return {
      recommendations: [],
      insufficientDataReason: `At least ${MIN_TRANSACTIONS_FOR_INSIGHTS} recorded transactions are needed to generate a reliable recommendation (currently ${transactions.length}). Keep recording sales in your ledger.`,
    };
  }

  const recommendations: RecommendationOutput[] = [];
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  // Top product (by revenue, from labelled transactions)
  const productTotals = new Map<string, number>();
  for (const t of transactions) {
    if (!t.productLabel) continue;
    productTotals.set(t.productLabel, (productTotals.get(t.productLabel) ?? 0) + t.amountMinor);
  }
  if (productTotals.size > 0) {
    const [topProduct, topAmount] = Array.from(productTotals.entries()).sort((a, b) => b[1] - a[1])[0];
    recommendations.push({
      type: "TOP_PRODUCT",
      title: `"${topProduct}" is your strongest seller`,
      body: `"${topProduct}" has generated the highest recorded revenue across your full sales history. Consider keeping it well stocked and featured on your storefront.`,
      data: { product: topProduct, totalMinor: topAmount },
    });
  }

  // Revenue decline: compare last 14 days vs prior 14 days
  const recent = transactions.filter((t) => t.occurredAt >= fourteenDaysAgo);
  const prior = transactions.filter((t) => t.occurredAt >= twentyEightDaysAgo && t.occurredAt < fourteenDaysAgo);
  const recentTotal = recent.reduce((a, t) => a + t.amountMinor, 0);
  const priorTotal = prior.reduce((a, t) => a + t.amountMinor, 0);
  if (prior.length >= 2 && priorTotal > 0) {
    const changePct = ((recentTotal - priorTotal) / priorTotal) * 100;
    if (changePct <= -20) {
      recommendations.push({
        type: "REVENUE_DECLINE",
        title: "Recorded revenue has declined recently",
        body: `Recorded revenue for the last 14 days is ${Math.abs(changePct).toFixed(
          0
        )}% lower than the prior 14 days. Review recent pricing, stock availability, or promotion activity.`,
        data: { recentTotalMinor: recentTotal, priorTotalMinor: priorTotal, changePct },
        periodStart: fourteenDaysAgo,
        periodEnd: now,
      });
    }
  }

  // Inventory review: products with low/zero stock but recent sales
  const products = await prisma.product.findMany({ where: { businessId, deletedAt: null } });
  const lowStock = products.filter((p) => p.inventoryQty !== null && p.inventoryQty <= 2 && p.isAvailable);
  if (lowStock.length > 0) {
    recommendations.push({
      type: "INVENTORY_REVIEW",
      title: `${lowStock.length} product${lowStock.length > 1 ? "s are" : " is"} low on stock`,
      body: `${lowStock
        .map((p) => p.name)
        .join(", ")} ${lowStock.length > 1 ? "have" : "has"} 2 or fewer units recorded in inventory. Restock soon to avoid missed sales.`,
      data: { products: lowStock.map((p) => ({ id: p.id, name: p.name, qty: p.inventoryQty })) },
    });
  }

  // Sales period worth investigating: best single day in the last 28 days
  const byDay = new Map<string, number>();
  for (const t of transactions.filter((t) => t.occurredAt >= twentyEightDaysAgo)) {
    const key = t.occurredAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + t.amountMinor);
  }
  if (byDay.size > 0) {
    const [bestDay, bestAmount] = Array.from(byDay.entries()).sort((a, b) => b[1] - a[1])[0];
    recommendations.push({
      type: "SALES_PERIOD",
      title: `${bestDay} was your best recorded sales day recently`,
      body: `Recorded revenue peaked on ${bestDay} over the last 28 days. Consider what drove sales that day (promotion, restock, day of week) and repeat it.`,
      data: { date: bestDay, amountMinor: bestAmount },
      periodStart: twentyEightDaysAgo,
      periodEnd: now,
    });
  }

  // Incomplete records
  const incomplete = transactions.filter((t) => !t.productLabel || t.amountMinor <= 0).length;
  if (incomplete > 0) {
    recommendations.push({
      type: "INCOMPLETE_RECORDS",
      title: `${incomplete} transaction${incomplete > 1 ? "s are" : " is"} missing details`,
      body: `${incomplete} recorded sale${incomplete > 1 ? "s" : ""} ${incomplete > 1 ? "are" : "is"} missing a product description or valid amount. Complete these records to improve the accuracy of your analytics and Business Health Score.`,
      data: { incompleteCount: incomplete },
    });
  }

  return { recommendations, insufficientDataReason: null };
}

export async function persistRecommendations(businessId: string) {
  const { recommendations } = await generateRecommendations(businessId);
  await prisma.$transaction([
    prisma.recommendation.deleteMany({ where: { businessId } }),
    ...recommendations.map((r) =>
      prisma.recommendation.create({
        data: {
          businessId,
          type: r.type,
          title: r.title,
          body: r.body,
          dataJson: JSON.stringify(r.data),
          periodStart: r.periodStart,
          periodEnd: r.periodEnd,
        },
      })
    ),
  ]);
  return recommendations;
}
