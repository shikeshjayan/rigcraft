import { z } from "zod";

const phoneRegex = /^[+]?[\d\s\-()]{7,15}$/;
const postalCodeRegex = /^\d{5,6}$/;

export const createAddressSchema = z.object({
  label: z.string().max(100).trim().default("home"),
  fullName: z.string().min(1).max(100).trim(),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  alternatePhone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
  addressLine1: z.string().min(1).max(255).trim(),
  addressLine2: z.string().max(255).trim().optional().or(z.literal("")),
  landmark: z.string().max(255).trim().optional().or(z.literal("")),
  city: z.string().min(1).max(100).trim(),
  state: z.string().min(1).max(100).trim(),
  country: z.string().max(100).trim().default("India"),
  postalCode: z.string().regex(postalCodeRegex, "Invalid postal code"),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();
