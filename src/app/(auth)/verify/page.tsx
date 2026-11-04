"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiFetch } from "@/lib/api-client";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const devCode = searchParams.get("devCode");
  const [code, setCode] = useState(devCode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await apiFetch("/api/auth/verify", { method: "POST", body: { code } });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Verification failed");
      return;
    }
    router.push("/onboarding");
  }

  async function onResend() {
    setError(null);
    setInfo(null);
    const { ok, data } = await apiFetch<{ devCode?: string }>("/api/auth/resend-otp", { method: "POST" });
    if (!ok) {
      setError(data.error ?? "Could not resend code");
      return;
    }
    if (data.devCode) {
      setCode(data.devCode);
      setInfo("A new development code has been filled in below.");
    } else {
      setInfo("A new code has been sent.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardBody>
          <h1 className="text-2xl font-bold">Verify your contact</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Enter the 6-digit code we sent to confirm it&apos;s really you.
          </p>

          {devCode && (
            <Badge tone="warning" className="mt-4 block w-fit">
              Development mode — no SMS provider configured. Your code is pre-filled below.
            </Badge>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
              />
            </div>
            <FieldError message={error ?? undefined} />
            {info && <p className="text-sm text-state-success">{info}</p>}
            <Button type="submit" className="w-full" isLoading={loading}>
              Verify
            </Button>
          </form>

          <button onClick={onResend} className="mt-4 text-sm font-semibold text-brand-primary">
            Resend code
          </button>
        </CardBody>
      </Card>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  );
}
