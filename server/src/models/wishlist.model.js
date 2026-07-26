import mongoose from "mongoose";
import { CART_ITEM_TYPES } from "../constants/constants.js";

const wishlistItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: Object.values(CART_ITEM_TYPES),
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

    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      versionKey: false,
    },
  }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
