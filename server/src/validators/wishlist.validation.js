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
});
