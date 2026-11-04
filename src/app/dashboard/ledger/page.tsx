"use client";

import { useEffect, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch } from "@/lib/api-client";
import { formatNgn } from "@/lib/money";
import {
  queuePendingSale,
  getPendingSales,
  syncPendingSales,
  type PendingSale,
} from "@/lib/offline/queue";

interface Transaction {
  id: string;
  occurredAt: string;
  amountMinor: number;
  productLabel: string | null;
  source: string;
  syncStatus: string;
}

export default function LedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pending, setPending] = useState<PendingSale[]>([]);
  const [expenseForm, setExpenseForm] = useState({ category: "", amountNaira: "" });
  const [expenseStatus, setExpenseStatus] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [form, setForm] = useState({ productLabel: "", amountNaira: "" });
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const refreshPending = useCallback(async () => {
    setPending(await getPendingSales());
  }, []);

  const loadServerTransactions = useCallback(async () => {
    const { data } = await apiFetch<{ transactions: Transaction[] }>("/api/ledger");
    setTransactions(data.transactions ?? []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading navigator.onLine on mount
    setIsOnline(navigator.onLine);
    const onOnline = () => {
      setIsOnline(true);
      void runSync();
    };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    loadServerTransactions();
    refreshPending();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runSync() {
    setSyncing(true);
    await syncPendingSales();
    setSyncing(false);
    await refreshPending();
    await loadServerTransactions();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.productLabel || !form.amountNaira || Number(form.amountNaira) <= 0) {
      setError("Enter a description and an amount greater than zero");
      return;
    }

    const sale: PendingSale = {
      clientTxnId: uuidv4(),
      productLabel: form.productLabel,
      amountNaira: Number(form.amountNaira),
      occurredAt: new Date().toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await queuePendingSale(sale);
    setForm({ productLabel: "", amountNaira: "" });
    await refreshPending();

    if (navigator.onLine) {
      await runSync();
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales ledger</h1>
          <p className="text-sm text-text-secondary">Record every sale — online or offline.</p>
        </div>
        <Badge tone={isOnline ? "success" : "warning"}>{isOnline ? "Online" : "Offline"}</Badge>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="productLabel">What did you sell?</Label>
              <Input
                id="productLabel"
                value={form.productLabel}
                onChange={(e) => setForm((f) => ({ ...f, productLabel: e.target.value }))}
                placeholder="2x Ankara wrapper"
              />
            </div>
            <div>
              <Label htmlFor="amountNaira">Amount (₦)</Label>
              <Input
                id="amountNaira"
                type="number"
                min={0}
                step="0.01"
                value={form.amountNaira}
                onChange={(e) => setForm((f) => ({ ...f, amountNaira: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-3">
              <FieldError message={error ?? undefined} />
              <Button type="submit">Record sale</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="mb-3 font-semibold">Record an expense (optional)</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setExpenseStatus(null);
              if (!expenseForm.category || !expenseForm.amountNaira) {
                setExpenseStatus("Enter a category and amount");
                return;
              }
              const { ok } = await apiFetch("/api/expenses", {
                method: "POST",
                body: {
                  category: expenseForm.category,
                  amountNaira: expenseForm.amountNaira,
                  occurredAt: new Date().toISOString(),
                },
              });
              setExpenseStatus(ok ? "Expense recorded" : "Could not record expense");
              if (ok) setExpenseForm({ category: "", amountNaira: "" });
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="sm:col-span-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={expenseForm.category}
                onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Restock, rent, transport…"
              />
            </div>
            <div>
              <Label htmlFor="expenseAmount">Amount (₦)</Label>
              <Input
                id="expenseAmount"
                type="number"
                min={0}
                value={expenseForm.amountNaira}
                onChange={(e) => setExpenseForm((f) => ({ ...f, amountNaira: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-3 flex items-center gap-3">
              <Button type="submit" size="sm" variant="ghost">
                Record expense
              </Button>
              {expenseStatus && <span className="text-sm text-text-secondary">{expenseStatus}</span>}
            </div>
          </form>
        </CardBody>
      </Card>

      {pending.filter((p) => p.status !== "synced").length > 0 && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                Pending sync ({pending.filter((p) => p.status !== "synced").length})
              </p>
              <Button size="sm" variant="ghost" onClick={runSync} isLoading={syncing}>
                Retry sync
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {pending
                .filter((p) => p.status !== "synced")
                .map((p) => (
                  <li key={p.clientTxnId} className="flex items-center justify-between text-sm">
                    <span>
                      {p.productLabel} — ₦{p.amountNaira.toLocaleString("en-NG")}
                    </span>
                    <Badge tone={p.status === "failed" ? "error" : "warning"}>
                      {p.status === "failed" ? `Failed: ${p.error ?? "retry"}` : "Pending"}
                    </Badge>
                  </li>
                ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {transactions.length === 0 ? (
        <EmptyState title="No sales yet" description="Your first sale will appear here." />
      ) : (
        <Card>
          <CardBody>
            <ul className="divide-y divide-border">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{t.productLabel ?? "Sale"}</p>
                    <p className="text-text-secondary">{new Date(t.occurredAt).toLocaleString("en-NG")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatNgn(t.amountMinor)}</p>
                    <Badge tone={t.source === "MANUAL" ? "neutral" : "brand"}>
                      {t.source === "ONLINE_PAYMENT" ? "Online payment" : "Manual"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
