import { z } from "zod";
import mongoose from "mongoose";
import { CART_ITEM_TYPES } from "../constants/constants.js";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

export const addItemSchema = z.object({
  itemType: z.nativeEnum(CART_ITEM_TYPES),
  itemId: objectId,
  quantity: z.number().int().min(1).default(1),
});

export const updateQuantitySchema = z.object({
  quantity: z.number().int().min(1),
});

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Code is required").trim().toUpperCase(),
});
