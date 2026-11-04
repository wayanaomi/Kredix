"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { formatNgn } from "@/lib/money";

interface PassportData {
  businessName: string;
  healthScore: number | null;
  totalRevenueFormatted: string;
  tenureMonths: number | null;
}

interface Referral {
  id: string;
  status: string;
  application: {
    reference: string;
    requestedAmountMinor: number;
    purpose: string;
    business: { name: string; location: string | null };
  };
  passportData: PassportData | null;
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "error" | "brand"> = {
  SUBMITTED: "neutral",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  DECLINED: "error",
  DISBURSED: "brand",
};

const NEXT_STATUSES: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW", "DECLINED"],
  UNDER_REVIEW: ["APPROVED", "DECLINED"],
  APPROVED: ["DISBURSED", "DECLINED"],
  DISBURSED: [],
  DECLINED: [],
};

export default function LenderQueuePage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [note, setNote] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await apiFetch<{ referrals: Referral[] }>("/api/lender/referrals");
    setReferrals(data.referrals ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await apiFetch(`/api/lender/referrals/${id}/status`, { method: "POST", body: { status, note: note[id] ?? "" } });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Referred applicants</h1>

      {referrals.length === 0 ? (
        <EmptyState title="No referrals yet" description="Applications referred to your institution will appear here." />
      ) : (
        <div className="space-y-4">
          {referrals.map((r) => (
            <Card key={r.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{r.application.business.name}</p>
                    <p className="text-sm text-text-secondary">{r.application.reference}</p>
                  </div>
                  <Badge tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status.replace("_", " ")}</Badge>
                </div>
                <p className="mt-2 text-sm">
                  Requested: <strong>{formatNgn(r.application.requestedAmountMinor)}</strong>
                </p>
                <p className="text-sm text-text-secondary">{r.application.purpose}</p>

                {r.passportData ? (
                  <div className="mt-3 rounded-xl bg-surface-muted p-3 text-sm">
                    <p>Health Score: {r.passportData.healthScore ?? "—"}/100</p>
                    <p>Recorded revenue: {r.passportData.totalRevenueFormatted}</p>
                    <p>Tenure: {r.passportData.tenureMonths ?? "—"} months</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-text-secondary">No Financial Passport available yet.</p>
                )}

                {NEXT_STATUSES[r.status]?.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      placeholder="Decision note (optional)"
                      className="flex-1 rounded-lg border border-border px-3 py-2 text-sm"
                      value={note[r.id] ?? ""}
                      onChange={(e) => setNote((n) => ({ ...n, [r.id]: e.target.value }))}
                    />
                    {NEXT_STATUSES[r.status].map((s) => (
                      <Button key={s} size="sm" onClick={() => updateStatus(r.id, s)}>
                        {s.replace("_", " ")}
                      </Button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
