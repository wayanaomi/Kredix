import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/db";
import { requireUser, AuthError } from "@/lib/auth/guard";
import { PassportPdfDocument } from "@/lib/passport/pdf";
import type { PassportData } from "@/lib/passport";

async function loadPassportData(): Promise<
  | { ok: true; data: PassportData; businessName: string }
  | { ok: false; error: string; status: number }
> {
  try {
    const user = await requireUser(["SME_OWNER"]);
    const business = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!business) return { ok: false, error: "Not found", status: 404 };

    const passport = await prisma.financialPassport.findUnique({ where: { businessId: business.id } });
    if (!passport) return { ok: false, error: "Generate your Financial Passport first", status: 400 };

    return { ok: true, data: JSON.parse(passport.dataJson) as PassportData, businessName: business.name };
  } catch (e) {
    if (e instanceof AuthError) return { ok: false, error: e.message, status: e.status };
    throw e;
  }
}

export async function GET() {
  const result = await loadPassportData();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const buffer = await renderToBuffer(<PassportPdfDocument data={result.data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kredix-passport-${result.businessName.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
