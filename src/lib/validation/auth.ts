import { z } from "zod";

// Nigerian phone numbers: accepts 0XXXXXXXXXX or +234XXXXXXXXXX (11/13 digit forms).
const ngPhoneRegex = /^(\+234[0-9]{10}|0[0-9]{10})$/;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().regex(ngPhoneRegex, "Enter a valid Nigerian phone number"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Password must contain a letter")
    .regex(/[0-9]/, "Password must contain a number"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your email or phone number"),
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const verifySchema = z.object({
  code: z.string().trim().length(6, "Enter the 6-digit code"),
});
export type VerifyInput = z.infer<typeof verifySchema>;
