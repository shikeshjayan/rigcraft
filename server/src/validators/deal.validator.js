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
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
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
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
  products: z.array(objectId).optional(),
  prebuiltPcs: z.array(objectId).optional(),
});
