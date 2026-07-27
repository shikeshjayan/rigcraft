import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

export const checkoutSchema = z.object({
  addressId: objectId,
  paymentMethod: z.enum(["razorpay", "cod"]),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
});

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
