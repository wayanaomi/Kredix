"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api-client";
import { brand } from "@/lib/brand";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await apiFetch<{ role: string }>("/api/auth/login", {
      method: "POST",
      body: form,
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Could not log in");
      return;
    }
    if (data.role === "ADMIN") router.push("/admin");
    else if (data.role === "LENDER") router.push("/lender");
    else router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardBody>
          <Link href="/" className="text-xl font-extrabold text-brand-primary">
            {brand.name}
          </Link>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="identifier">Email or phone number</Label>
              <Input
                id="identifier"
                required
                value={form.identifier}
                onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" className="w-full" isLoading={loading}>
              Log in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            New to {brand.name}?{" "}
            <Link href="/register" className="font-semibold text-brand-primary">
              Create an account
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
