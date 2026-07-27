import mongoose from "mongoose";
import { DISCOUNT_TYPES, COUPON_APPLICABLE_TO } from "../constants/constants.js";

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    discountType: {
      type: String,
      enum: Object.values(DISCOUNT_TYPES),
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    minimumPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscount: {
      type: Number,
      min: 0,
    },

    applicableTo: {
      type: String,
      enum: Object.values(COUPON_APPLICABLE_TO),
      default: COUPON_APPLICABLE_TO.ALL,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    prebuiltPcs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PrebuiltPC",
      },
    ],

    usageLimit: {
      type: Number,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },

    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    isFirstOrderOnly: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

couponSchema.index({ isActive: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
