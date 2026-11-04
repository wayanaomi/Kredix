import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  priceNaira: z.coerce.number().min(0, "Price cannot be negative"),
  imageUrl: z.string().trim().url().optional().or(z.literal("")),
  isAvailable: z.coerce.boolean().default(true),
  inventoryQty: z.coerce.number().int().min(0).optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const storefrontSchema = z.object({
  headline: z.string().trim().max(200).optional().or(z.literal("")),
  themeColor: z.string().trim().regex(/^#([0-9a-fA-F]{6})$/).default("#5725B5"),
  logoUrl: z.string().trim().url().optional().or(z.literal("")),
  bannerUrl: z.string().trim().url().optional().or(z.literal("")),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Shop URL must be at least 3 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens are allowed"),
});
export type StorefrontInput = z.infer<typeof storefrontSchema>;
