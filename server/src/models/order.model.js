import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ["product", "prebuilt", "savedBuild"],
      required: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "items.itemModel",
    },

    itemModel: {
      type: String,
      enum: ["Product", "PrebuiltPC", "SavedBuild"],
      required: true,
    },

    name: String,

    sku: String,

    quantity: Number,

    unitPrice: Number,

    totalPrice: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      default: [],
    },

    shippingAddress: {
      fullName: String,
      phone: String,
      alternatePhone: String,
      addressLine1: String,
      addressLine2: String,
      landmark: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },

    coupon: {
      code: String,
      discount: Number,
    },

    subtotal: Number,

    discount: Number,

    shippingCharge: Number,

    tax: Number,

    total: Number,

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    razorpay: {
      orderId: String,
      paymentId: String,
      signature: String,
    },

    checkoutExpiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.model("Order", orderSchema);
