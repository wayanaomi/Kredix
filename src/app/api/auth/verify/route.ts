import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { verifyCode } from "@/lib/auth/otp";
import { verifySchema } from "@/lib/validation/auth";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  if (isRateLimited(`verify:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid code" }, { status: 400 });
  }

  const result = await verifyCode(user.id, parsed.data.code);

  switch (result) {
    case "VERIFIED":
      return NextResponse.json({ verified: true });
    case "EXPIRED":
      return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
    case "TOO_MANY_ATTEMPTS":
      return NextResponse.json({ error: "Too many incorrect attempts. Request a new code." }, { status: 429 });
    case "NOT_FOUND":
      return NextResponse.json({ error: "No active verification code. Request a new one." }, { status: 400 });
    default:
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }
}
