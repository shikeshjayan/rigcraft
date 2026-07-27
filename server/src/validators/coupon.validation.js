import { z } from "zod";
import mongoose from "mongoose";
import {
  DISCOUNT_TYPES,
  COUPON_APPLICABLE_TO,
} from "../constants/constants.js";

const objectId = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  "Invalid ID"
);

const couponBase = {
  name: z.string().min(1, "Name is required").max(100).trim(),
  code: z.string().min(1, "Code is required").max(50).trim().toUpperCase(),
  description: z.string().trim().optional(),
  discountType: z.nativeEnum(DISCOUNT_TYPES),
  discountValue: z.number().min(0, "Discount value must be >= 0"),
  minimumPurchase: z.number().min(0).optional().default(0),
  maximumDiscount: z.number().min(0).optional(),
  applicableTo: z.nativeEnum(COUPON_APPLICABLE_TO).optional().default(COUPON_APPLICABLE_TO.ALL),
  products: z.array(objectId).optional().default([]),
  categories: z.array(objectId).optional().default([]),
  prebuiltPcs: z.array(objectId).optional().default([]),
  usageLimit: z.number().int().min(1).optional(),
  usageLimitPerUser: z.number().int().min(1).optional().default(1),
  validFrom: z.string().datetime("Invalid date format"),
  validUntil: z.string().datetime("Invalid date format"),
  isFirstOrderOnly: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
};

export const createCouponSchema = z.object(couponBase).superRefine((data, ctx) => {
  if (new Date(data.validFrom) >= new Date(data.validUntil)) {
    ctx.addIssue({
      code: "custom",
      path: ["validUntil"],
      message: "validUntil must be after validFrom",
    });
  }

  if (data.discountType === DISCOUNT_TYPES.PERCENTAGE) {
    if (data.discountValue > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Percentage discount cannot exceed 100%",
      });
    }
    if (!data.maximumDiscount) {
      ctx.addIssue({
        code: "custom",
        path: ["maximumDiscount"],
        message: "Maximum discount is required for percentage coupons",
      });
    }
  }

  if (data.discountType === DISCOUNT_TYPES.FIXED && data.discountValue < 1) {
    ctx.addIssue({
      code: "custom",
      path: ["discountValue"],
      message: "Fixed discount must be at least 1",
    });
  }

  if (data.applicableTo === COUPON_APPLICABLE_TO.PRODUCT && data.products.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["products"],
      message: "At least one product is required",
    });
  }

  if (data.applicableTo === COUPON_APPLICABLE_TO.CATEGORY && data.categories.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["categories"],
      message: "At least one category is required",
    });
  }

  if (data.applicableTo === COUPON_APPLICABLE_TO.PREBUILT && data.prebuiltPcs.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["prebuiltPcs"],
      message: "At least one prebuilt PC is required",
    });
  }
});

export const updateCouponSchema = z.object(couponBase).partial().superRefine((data, ctx) => {
  if (data.discountType === DISCOUNT_TYPES.PERCENTAGE && data.maximumDiscount !== undefined && !data.maximumDiscount) {
    ctx.addIssue({
      code: "custom",
      path: ["maximumDiscount"],
      message: "Maximum discount is required for percentage coupons",
    });
  }
});
