import { z } from "zod";
import mongoose from "mongoose";
import {
  PREBUILT_PC_STATUS,
  COMPONENT_TYPES,
} from "../constants/constants.js";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ID");

const componentSlotSchema = z
  .object({
    type: z.nativeEnum(COMPONENT_TYPES),
    product: objectId,
    quantity: z.number().int().min(1).optional(),
  })
  .strict();

const imageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  publicId: z.string().nullish(),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const warrantySchema = z
  .object({
    duration: z.number().optional(),
    unit: z.enum(["month", "year"]).optional(),
    type: z.enum(["manufacturer", "seller"]).optional(),
  })
  .optional();

const prebuiltPCBase = {
  name: z.string().min(1, "Name is required").max(150).trim(),
  sku: z.string().min(1, "SKU is required").max(50).trim().toUpperCase(),
  shortDescription: z.string().max(300).trim().optional(),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  images: z.array(imageSchema).optional(),

  components: z
    .array(componentSlotSchema)
    .min(1, "At least one component is required"),

  pricing: z.object({
    price: z.number().min(0, "Price must be >= 0"),
    salePrice: z.number().min(0).optional(),
    saleStart: z.string().datetime().optional(),
    saleEnd: z.string().datetime().optional(),
    currency: z.string().length(3).optional(),
  }),

  stock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),

  assemblyIncluded: z.boolean().optional(),
  stressTested: z.boolean().optional(),
  readyToShip: z.boolean().optional(),

  warranty: warrantySchema,

  category: z
    .enum(["gaming", "streaming", "workstation", "office", "budget"])
    .optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),

  status: z.nativeEnum(PREBUILT_PC_STATUS).optional(),
  isFeatured: z.boolean().optional(),
  featuredOrder: z.number().int().optional(),
};

export const createPrebuiltPCSchema = z.object(prebuiltPCBase).superRefine((data, ctx) => {
  if (
    data.pricing?.saleStart &&
    data.pricing?.saleEnd &&
    new Date(data.pricing.saleStart) >= new Date(data.pricing.saleEnd)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["pricing", "saleEnd"],
      message: "saleEnd must be after saleStart",
    });
  }
});

export const updatePrebuiltPCSchema = z.object(prebuiltPCBase).partial();
