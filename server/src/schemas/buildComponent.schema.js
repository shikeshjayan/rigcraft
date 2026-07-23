import mongoose from "mongoose";
import { COMPONENT_TYPES } from "../constants/constants.js";

const buildComponentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(COMPONENT_TYPES),
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

export default buildComponentSchema;