import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { issueVerificationCode } from "@/lib/auth/otp";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  if (isRateLimited(`resend-otp:${user.id}`, 3, 5 * 60_000)) {
    return NextResponse.json(
      { error: "You have requested too many codes. Please wait a few minutes." },
      { status: 429 }
    );
  }

  if (user.verifiedAt) {
    return NextResponse.json({ error: "Account is already verified." }, { status: 400 });
  }

  const { devCode } = await issueVerificationCode(user.id, "PHONE", user.phone ?? user.email ?? "");
  return NextResponse.json({ sent: true, devCode });
}
