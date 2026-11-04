import { prisma } from "@/lib/db";

interface AuditEntry {
  actorUserId?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

/** Writes an audit trail entry. Never pass secrets, tokens, or full payloads as metadata. */
export async function writeAudit(entry: AuditEntry) {
  await prisma.auditLog.create({
    data: {
      actorUserId: entry.actorUserId ?? null,
      actorRole: entry.actorRole ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadataJson: entry.metadata ? JSON.stringify(entry.metadata) : null,
    },
  });
}
