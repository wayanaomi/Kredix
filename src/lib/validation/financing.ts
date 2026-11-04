import { z } from "zod";

export const financingApplicationSchema = z.object({
  requestedAmountNaira: z.coerce.number().positive("Enter the amount you need"),
  purpose: z.string().trim().min(10, "Briefly describe what the financing is for").max(1000),
  consentAccepted: z.literal(true, {
    message: "You must consent to share your Financial Passport data",
  }),
});
export type FinancingApplicationInput = z.infer<typeof financingApplicationSchema>;

export const financingStatusUpdateSchema = z.object({
  status: z.enum(["UNDER_REVIEW", "APPROVED", "DECLINED", "DISBURSED"]),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type FinancingStatusUpdateInput = z.infer<typeof financingStatusUpdateSchema>;
