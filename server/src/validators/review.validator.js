import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

export const createReviewSchema = z.object({
  itemType: z.enum(["product", "prebuilt"], {
    required_error: "itemType is required",
  }),
  item: objectId,
  rating: z
    .number({ required_error: "rating is required" })
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z.string().max(100, "Title too long").trim().optional(),
  comment: z
    .string({ required_error: "comment is required" })
    .min(1, "Comment is required")
    .max(1000, "Comment too long")
    .trim(),
});

export const createProductReviewSchema = createReviewSchema.extend({
  reviewType: z.literal("product").optional(),
});

export const createTestimonialSchema = z.object({
  reviewType: z.literal("website").optional(),
  rating: z
    .number({ required_error: "rating is required" })
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  title: z.string().max(100, "Title too long").trim().optional(),
  comment: z
    .string({ required_error: "comment is required" })
    .min(1, "Comment is required")
    .max(1000, "Comment too long")
    .trim(),
  displayOrder: z
    .number()
    .int()
    .min(0, "displayOrder must be 0 or greater")
    .optional(),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).trim().optional(),
  comment: z.string().min(1).max(1000).trim().optional(),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"], {
    required_error: "status is required",
  }),
});

export const featureReviewSchema = z.object({
  featured: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const reportReviewSchema = z.object({
  reason: z.enum(["spam", "inappropriate", "fake", "other"], {
    required_error: "reason is required",
  }),
  note: z.string().max(500, "Note too long").trim().optional(),
});

export const adminReplySchema = z.object({
  text: z.string().max(500, "Reply too long").trim(),
});
