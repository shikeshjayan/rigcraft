import mongoose from "mongoose";
import { CART_ITEM_TYPES } from "../constants/constants.js";

const stockAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    itemType: {
      type: String,
      enum: [CART_ITEM_TYPES.PRODUCT, CART_ITEM_TYPES.PREBUILT],
      required: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemModel",
    },

    itemModel: {
      type: String,
      enum: ["Product", "PrebuiltPC"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "sent", "cancelled"],
      default: "pending",
    },

    notifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

stockAlertSchema.index({ itemType: 1, item: 1, status: 1 });

const StockAlert = mongoose.model("StockAlert", stockAlertSchema);

export default StockAlert;
