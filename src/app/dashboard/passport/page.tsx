"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FieldError } from "@/components/ui/Field";
import { apiFetch } from "@/lib/api-client";

interface PassportField {
  label: string;
  value: string;
  status: "VERIFIED" | "SELF_DECLARED" | "SYSTEM_CALCULATED" | "AI_GENERATED";
}

interface PassportResult {
  eligibility: "ELIGIBLE" | "NOT_ELIGIBLE";
  missingRequirements?: string[];
  data?: { fields: PassportField[]; healthScore: number | null; generatedAt: string };
}

interface Share {
  id: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
}

const statusTone: Record<PassportField["status"], "neutral" | "success" | "brand"> = {
  VERIFIED: "success",
  SELF_DECLARED: "neutral",
  SYSTEM_CALCULATED: "brand",
  AI_GENERATED: "brand",
};

export default function PassportPage() {
  const [passport, setPassport] = useState<PassportResult | null>(null);
  const [shares, setShares] = useState<Share[]>([]);
  const [consent, setConsent] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data } = await apiFetch<PassportResult>("/api/passport");
    setPassport(data);
    const sharesRes = await apiFetch<{ shares: Share[] }>("/api/passport/share");
    setShares(sharesRes.data.shares ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- idiomatic fetch-on-mount
    load();
  }, []);

  async function onShare() {
    setError(null);
    if (!consent) {
      setError("You must consent to sharing your Financial Passport data");
      return;
    }
    const { ok, data } = await apiFetch<{ shareUrl: string }>("/api/passport/share", {
      method: "POST",
      body: { consentAccepted: true },
    });
    if (!ok) {
      setError(data.error ?? "Could not create share link");
      return;
    }
    setShareUrl(data.shareUrl);
    load();
  }

  async function onRevoke(id: string) {
    await apiFetch(`/api/passport/share/${id}/revoke`, { method: "POST" });
    load();
  }

  if (!passport) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Passport</h1>
        <p className="text-sm text-text-secondary">
          A portable, evidence-labelled snapshot of your business — not a guarantee of financing.
        </p>
      </div>

      {passport.eligibility === "NOT_ELIGIBLE" ? (
        <Card>
          <CardBody>
            <p className="font-semibold">Your Financial Passport will become available when the eligibility requirements are met.</p>
            <ul className="mt-2 list-inside list-disc text-sm text-text-secondary">
              {passport.missingRequirements?.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardBody>
              <div className="flex items-center justify-between">
                <p className="font-semibold">Passport details</p>
                <a href="/api/passport/pdf" className="text-sm font-semibold text-brand-primary">
                  Download PDF
                </a>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {passport.data?.fields.map((f) => (
                  <li key={f.label} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-text-secondary">{f.label}</span>
                    <span className="flex items-center gap-2 font-medium">
                      {f.value}
                      <Badge tone={statusTone[f.status]}>{f.status.replace("_", " ")}</Badge>
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="font-semibold">Share with a lender</p>
              <label className="mt-3 flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I consent to sharing my Financial Passport data via a secure, time-limited link. I
                  understand this link can be revoked at any time.
                </span>
              </label>
              <FieldError message={error ?? undefined} />
              <Button className="mt-3" onClick={onShare}>
                Create share link
              </Button>
              {shareUrl && (
                <p className="mt-3 break-all rounded-lg bg-surface-muted p-3 text-sm">{shareUrl}</p>
              )}

              {shares.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {shares.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-sm">
                      <span>
                        Expires {new Date(s.expiresAt).toLocaleDateString("en-NG")}
                        {s.revokedAt && " — revoked"}
                      </span>
                      {!s.revokedAt && (
                        <Button size="sm" variant="destructive" onClick={() => onRevoke(s.id)}>
                          Revoke
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
