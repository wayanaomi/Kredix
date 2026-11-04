"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { formatNgn } from "@/lib/money";

interface StatusHistory {
  id: string;
  toStatus: string;
  createdAt: string;
  note: string | null;
}

interface Referral {
  id: string;
  status: string;
  lender: { name: string };
}

interface Application {
  id: string;
  reference: string;
  requestedAmountMinor: number;
  purpose: string;
  status: string;
  createdAt: string;
  statusHistory: StatusHistory[];
  referrals: Referral[];
}

const STATUS_TONE: Record<string, "neutral" | "success" | "warning" | "error" | "brand"> = {
  SUBMITTED: "neutral",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  DECLINED: "error",
  DISBURSED: "brand",
};

export default function FinancingPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [form, setForm] = useState({ requestedAmountNaira: "", purpose: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data } = await apiFetch<{ applications: Application[] }>("/api/financing");
    setApplications(data.applications ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError("You must consent to sharing your Financial Passport data with a lender");
      return;
    }
    setLoading(true);
    const { ok, data } = await apiFetch("/api/financing/apply", {
      method: "POST",
      body: { ...form, consentAccepted: true },
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Could not submit application");
      return;
    }
    setForm({ requestedAmountNaira: "", purpose: "" });
    setConsent(false);
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financing</h1>
        <p className="text-sm text-text-secondary">
          Kredix is not a lender. Applications are referred to partner lenders for review.
        </p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount requested (₦)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                required
                value={form.requestedAmountNaira}
                onChange={(e) => setForm((f) => ({ ...f, requestedAmountNaira: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="purpose">What is this financing for?</Label>
              <Textarea
                id="purpose"
                rows={3}
                required
                value={form.purpose}
                onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
              />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>I consent to sharing my Financial Passport data with a prospective lender for review.</span>
            </label>
            <FieldError message={error ?? undefined} />
            <Button type="submit" isLoading={loading}>
              Submit application
            </Button>
          </form>
        </CardBody>
      </Card>

      {applications.length === 0 ? (
        <EmptyState
          title="No financing applications yet"
          description="Submit an application above once you're ready to explore financing."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{app.reference}</p>
                    <p className="text-sm text-text-secondary">{formatNgn(app.requestedAmountMinor)}</p>
                  </div>
                  <Badge tone={STATUS_TONE[app.status] ?? "neutral"}>{app.status.replace("_", " ")}</Badge>
                </div>
                <p className="mt-2 text-sm text-text-secondary">{app.purpose}</p>
                {app.referrals.length > 0 && (
                  <p className="mt-2 text-sm">Referred to: {app.referrals.map((r) => r.lender.name).join(", ")}</p>
                )}
                <ul className="mt-3 space-y-1 border-t border-border pt-3 text-xs text-text-secondary">
                  {app.statusHistory.map((h) => (
                    <li key={h.id}>
                      {new Date(h.createdAt).toLocaleString("en-NG")} — {h.toStatus.replace("_", " ")}
                      {h.note && ` (${h.note})`}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
