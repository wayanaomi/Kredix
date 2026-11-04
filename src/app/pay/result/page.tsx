"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type PaymentState = "CHECKING" | "SUCCESS" | "FAILED" | "PENDING" | "ERROR";

function Result() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<PaymentState>("CHECKING");

  const checkPayment = useCallback(async () => {
    if (!reference) {
      setStatus("ERROR");
      return;
    }

    try {
      const response = await fetch(
        `/api/payments/verify?reference=${encodeURIComponent(reference)}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (data.status === "SUCCESS") setStatus("SUCCESS");
      else if (data.status === "FAILED") setStatus("FAILED");
      else if (data.status === "PENDING") setStatus("PENDING");
      else setStatus("ERROR");
    } catch {
      setStatus("ERROR");
    }
  }, [reference]);

  useEffect(() => {
    let active = true;

    if (!reference) {
      Promise.resolve().then(() => {
        if (active) setStatus("ERROR");
      });
      return () => {
        active = false;
      };
    }

    fetch(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        if (data.status === "SUCCESS") setStatus("SUCCESS");
        else if (data.status === "FAILED") setStatus("FAILED");
        else if (data.status === "PENDING") setStatus("PENDING");
        else setStatus("ERROR");
      })
      .catch(() => {
        if (active) setStatus("ERROR");
      });

    return () => {
      active = false;
    };
  }, [reference]);

  const success = status === "SUCCESS";
  const failed = status === "FAILED";

  const label =
    status === "CHECKING" ? "Verifying payment" :
    success ? "Payment successful" :
    failed ? "Payment failed" :
    status === "PENDING" ? "Payment pending" :
    "Unable to verify payment";

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4 text-center">
          <Badge tone={success ? "success" : failed ? "error" : "neutral"}>
            {label}
          </Badge>
          <h1 className="text-xl font-bold">
            {success
              ? "Thank you for your order!"
              : failed
              ? "Your payment was not completed"
              : status === "CHECKING"
              ? "Confirming your payment"
              : "Your payment has not been confirmed"}
          </h1>
          <p className="text-sm text-text-secondary">
            {success
              ? "Paystack has confirmed your payment. Your order has been recorded."
              : failed
              ? "The payment provider reported that this transaction failed. You can return to the shop."
              : "We have not received a confirmed payment yet. Please check again shortly. Do not make another payment while this one is being checked."}
          </p>
          {(status === "PENDING" || status === "ERROR") && (
            <Button onClick={checkPayment} disabled={!reference}>
              Check payment again
            </Button>
          )}
        </CardBody>
      </Card>
    </main>
  );
}

export default function PayResultPage() {
  return (
    <Suspense fallback={<main className="p-8 text-center">Loading payment status...</main>}>
      <Result />
    </Suspense>
  );
}
