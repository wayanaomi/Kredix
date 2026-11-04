"use client";

import { openDB, type IDBPDatabase } from "idb";

export interface PendingSale {
  clientTxnId: string;
  productLabel: string;
  amountNaira: number;
  occurredAt: string;
  status: "pending" | "synced" | "failed";
  error?: string;
  createdAt: string;
}

const DB_NAME = "kredix-offline";
const STORE = "pending-sales";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "clientTxnId" });
        }
      },
    });
  }
  return dbPromise;
}

export async function queuePendingSale(sale: PendingSale) {
  const db = await getDb();
  await db.put(STORE, sale);
}

export async function getPendingSales(): Promise<PendingSale[]> {
  const db = await getDb();
  return db.getAll(STORE);
}

export async function updateSaleStatus(clientTxnId: string, status: PendingSale["status"], error?: string) {
  const db = await getDb();
  const existing = await db.get(STORE, clientTxnId);
  if (!existing) return;
  await db.put(STORE, { ...existing, status, error });
}

export async function removeSyncedSale(clientTxnId: string) {
  const db = await getDb();
  await db.delete(STORE, clientTxnId);
}

/** Posts every pending/failed sale to the server. Idempotent: safe to call repeatedly. */
export async function syncPendingSales(): Promise<{ synced: number; failed: number }> {
  const pending = (await getPendingSales()).filter((s) => s.status !== "synced");
  let synced = 0;
  let failed = 0;

  for (const sale of pending) {
    try {
      const res = await fetch("/api/ledger/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      });
      if (res.ok) {
        await updateSaleStatus(sale.clientTxnId, "synced");
        synced += 1;
      } else {
        const body = await res.json().catch(() => ({}));
        await updateSaleStatus(sale.clientTxnId, "failed", body.error ?? `HTTP ${res.status}`);
        failed += 1;
      }
    } catch {
      await updateSaleStatus(sale.clientTxnId, "failed", "Network error — will retry");
      failed += 1;
    }
  }

  return { synced, failed };
}
