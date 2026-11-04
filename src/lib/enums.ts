/**
 * SQLite has no native Prisma enum support, so enum-like columns are validated `String`
 * columns. These Zod enums are the single source of truth for allowed values at the
 * application layer. Keep in sync with the comments above each model in prisma/schema.prisma.
 */
import { z } from "zod";

export const UserRole = z.enum(["SME_OWNER", "LENDER", "ADMIN"]);
export type UserRole = z.infer<typeof UserRole>;

export const VerificationChannel = z.enum(["EMAIL", "PHONE"]);
export type VerificationChannel = z.infer<typeof VerificationChannel>;

export const RegistrationStatus = z.enum(["REGISTERED", "NOT_REGISTERED", "IN_PROGRESS"]);
export type RegistrationStatus = z.infer<typeof RegistrationStatus>;

export const OnboardingStep = z.enum([
  "BUSINESS_DETAILS",
  "STOREFRONT",
  "PRODUCTS",
  "COMPLETE",
]);
export type OnboardingStep = z.infer<typeof OnboardingStep>;

export const BusinessStatus = z.enum(["ACTIVE", "SUSPENDED"]);
export type BusinessStatus = z.infer<typeof BusinessStatus>;

export const OrderStatus = z.enum(["PENDING", "PAID", "FAILED", "CANCELLED"]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const PaymentStatus = z.enum(["PENDING", "SUCCESS", "FAILED"]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const TransactionSource = z.enum(["ONLINE_PAYMENT", "MANUAL", "OFFLINE_SYNC"]);
export type TransactionSource = z.infer<typeof TransactionSource>;

export const SyncStatus = z.enum(["SYNCED", "PENDING", "FAILED"]);
export type SyncStatus = z.infer<typeof SyncStatus>;

export const Eligibility = z.enum(["ELIGIBLE", "NOT_ELIGIBLE"]);
export type Eligibility = z.infer<typeof Eligibility>;

export const RecommendationType = z.enum([
  "TOP_PRODUCT",
  "REVENUE_DECLINE",
  "INVENTORY_REVIEW",
  "SALES_PERIOD",
  "INCOMPLETE_RECORDS",
]);
export type RecommendationType = z.infer<typeof RecommendationType>;

export const ConsentType = z.enum(["PASSPORT_SHARE", "FINANCING_REFERRAL"]);
export type ConsentType = z.infer<typeof ConsentType>;

export const FinancingStatus = z.enum([
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "DECLINED",
  "DISBURSED",
]);
export type FinancingStatus = z.infer<typeof FinancingStatus>;

/** Allowed status transitions for FinancingApplication / LenderReferral. */
export const FINANCING_STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["UNDER_REVIEW", "DECLINED"],
  UNDER_REVIEW: ["APPROVED", "DECLINED"],
  APPROVED: ["DISBURSED", "DECLINED"],
  DISBURSED: [],
  DECLINED: [],
};

export const NotificationChannel = z.enum(["SMS", "WHATSAPP", "EMAIL"]);
export type NotificationChannel = z.infer<typeof NotificationChannel>;

export const NotificationStatus = z.enum(["PENDING", "SENT", "FAILED", "SKIPPED_NO_PROVIDER"]);
export type NotificationStatus = z.infer<typeof NotificationStatus>;

export const PassportAccessOutcome = z.enum([
  "SUCCESS",
  "DENIED_EXPIRED",
  "DENIED_REVOKED",
  "DENIED_INVALID",
]);
export type PassportAccessOutcome = z.infer<typeof PassportAccessOutcome>;
