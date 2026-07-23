import mongoose from "mongoose";
import buildComponentSchema from "../schemas/buildComponent.schema.js";

const savedBuildSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    components: {
      type: [buildComponentSchema],
      default: [],
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    totalSalePrice: {
      type: Number,
      default: 0,
    },

    estimatedPower: {
      type: Number,
      default: 0,
    },

    compatibility: {
      status: {
        type: String,
        enum: ["incomplete", "compatible", "incompatible"],
        default: "incomplete",
      },

      issues: [
        {
          type: String,
        },
      ],
    },

    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

savedBuildSchema.index({ user: 1, createdAt: -1 });

const SavedBuild = mongoose.model("SavedBuild", savedBuildSchema);

export default SavedBuild;