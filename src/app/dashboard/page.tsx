"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { formatNgn } from "@/lib/money";

interface Metrics {
  totalRevenueMinor: number;
  salesCount: number;
  averageSaleMinor: number;
  hasData: boolean;
}

interface ScoreResult {
  eligibility: "ELIGIBLE" | "NOT_ELIGIBLE";
  score: number | null;
}

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);

  useEffect(() => {
    apiFetch<{ metrics: Metrics | null }>("/api/analytics?days=30").then(({ data }) => setMetrics(data.metrics));
    apiFetch<{ score: ScoreResult | null }>("/api/score").then(({ data }) => setScore(data.score));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-text-secondary">Last 30 days</p>
      </div>

      {!metrics?.hasData ? (
        <EmptyState
          title="Your first sale will appear here"
          description="Record a sale in your ledger or publish your storefront to start seeing your business performance."
          action={
            <Link href="/dashboard/ledger" className="font-semibold text-brand-primary">
              Go to sales ledger →
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardBody>
              <p className="text-sm text-text-secondary">Total recorded revenue</p>
              <p className="mt-1 text-2xl font-bold">{formatNgn(metrics.totalRevenueMinor)}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-text-secondary">Sales recorded</p>
              <p className="mt-1 text-2xl font-bold">{metrics.salesCount}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-text-secondary">Average sale</p>
              <p className="mt-1 text-2xl font-bold">{formatNgn(metrics.averageSaleMinor)}</p>
            </CardBody>
          </Card>
        </div>
      )}

      <Card>
        <CardBody className="flex items-center justify-between">
          <div>
            <p className="font-semibold">Business Health Score</p>
            <p className="text-sm text-text-secondary">
              {score?.eligibility === "ELIGIBLE"
                ? "Your explainable score is ready."
                : "More transaction history is needed to calculate a reliable score."}
            </p>
          </div>
          {score?.eligibility === "ELIGIBLE" ? (
            <Badge tone="brand">{score.score}/100</Badge>
          ) : (
            <Link href="/dashboard/analytics" className="font-semibold text-brand-primary">
              View details →
            </Link>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
