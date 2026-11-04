import { prisma } from "@/lib/db";
import { getEnv } from "@/lib/env";
import type { NotificationAdapter, NotificationPayload, NotificationResult } from "./types";

/**
 * No SMS/WhatsApp provider credentials were available in this environment. This adapter never
 * claims a message was sent — it always returns SKIPPED_NO_PROVIDER so notifications are
 * honestly recorded rather than silently dropped or falsely marked delivered.
 */
class NoopNotificationAdapter implements NotificationAdapter {
  get configured(): boolean {
    return false;
  }

  async send(): Promise<NotificationResult> {
    return { status: "SKIPPED_NO_PROVIDER" };
  }
}

function getAdapter(): NotificationAdapter {
  const env = getEnv();
  if (env.NOTIFICATIONS_PROVIDER === "none" || !env.NOTIFICATIONS_API_KEY) {
    return new NoopNotificationAdapter();
  }
  // A real provider adapter (e.g. Termii, Africa's Talking, Twilio WhatsApp) would be
  // implemented here and selected based on env.NOTIFICATIONS_PROVIDER once credentials exist.
  return new NoopNotificationAdapter();
}

export const templates = {
  verificationCode: (code: string) => `Your Kredix verification code is ${code}. It expires in 10 minutes.`,
  financingStatusUpdate: (reference: string, status: string) =>
    `Kredix: your financing application ${reference} status changed to ${status}.`,
  weeklySummary: (businessName: string, revenueFormatted: string, salesCount: number) =>
    `Kredix summary for ${businessName}: ${salesCount} recorded sales totalling ${revenueFormatted} this week.`,
};

export async function sendNotification(params: {
  userId?: string;
  businessId?: string;
  payload: NotificationPayload;
}) {
  const adapter = getAdapter();
  const result = await adapter.send(params.payload);

  await prisma.notification.create({
    data: {
      userId: params.userId,
      businessId: params.businessId,
      channel: params.payload.channel,
      template: params.payload.template,
      payloadJson: JSON.stringify({ to: params.payload.to, message: params.payload.message }),
      status: result.status,
      sentAt: result.status === "SENT" ? new Date() : null,
    },
  });

  return result;
}
