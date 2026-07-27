import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

export const createRazorpayOrderSchema = z.object({
  orderId: objectId,
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
