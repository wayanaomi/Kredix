import { z } from "zod";
import { RegistrationStatus } from "@/lib/enums";

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(150),
  industry: z.string().trim().min(2, "Select or enter an industry").max(100),
  location: z.string().trim().min(2, "Location is required").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  tenureMonths: z.coerce.number().int().min(0).max(1200),
  employeeCount: z.coerce.number().int().min(0).max(100000),
  registrationStatus: RegistrationStatus,
});
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
