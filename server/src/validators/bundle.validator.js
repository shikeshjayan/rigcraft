import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId");

const imageObject = z
  .object({
    url: z.string().min(1),
    publicId: z.string().nullish(),
    alt: z.string().optional(),
  })
  .optional()
  .nullable();

export const createBundleSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200).trim(),
    description: z.string().max(1000).trim().optional(),
    image: imageObject,
    products: z.array(objectId).optional().default([]),
    prebuiltPCs: z.array(objectId).optional().default([]),
    bundlePrice: z.coerce.number().min(0, "Bundle price must be positive"),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional().nullable(),
    displayOrder: z.number().int().min(0).optional().default(0),
    isActive: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
  })
  .refine(
    (data) => data.products.length + data.prebuiltPCs.length > 0,
    {
      message: "Add at least one product or prebuilt PC",
      path: ["products"],
    }
  )
  .refine(
    (data) => !data.startDate || !data.endDate || data.startDate < data.endDate,
    {
      message: "Start date must be before end date",
      path: ["endDate"],
    }
  );

export const updateBundleSchema = z
  .object({
    name: z.string().min(1).max(200).trim().optional(),
    description: z.string().max(1000).trim().optional(),
    image: imageObject,
    products: z.array(objectId).optional(),
    prebuiltPCs: z.array(objectId).optional(),
    bundlePrice: z.coerce.number().min(0).optional(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    displayOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (
        data.startDate === undefined ||
        data.endDate === undefined ||
        !data.startDate ||
        !data.endDate
      ) {
        return true;
      }
      return data.startDate < data.endDate;
    },
    {
      message: "Start date must be before end date",
      path: ["endDate"],
    }
  );
