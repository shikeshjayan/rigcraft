import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

export const createNotificationSchema = z.object({
  recipient: objectId,
  recipientRole: z.enum(["customer", "admin", "manager"]),
  type: z.enum([
    "order",
    "payment",
    "review",
    "support",
    "inventory",
    "coupon",
    "system",
    "marketing",
  ]),
  title: z.string().min(1).max(200).trim(),
  message: z.string().min(1).max(1000).trim(),
  module: z
    .enum([
      "Order",
      "Payment",
      "Review",
      "Support",
      "Inventory",
      "Coupon",
      "Deal",
      "System",
    ])
    .optional(),
  reference: objectId.optional(),
  referenceModel: z
    .enum(["Order", "Review", "SupportTicket", "Product", "Coupon"])
    .optional(),
  priority: z.enum(["low", "normal", "high", "critical"]).default("normal"),
  actionUrl: z.string().max(500).trim().optional(),
  metadata: z.record(z.unknown()).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const notificationIdSchema = z.object({
  id: objectId,
});
