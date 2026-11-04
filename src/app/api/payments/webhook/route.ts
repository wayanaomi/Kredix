import { NextRequest, NextResponse } from "next/server";
import {
  verifyPaystackWebhookSignature,
} from "@/lib/payments/paystack";
import { finalizePaystackPayment } from "@/lib/payments/finalize";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    data?: { reference?: string };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;
  if (!reference) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  try {
    const result = await finalizePaystackPayment(reference);

    if (result.status === "NOT_FOUND") {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ received: true, status: result.status });
  } catch (error) {
    console.error(
      "Paystack webhook processing failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
