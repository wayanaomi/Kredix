"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, HelpText, FieldError } from "@/components/ui/Field";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { apiFetch } from "@/lib/api-client";

interface Storefront {
  id: string;
  slug: string;
  headline: string | null;
  themeColor: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  isPublished: boolean;
}

export default function StorefrontBuilderPage() {
  const [form, setForm] = useState({ slug: "", headline: "", themeColor: "#5725B5", logoUrl: "", bannerUrl: "" });
  const [storefront, setStorefront] = useState<Storefront | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<{ storefront: Storefront | null }>("/api/storefront").then(({ data }) => {
      if (data.storefront) {
        setStorefront(data.storefront);
        setForm({
          slug: data.storefront.slug,
          headline: data.storefront.headline ?? "",
          themeColor: data.storefront.themeColor,
          logoUrl: data.storefront.logoUrl ?? "",
          bannerUrl: data.storefront.bannerUrl ?? "",
        });
      }
    });
  }, []);

  const shopUrl = typeof window !== "undefined" && form.slug ? `${window.location.origin}/store/${form.slug}` : "";

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { ok, data } = await apiFetch<{ storefront: Storefront }>("/api/storefront", {
      method: "POST",
      body: form,
    });
    setLoading(false);
    if (!ok) {
      setError(data.error ?? "Could not save storefront");
      return;
    }
    setStorefront(data.storefront);
  }

  async function onPublish() {
    setPublishError(null);
    const { ok, data } = await apiFetch<{ storefront: Storefront }>("/api/storefront/publish", { method: "POST" });
    if (!ok) {
      setPublishError(data.error ?? "Could not publish storefront");
      return;
    }
    setStorefront(data.storefront);
  }

  function copyLink() {
    if (!shopUrl) return;
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Storefront</h1>
        <p className="text-sm text-text-secondary">Open for business in minutes — no technical skill required.</p>
      </div>

      <Card>
        <CardBody>
          <form onSubmit={onSave} className="space-y-4">
            <div>
              <Label htmlFor="slug">Your shop URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">/store/</span>
                <Input
                  id="slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
                  placeholder="adaeze-fabrics"
                />
              </div>
              <HelpText>Lowercase letters, numbers and hyphens only.</HelpText>
            </div>
            <div>
              <Label htmlFor="headline">Headline (optional)</Label>
              <Input
                id="headline"
                value={form.headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
                placeholder="Quality Ankara fabrics, delivered fast"
              />
            </div>
            <div>
              <Label htmlFor="logoUrl">Logo image URL (optional)</Label>
              <Input
                id="logoUrl"
                value={form.logoUrl}
                onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="themeColor">Theme colour</Label>
              <input
                id="themeColor"
                type="color"
                className="h-10 w-20 rounded-lg border border-border"
                value={form.themeColor}
                onChange={(e) => setForm((f) => ({ ...f, themeColor: e.target.value }))}
              />
            </div>
            <FieldError message={error ?? undefined} />
            <Button type="submit" isLoading={loading}>
              Save storefront
            </Button>
          </form>
        </CardBody>
      </Card>

      {storefront && (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Publish status</p>
                <Badge tone={storefront.isPublished ? "success" : "neutral"}>
                  {storefront.isPublished ? "Published" : "Not published"}
                </Badge>
              </div>
              {!storefront.isPublished && <Button onClick={onPublish}>Publish storefront</Button>}
            </div>
            <FieldError message={publishError ?? undefined} />

            {storefront.isPublished && (
              <div className="rounded-xl bg-surface-muted p-4">
                <p className="text-sm text-text-secondary">Share your shop link</p>
                <div className="mt-2 flex items-center gap-2">
                  <Input readOnly value={shopUrl} />
                  <Button type="button" variant="secondary" onClick={copyLink}>
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Check out my shop: ${shopUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-action-secondary px-4 py-2.5 font-semibold text-dark-plum hover:bg-action-secondary-hover"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
