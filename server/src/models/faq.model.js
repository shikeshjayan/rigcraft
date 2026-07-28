import mongoose from "mongoose";
import { FAQ_CATEGORIES } from "../constants/support.constants.js";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: Object.values(FAQ_CATEGORIES),
      default: FAQ_CATEGORIES.GENERAL,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  }
);

faqSchema.index({ category: 1, displayOrder: 1 });
faqSchema.index({ isActive: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;