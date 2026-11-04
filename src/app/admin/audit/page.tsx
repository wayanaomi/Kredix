"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api-client";

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorRole: string | null;
  createdAt: string;
  actor: { name: string } | null;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    apiFetch<{ logs: AuditLogEntry[] }>("/api/admin/audit").then(({ data }) => setLogs(data.logs ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Audit log</h1>
      <Card>
        <CardBody>
          <ul className="divide-y divide-border">
            {logs.map((l) => (
              <li key={l.id} className="py-2 text-sm">
                <span className="font-medium">{l.action}</span> on {l.entityType}
                {l.entityId ? ` (${l.entityId.slice(0, 8)}…)` : ""} by {l.actor?.name ?? l.actorRole ?? "system"} ·{" "}
                {new Date(l.createdAt).toLocaleString("en-NG")}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
