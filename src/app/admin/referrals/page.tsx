"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";
import { formatNgn } from "@/lib/money";

interface Lender {
  id: string;
  name: string;
}

interface Application {
  id: string;
  reference: string;
  status: string;
  requestedAmountMinor: number;
  business: { name: string };
  referrals: { lender: Lender }[];
}

export default function AdminReferralsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [lenders, setLenders] = useState<Lender[]>([]);
  const [selected, setSelected] = useState<Record<string, string>>({});

  async function load() {
    const { data } = await apiFetch<{ applications: Application[]; lenders: Lender[] }>("/api/admin/referrals");
    setApplications(data.applications ?? []);
    setLenders(data.lenders ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount
    load();
  }, []);

  async function assign(applicationId: string) {
    const lenderId = selected[applicationId];
    if (!lenderId) return;
    await apiFetch("/api/admin/referrals", { method: "POST", body: { applicationId, lenderId } });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Financing referrals</h1>

      {lenders.length === 0 && (
        <p className="text-sm text-text-secondary">
          No partner lenders are set up yet. Add one via the seed script (see README).
        </p>
      )}

      <div className="space-y-3">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{app.business.name}</p>
                  <p className="text-sm text-text-secondary">
                    {app.reference} · {formatNgn(app.requestedAmountMinor)}
                  </p>
                </div>
                <Badge>{app.status.replace("_", " ")}</Badge>
              </div>

              {app.referrals.length > 0 ? (
                <p className="mt-2 text-sm">Referred to: {app.referrals.map((r) => r.lender.name).join(", ")}</p>
              ) : (
                lenders.length > 0 && (
                  <div className="mt-3 flex gap-2">
                    <select
                      className="rounded-lg border border-border px-3 py-2 text-sm"
                      value={selected[app.id] ?? ""}
                      onChange={(e) => setSelected((s) => ({ ...s, [app.id]: e.target.value }))}
                    >
                      <option value="">Select a lender…</option>
                      {lenders.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" onClick={() => assign(app.id)}>
                      Assign
                    </Button>
                  </div>
                )
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
