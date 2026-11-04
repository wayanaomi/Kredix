import { randomInt } from "node:crypto";
import { prisma } from "@/lib/db";
import { devProvidersAllowed } from "@/lib/env";
import { sendNotification, templates } from "@/lib/notifications";

const OTP_TTL_MS = 1000 * 60 * 10; // 10 minutes
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Issues a fresh OTP for a user. If no SMS/email provider is configured, the code is returned
 * to the caller so it can be shown in a clearly labelled development-only banner — this is never
 * the behaviour in a real deployment with a configured provider, where the code is only ever
 * sent out-of-band.
 */
export async function issueVerificationCode(userId: string, channel: "EMAIL" | "PHONE", destination: string) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.verificationRecord.create({
    data: { userId, channel, code, expiresAt },
  });

  const result = await sendNotification({
    userId,
    payload: {
      channel: channel === "EMAIL" ? "EMAIL" : "SMS",
      to: destination,
      template: "verification_code",
      message: templates.verificationCode(code),
    },
  });

  const devCode = result.status === "SKIPPED_NO_PROVIDER" && devProvidersAllowed() ? code : undefined;
  return { expiresAt, devCode };
}

export type VerifyCodeResult = "VERIFIED" | "INVALID" | "EXPIRED" | "TOO_MANY_ATTEMPTS" | "NOT_FOUND";

export async function verifyCode(userId: string, code: string): Promise<VerifyCodeResult> {
  const record = await prisma.verificationRecord.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return "NOT_FOUND";
  if (record.attempts >= MAX_ATTEMPTS) return "TOO_MANY_ATTEMPTS";

  if (record.expiresAt < new Date()) {
    return "EXPIRED";
  }

  if (record.code !== code) {
    await prisma.verificationRecord.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return "INVALID";
  }

  await prisma.$transaction([
    prisma.verificationRecord.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { verifiedAt: new Date() } }),
  ]);

  return "VERIFIED";
}
