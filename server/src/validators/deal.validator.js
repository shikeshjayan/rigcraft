import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId");

export const createDealSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  banner: z
    .object({
      url: z.string().min(1, "Image URL is required"),
      publicId: z.string().nullish(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
  code: z.string().min(1, "Code is required").trim(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0, "Value must be positive"),
  minOrder: z.number().min(0, "Minimum order must be positive").optional(),
  maxUses: z.number().min(0, "Max uses must be positive").optional(),
  usedCount: z.number().min(0).optional().default(0),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().optional(),
  products: z.array(objectId).optional(),
  prebuiltPcs: z.array(objectId).optional(),
});

export const updateDealSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  banner: z
    .object({
      url: z.string().min(1, "Image URL is required"),
      publicId: z.string().nullish(),
      alt: z.string().optional(),
    })
    .optional()
    .nullable(),
  code: z.string().min(1).trim().optional(),
  type: z.enum(["percentage", "fixed"]).optional(),
  value: z.number().min(0, "Value must be positive").optional(),
  minOrder: z.number().min(0, "Minimum order must be positive").optional(),
  maxUses: z.number().min(0, "Max uses must be positive").optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
  products: z.array(objectId).optional(),
  prebuiltPcs: z.array(objectId).optional(),
});
