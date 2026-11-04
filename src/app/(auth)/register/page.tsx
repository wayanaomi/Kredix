"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api-client";
import { brand } from "@/lib/brand";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await apiFetch<{ userId: string; devCode?: string }>("/api/auth/register", {
      method: "POST",
      body: form,
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }
    const query = data.devCode ? `?devCode=${data.devCode}` : "";
    router.push(`/verify${query}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardBody>
          <Link href="/" className="text-xl font-extrabold text-brand-primary">
            {brand.name}
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Create your account</h1>


          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder=""
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder=""
              />
            </div>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder=""
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
                placeholder="At least 8 characters"
              />
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" className="w-full" isLoading={loading}>
              Get Started
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-primary">
              Log in
            </Link>
          </p>
        </CardBody>
      </Card>
    </main>
  );
}
