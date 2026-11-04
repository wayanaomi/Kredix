import { headers } from "next/headers";
import { resolvePassportShare } from "@/lib/passport";
import type { PassportData } from "@/lib/passport";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { brand } from "@/lib/brand";

const statusTone: Record<string, "neutral" | "success" | "brand"> = {
  VERIFIED: "success",
  SELF_DECLARED: "neutral",
  SYSTEM_CALCULATED: "brand",
  AI_GENERATED: "brand",
};

export default async function PassportSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") ?? undefined;
  const result = await resolvePassportShare(token, ip);

  if (result.outcome !== "SUCCESS" || !result.share) {
    const messages: Record<string, string> = {
      DENIED_EXPIRED: "This share link has expired.",
      DENIED_REVOKED: "This share link has been revoked by the business owner.",
      DENIED_INVALID: "This share link is invalid.",
    };
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
        <Card className="w-full max-w-md">
          <CardBody className="text-center">
            <p className="font-semibold">{messages[result.outcome] ?? "This link is no longer available."}</p>
          </CardBody>
        </Card>
      </main>
    );
  }

  const data = JSON.parse(result.share.passport.dataJson) as PassportData;

  return (
    <main className="min-h-screen bg-surface-muted px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-brand-primary">{brand.name} Financial Passport</p>
          <h1 className="text-2xl font-bold">{data.businessName}</h1>
          <p className="text-sm text-text-secondary">
            Generated {new Date(data.generatedAt).toLocaleDateString("en-NG")} · Methodology v{data.version}
          </p>
        </div>

        <Card>
          <CardBody>
            <ul className="divide-y divide-border">
              {data.fields.map((f) => (
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

        <p className="text-xs text-text-secondary">{brand.legal.disclaimer}</p>
      </div>
    </main>
  );
}
