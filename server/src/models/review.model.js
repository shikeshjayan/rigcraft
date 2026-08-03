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

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      enum: ["spam", "inappropriate", "fake", "other"],
      required: true,
    },
    note: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewType: {
      type: String,
      enum: ["product", "website"],
      default: "product",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    itemType: {
      type: String,
      enum: ["product", "prebuilt"],
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "itemModel",
    },

    itemModel: {
      type: String,
      enum: ["Product", "PrebuiltPC"],
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

    helpfulVotes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    adminReply: {
      text: {
        type: String,
        maxlength: 500,
        trim: true,
      },
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      repliedAt: {
        type: Date,
      },
    },

    reports: {
      type: [reportSchema],
      default: [],
    },

    spamFlagged: {
      type: Boolean,
      default: false,
    },

    spamScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    spamReason: {
      type: String,
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

reviewSchema.index(
  { user: 1, item: 1, itemType: 1 },
  { unique: true, partialFilterExpression: { item: { $type: "objectId" } } }
);
reviewSchema.index({ item: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ reviewType: 1, status: 1, featured: 1 });
reviewSchema.index({ "reports.user": 1 });
reviewSchema.index({ spamFlagged: 1 });

reviewSchema.plugin(mongoosePaginate);

export default mongoose.model("Review", reviewSchema);
