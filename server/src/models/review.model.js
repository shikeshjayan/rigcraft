import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const reviewImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
    },
    alt: {
      type: String,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    itemType: {
      type: String,
      enum: ["product", "prebuilt"],
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    images: {
      type: [reviewImageSchema],
      validate: {
        validator: (images) => images.length <= 5,
        message: "Maximum 5 images allowed.",
      },
      default: [],
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },

    helpfulCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

reviewSchema.index({ user: 1, item: 1, itemType: 1 }, { unique: true });
reviewSchema.index({ item: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

reviewSchema.plugin(mongoosePaginate);

export default mongoose.model("Review", reviewSchema);
