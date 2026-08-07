import { z } from "zod";
import mongoose from "mongoose";
import { CART_ITEM_TYPES } from "../constants/constants.js";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

export const subscribeSchema = z.object({
  itemType: z.enum([CART_ITEM_TYPES.PRODUCT, CART_ITEM_TYPES.PREBUILT]),
  itemId: objectId,
});
