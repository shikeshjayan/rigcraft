import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).trim().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logo: z
    .object({
      url: z.string().min(1, "Image URL is required"),
      publicId: z.string().nullish(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  logo: z
    .object({
      url: z.string().min(1, "Image URL is required"),
      publicId: z.string().nullish(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});
