import { prisma } from "@/lib/db";

export interface AnalyticsPeriod {
  from: Date;
  to: Date;
}

export interface DashboardMetrics {
  totalRevenueMinor: number;
  salesCount: number;
  averageSaleMinor: number;
  totalExpensesMinor: number;
  estimatedMarginMinor: number | null; // null when there is no expense data for the period
  bestSellingProducts: { label: string; totalMinor: number; count: number }[];
  revenueTrend: { date: string; totalMinor: number }[];
  recentTransactions: {
    id: string;
    occurredAt: Date;
    amountMinor: number;
    productLabel: string | null;
    source: string;
    syncStatus: string;
  }[];
  hasData: boolean;
}

export async function getDashboardMetrics(businessId: string, period: AnalyticsPeriod): Promise<DashboardMetrics> {
  const transactions = await prisma.transaction.findMany({
    where: { businessId, occurredAt: { gte: period.from, lte: period.to } },
    orderBy: { occurredAt: "desc" },
  });

  const expenses = await prisma.expense.findMany({
    where: { businessId, occurredAt: { gte: period.from, lte: period.to } },
  });

  const totalRevenueMinor = transactions.reduce((a, t) => a + t.amountMinor, 0);
  const salesCount = transactions.length;
  const averageSaleMinor = salesCount > 0 ? Math.round(totalRevenueMinor / salesCount) : 0;
  const totalExpensesMinor = expenses.reduce((a, e) => a + e.amountMinor, 0);
  const estimatedMarginMinor = expenses.length > 0 ? totalRevenueMinor - totalExpensesMinor : null;

  const productTotals = new Map<string, { totalMinor: number; count: number }>();
  for (const t of transactions) {
    if (!t.productLabel) continue;
    const entry = productTotals.get(t.productLabel) ?? { totalMinor: 0, count: 0 };
    entry.totalMinor += t.amountMinor;
    entry.count += 1;
    productTotals.set(t.productLabel, entry);
  }
  const bestSellingProducts = Array.from(productTotals.entries())
    .map(([label, v]) => ({ label, ...v }))
    .sort((a, b) => b.totalMinor - a.totalMinor)
    .slice(0, 5);

  const byDay = new Map<string, number>();
  for (const t of transactions) {
    const key = t.occurredAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + t.amountMinor);
  }
  const revenueTrend = Array.from(byDay.entries())
    .map(([date, totalMinor]) => ({ date, totalMinor }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenueMinor,
    salesCount,
    averageSaleMinor,
    totalExpensesMinor,
    estimatedMarginMinor,
    bestSellingProducts,
    revenueTrend,
    recentTransactions: transactions.slice(0, 10).map((t) => ({
      id: t.id,
      occurredAt: t.occurredAt,
      amountMinor: t.amountMinor,
      productLabel: t.productLabel,
      source: t.source,
      syncStatus: t.syncStatus,
    })),
    hasData: salesCount > 0,
  };
}
