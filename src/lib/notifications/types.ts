export interface NotificationPayload {
  channel: "SMS" | "WHATSAPP" | "EMAIL";
  to: string;
  template: string;
  message: string;
}

export interface NotificationResult {
  status: "SENT" | "FAILED" | "SKIPPED_NO_PROVIDER";
  providerMessageId?: string;
  error?: string;
}

export interface NotificationAdapter {
  readonly configured: boolean;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
