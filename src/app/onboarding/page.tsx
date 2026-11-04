"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea, FieldError, HelpText } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { apiFetch } from "@/lib/api-client";

const INDUSTRIES = [
  "Retail / General Store",
  "Fashion & Apparel",
  "Food & Beverage",
  "Beauty & Personal Care",
  "Electronics",
  "Agriculture",
  "Services",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    industry: INDUSTRIES[0],
    location: "",
    description: "",
    tenureMonths: "",
    employeeCount: "",
    registrationStatus: "NOT_REGISTERED",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ business: Record<string, unknown> | null }>("/api/business").then(({ data }) => {
      const b = data.business;
      if (b) {
        setForm({
          name: String(b.name ?? ""),
          industry: String(b.industry ?? INDUSTRIES[0]),
          location: String(b.location ?? ""),
          description: String(b.description ?? ""),
          tenureMonths: b.tenureMonths != null ? String(b.tenureMonths) : "",
          employeeCount: b.employeeCount != null ? String(b.employeeCount) : "",
          registrationStatus: String(b.registrationStatus ?? "NOT_REGISTERED"),
        });
      }
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await apiFetch("/api/business", { method: "POST", body: form });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Could not save your business profile");
      return;
    }
    router.push("/dashboard/storefront");
  }

  return (
    <main className="min-h-screen bg-surface-muted px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-text-secondary">
          <span className="rounded-full bg-brand-primary px-3 py-1 text-white">1. Business details</span>
          <span className="rounded-full bg-surface px-3 py-1">2. Storefront</span>
          <span className="rounded-full bg-surface px-3 py-1">3. Products</span>
        </div>
        <Card>
          <CardBody>
            <h1 className="text-2xl font-bold">Tell us about your business</h1>
            <p className="mt-1 text-sm text-text-secondary">
              This helps us set up your storefront and Financial Passport correctly. Your progress is
              saved as you go.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Business name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Adaeze Fabrics"
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <select
                  id="industry"
                  className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5"
                  value={form.industry}
                  onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="location">Location (city / state)</Label>
                <Input
                  id="location"
                  required
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="Lagos, Nigeria"
                />
              </div>
              <div>
                <Label htmlFor="description">Business description (optional)</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What do you sell, and to whom?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tenureMonths">Months trading</Label>
                  <Input
                    id="tenureMonths"
                    type="number"
                    min={0}
                    required
                    value={form.tenureMonths}
                    onChange={(e) => setForm((f) => ({ ...f, tenureMonths: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="employeeCount">Number of employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    min={0}
                    required
                    value={form.employeeCount}
                    onChange={(e) => setForm((f) => ({ ...f, employeeCount: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="registrationStatus">Business registration status</Label>
                <select
                  id="registrationStatus"
                  className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5"
                  value={form.registrationStatus}
                  onChange={(e) => setForm((f) => ({ ...f, registrationStatus: e.target.value }))}
                >
                  <option value="REGISTERED">Registered (e.g. CAC)</option>
                  <option value="IN_PROGRESS">Registration in progress</option>
                  <option value="NOT_REGISTERED">Not yet registered</option>
                </select>
                <HelpText>This does not block you from using Kredix — it helps lenders understand your business.</HelpText>
              </div>
              <FieldError message={error ?? undefined} />
              <Button type="submit" className="w-full" isLoading={loading}>
                Continue to storefront
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
