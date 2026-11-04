import { createHmac, timingSafeEqual } from "node:crypto";
import { getEnv } from "@/lib/env";

const PAYSTACK_API = "https://api.paystack.co";

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata?: {
      orderReference?: string;
    };
  };
}

export interface PaystackVerification {
  status: "SUCCESS" | "FAILED" | "PENDING";
  reference: string;
  amountMinor: number;
  currency: string;
  orderReference?: string;
}

function getSecretKey(): string {
  return getEnv().PSP_SECRET_KEY;
}

export function isPaystackConfigured(): boolean {
  const env = getEnv();

  return Boolean(
    env.PSP_SECRET_KEY &&
    env.PSP_SECRET_KEY.startsWith("sk_") &&
    env.NEXT_PUBLIC_APP_URL
  );
}

export async function initializePaystackTransaction(input: {
  email: string;
  reference: string;
  amountMinor: number;
  orderId: string;
}): Promise<{ authorizationUrl: string; reference: string }> {
  if (!isPaystackConfigured()) {
    throw new Error("Paystack is not configured.");
  }

  if (!input.email || input.amountMinor <= 0) {
    throw new Error("A valid customer email and payment amount are required.");
  }

  const env = getEnv();
  const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");

  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amountMinor,
      currency: "NGN",
      reference: input.reference,
      callback_url: `${appUrl}/pay/result`,
      metadata: {
        orderReference: input.orderId,
      },
    }),
    cache: "no-store",
  });

  const result = (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !result.status || !result.data?.authorization_url) {
    throw new Error("Paystack could not initialize this payment.");
  }

  if (result.data.reference !== input.reference) {
    throw new Error("Paystack returned an unexpected payment reference.");
  }

  return {
    authorizationUrl: result.data.authorization_url,
    reference: result.data.reference,
  };
}

export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerification> {
  if (!isPaystackConfigured()) {
    throw new Error("Paystack is not configured.");
  }

  const response = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const result = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !result.status || !result.data) {
    throw new Error("Could not verify payment with Paystack.");
  }

  const data = result.data;

  let status: PaystackVerification["status"] = "PENDING";

  if (data.status === "success") {
    status = "SUCCESS";
  } else if (
    data.status === "failed" ||
    data.status === "abandoned"
  ) {
    status = "FAILED";
  }

  return {
    status,
    reference: data.reference,
    amountMinor: data.amount,
    currency: data.currency,
    orderReference: data.metadata?.orderReference,
  };
}

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const env = getEnv();
  const secret = env.PSP_WEBHOOK_SECRET || env.PSP_SECRET_KEY;

  if (!secret || !signature) return false;

  const expected = createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected, "hex");
  const suppliedBuffer = Buffer.from(signature, "hex");

  if (
    expectedBuffer.length === 0 ||
    expectedBuffer.length !== suppliedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, suppliedBuffer);
}
