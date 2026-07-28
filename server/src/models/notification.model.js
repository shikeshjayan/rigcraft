import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientRole: {
      type: String,
      enum: ["customer", "admin", "manager"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "order",
        "payment",
        "review",
        "support",
        "inventory",
        "coupon",
        "system",
        "marketing",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    module: {
      type: String,
      enum: [
        "Order",
        "Payment",
        "Review",
        "Support",
        "Inventory",
        "Coupon",
        "Deal",
        "System",
      ],
    },

    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
    },

    referenceModel: {
      type: String,
      enum: [
        "Order",
        "Review",
        "SupportTicket",
        "Product",
        "Coupon",
      ],
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    actionUrl: {
      type: String,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },

    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Notification", notificationSchema);
