import { NextRequest, NextResponse } from "next/server";
import { finalizePaystackPayment } from "@/lib/payments/finalize";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("reference");

  if (!reference || reference.length > 150) {
    return NextResponse.json({ error: "Invalid payment reference" }, { status: 400 });
  }

  try {
    const result = await finalizePaystackPayment(reference);

    if (result.status === "NOT_FOUND") {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (result.status === "VERIFICATION_MISMATCH") {
      return NextResponse.json(
        { status: "PENDING", message: "Payment verification requires further review." },
        { status: 202 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Payment verification failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Unable to verify payment at this time." },
      { status: 502 }
    );
  }
}
