"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { formatNgn } from "@/lib/money";

interface Metrics {
  totalRevenueMinor: number;
  salesCount: number;
  averageSaleMinor: number;
  totalExpensesMinor: number;
  estimatedMarginMinor: number | null;
  bestSellingProducts: { label: string; totalMinor: number; count: number }[];
  revenueTrend: { date: string; totalMinor: number }[];
  hasData: boolean;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  body: string;
}

interface ScoreFactor {
  key: string;
  label: string;
  value: number;
  weight: number;
  explanation: string;
}

interface ScoreResult {
  eligibility: "ELIGIBLE" | "NOT_ELIGIBLE";
  score: number | null;
  factors: ScoreFactor[];
  missingRequirements: string[];
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insufficientReason, setInsufficientReason] = useState<string | null>(null);
  const [score, setScore] = useState<ScoreResult | null>(null);

  useEffect(() => {
    apiFetch<{ metrics: Metrics | null }>("/api/analytics?days=30").then(({ data }) => setMetrics(data.metrics));
    apiFetch<{ recommendations: Recommendation[]; insufficientDataReason: string | null }>(
      "/api/recommendations"
    ).then(({ data }) => {
      setRecommendations(data.recommendations ?? []);
      setInsufficientReason(data.insufficientDataReason);
    });
    apiFetch<{ score: ScoreResult | null }>("/api/score").then(({ data }) => setScore(data.score));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics & insights</h1>
        <p className="text-sm text-text-secondary">Grounded entirely in your recorded ledger data.</p>
      </div>

      {!metrics?.hasData ? (
        <EmptyState title="More data needed" description="Record sales to see revenue trends and insights." />
      ) : (
        <>
          <Card>
            <CardBody>
              <p className="mb-4 font-semibold">Revenue trend (last 30 days)</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${(v / 100).toLocaleString()}`} />
                    <Tooltip formatter={(v) => formatNgn(Number(v))} />
                    <Line type="monotone" dataKey="totalMinor" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="mb-3 font-semibold">Best-selling products</p>
              {metrics.bestSellingProducts.length === 0 ? (
                <p className="text-sm text-text-secondary">No labelled sales recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {metrics.bestSellingProducts.map((p) => (
                    <li key={p.label} className="flex items-center justify-between text-sm">
                      <span>{p.label}</span>
                      <span className="font-semibold">{formatNgn(p.totalMinor)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-text-secondary">Expenses recorded</p>
                <p className="font-semibold">{formatNgn(metrics.totalExpensesMinor)}</p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Estimated margin</p>
                <p className="font-semibold">
                  {metrics.estimatedMarginMinor !== null
                    ? formatNgn(metrics.estimatedMarginMinor)
                    : "Record expenses to estimate"}
                </p>
              </div>
            </CardBody>
          </Card>
        </>
      )}

      <Card>
        <CardBody>
          <p className="mb-3 font-semibold">Recommendations</p>
          {insufficientReason ? (
            <p className="text-sm text-text-secondary">{insufficientReason}</p>
          ) : (
            <ul className="space-y-3">
              {recommendations.map((r) => (
                <li key={r.id} className="rounded-xl bg-surface-muted p-3">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-sm text-text-secondary">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <p className="font-semibold">Business Health Score</p>
            {score?.eligibility === "ELIGIBLE" && <Badge tone="brand">{score.score}/100</Badge>}
          </div>
          {score?.eligibility === "NOT_ELIGIBLE" ? (
            <div className="mt-2 text-sm text-text-secondary">
              <p>Insufficient data to calculate a reliable score yet:</p>
              <ul className="mt-1 list-inside list-disc">
                {score.missingRequirements.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ) : (
            score && (
              <ul className="mt-3 space-y-2">
                {score.factors.map((f) => (
                  <li key={f.key} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{f.label}</span>
                      <span>{f.value}/100</span>
                    </div>
                    <p className="text-text-secondary">{f.explanation}</p>
                  </li>
                ))}
              </ul>
            )
          )}
        </CardBody>
      </Card>
    </div>
  );
}
