"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";

interface Business {
  id: string;
  name: string;
  status: string;
  owner: { name: string; email: string | null; phone: string | null };
  storefront: { isPublished: boolean } | null;
  _count: { products: number; transactions: number };
}

export default function AdminSmesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [q, setQ] = useState("");

  async function load(query?: string) {
    const { data } = await apiFetch<{ businesses: Business[] }>(`/api/admin/businesses${query ? `?q=${encodeURIComponent(query)}` : ""}`);
    setBusinesses(data.businesses ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount
    load();
  }, []);

  async function toggleStatus(b: Business) {
    const nextStatus = b.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await apiFetch(`/api/admin/businesses/${b.id}/status`, { method: "POST", body: { status: nextStatus } });
    load(q);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">SME accounts</h1>

      <div className="flex gap-2">
        <Input placeholder="Search by business name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button onClick={() => load(q)}>Search</Button>
      </div>

      <div className="space-y-3">
        {businesses.map((b) => (
          <Card key={b.id}>
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{b.name}</p>
                <p className="text-sm text-text-secondary">
                  {b.owner.name} · {b.owner.email ?? b.owner.phone}
                </p>
                <p className="text-xs text-text-secondary">
                  {b._count.products} products · {b._count.transactions} transactions ·{" "}
                  {b.storefront?.isPublished ? "Storefront published" : "Storefront not published"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={b.status === "ACTIVE" ? "success" : "error"}>{b.status}</Badge>
                <Button size="sm" variant="ghost" onClick={() => toggleStatus(b)}>
                  {b.status === "ACTIVE" ? "Suspend" : "Reactivate"}
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
