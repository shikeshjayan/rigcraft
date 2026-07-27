import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "unsubscribed"],
      default: "active",
    },

    subscribedAt: {
      type: Date,
      default: Date.now,
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },

    lastEmailSent: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
  }
);

newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
