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

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).trim().optional(),
  comment: z.string().min(1).max(1000).trim().optional(),
});
