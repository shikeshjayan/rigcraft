import { z } from "zod";
import mongoose from "mongoose";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100).trim(),
  description: z.string().max(500).trim().optional(),
  image: z
    .object({
      url: z.string().min(1, "Image URL is required"),
      publicId: z.string().nullish(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
  parent: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid parent ID")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(500).trim().optional(),
  image: z
    .object({
      url: z.string().min(1, "Image URL is required"),
      publicId: z.string().nullish(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
  parent: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid parent ID")
    .nullable()
    .optional(),
  isActive: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});
