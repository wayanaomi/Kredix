import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { FINANCING_STATUS_TRANSITIONS } from "@/lib/enums";
import { writeAudit } from "@/lib/audit";

export function generateApplicationReference(): string {
  return `KRX-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export class InvalidTransitionError extends Error {}

export async function transitionFinancingStatus(params: {
  applicationId: string;
  toStatus: string;
  changedById: string | null;
  changedByRole: string;
  note?: string;
}) {
  const application = await prisma.financingApplication.findUniqueOrThrow({
    where: { id: params.applicationId },
  });

  const allowed = FINANCING_STATUS_TRANSITIONS[application.status] ?? [];
  if (!allowed.includes(params.toStatus)) {
    throw new InvalidTransitionError(
      `Cannot transition from ${application.status} to ${params.toStatus}`
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.financingApplication.update({
      where: { id: params.applicationId },
      data: { status: params.toStatus },
    }),
    prisma.applicationStatusHistory.create({
      data: {
        applicationId: params.applicationId,
        fromStatus: application.status,
        toStatus: params.toStatus,
        changedById: params.changedById,
        note: params.note,
      },
    }),
  ]);

  await writeAudit({
    actorUserId: params.changedById,
    actorRole: params.changedByRole,
    action: "FINANCING_STATUS_UPDATED",
    entityType: "FinancingApplication",
    entityId: params.applicationId,
    metadata: { from: application.status, to: params.toStatus },
  });

  return updated;
}
