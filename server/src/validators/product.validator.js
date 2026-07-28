import { z } from "zod";
import mongoose from "mongoose";
import { PRODUCT_STATUS, PRODUCT_TYPES } from "../constants/constants.js";

const objectId = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), "Invalid ID");

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const productBase = {
  name: z.string().min(1, "Name is required").max(150).trim(),
  sku: z.string().min(1, "SKU is required").max(50).trim().toUpperCase(),
  productType: z.nativeEnum(PRODUCT_TYPES).optional(),
  categoryType: z.string().trim().optional(),
  category: objectId,
  brand: objectId,
  shortDescription: z.string().max(300).trim().optional(),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim().toLowerCase()).optional(),
  price: z.number().min(0, "Price must be >= 0"),
  salePrice: z.number().min(0).optional(),
  saleStart: z.string().datetime().optional(),
  saleEnd: z.string().datetime().optional(),
  currency: z.string().length(3).optional(),
  stock: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  images: z.array(imageSchema).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z
    .object({
      length: z.number().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    })
    .optional(),
  warranty: z
    .object({
      duration: z.number().optional(),
      unit: z.enum(["month", "year"]).optional(),
      type: z.enum(["manufacturer", "seller"]).optional(),
    })
    .optional(),
  compatibility: z.record(z.unknown()).optional(),
  specifications: z.record(z.unknown()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.nativeEnum(PRODUCT_STATUS).optional(),
  isFeatured: z.boolean().optional(),
  featuredOrder: z.number().int().optional(),
};

export const createProductSchema = z.object(productBase).superRefine((data, ctx) => {
  if (data.saleStart && data.saleEnd && new Date(data.saleStart) >= new Date(data.saleEnd)) {
    ctx.addIssue({
      code: "custom",
      path: ["saleEnd"],
      message: "saleEnd must be after saleStart",
    });
  }
});

export const updateProductSchema = z.object(productBase).partial();
