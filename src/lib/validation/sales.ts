import { z } from "zod";

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(999),
      })
    )
    .min(1, "Select at least one product"),
  customer: z.object({
    name: z.string().trim().min(2, "Enter your name").max(150),
    phone: z
      .string()
      .trim()
      .regex(/^(\+234[0-9]{10}|0[0-9]{10})$/, "Enter a valid Nigerian phone number"),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  }),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const manualSaleSchema = z.object({
  clientTxnId: z.string().uuid(),
  productLabel: z.string().trim().min(1, "Describe what was sold").max(200),
  amountNaira: z.coerce.number().positive("Amount must be greater than zero"),
  occurredAt: z.string().datetime().or(z.string().min(1)),
});
export type ManualSaleInput = z.infer<typeof manualSaleSchema>;

export const expenseSchema = z.object({
  amountNaira: z.coerce.number().positive("Amount must be greater than zero"),
  category: z.string().trim().min(2).max(100),
  occurredAt: z.string().min(1),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;
