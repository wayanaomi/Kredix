import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().default("kredix_session"),
  SESSION_SECRET: z.string().min(16).default("dev-only-insecure-secret-change-me"),
  ALLOW_DEV_PROVIDERS: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  DEMO_OTP_ENABLED: z.string().optional().transform((v) => v === "true"),
  DEMO_OTP_PHONE: z.string().optional().default(""),
  PSP_PROVIDER: z.string().default("mock"),
  PSP_SECRET_KEY: z.string().optional().default(""),
  PSP_PUBLIC_KEY: z.string().optional().default(""),
  PSP_WEBHOOK_SECRET: z.string().optional().default(""),
  NOTIFICATIONS_PROVIDER: z.string().default("none"),
  NOTIFICATIONS_API_KEY: z.string().optional().default(""),
  NOTIFICATIONS_FROM: z.string().optional().default(""),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Validated, typed access to environment configuration. Never log the parsed secrets. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

export const isProduction = process.env.NODE_ENV === "production";

/** Dev-only adapters (mock PSP, console OTP) must never silently run in production. */
export function devProvidersAllowed(): boolean {
  if (isProduction) return getEnv().ALLOW_DEV_PROVIDERS === true;
  return true;
}
