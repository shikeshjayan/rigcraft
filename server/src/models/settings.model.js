import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String },
    alt: { type: String, default: "" },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "RigCraft",
      trim: true,
    },
    storeEmail: {
      type: String,
      default: "",
      trim: true,
    },
    storePhone: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    whatsapp: {
      type: String,
      default: "",
      trim: true,
    },
    logo: {
      type: imageSchema,
      default: () => ({}),
    },
    favicon: {
      type: imageSchema,
      default: () => ({}),
    },

    shipping: {
      standardRate: {
        type: Number,
        default: 100,
        min: 0,
      },
      freeShippingThreshold: {
        type: Number,
        default: 500,
        min: 0,
      },
      expressRate: {
        type: Number,
        default: 200,
        min: 0,
      },
      estimatedDelivery: {
        type: String,
        default: "3-5 Business Days",
        trim: true,
      },
      codAvailable: {
        type: Boolean,
        default: true,
      },
    },

    tax: {
      rate: {
        type: Number,
        default: 0.18,
        min: 0,
        max: 1,
      },
      name: {
        type: String,
        default: "GST",
        trim: true,
      },
      pricesIncludeTax: {
        type: Boolean,
        default: false,
      },
    },

    payment: {
      enableRazorpay: {
        type: Boolean,
        default: true,
      },
      enableCod: {
        type: Boolean,
        default: true,
      },
      minOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
      maxOrderAmount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    seo: {
      defaultTitle: {
        type: String,
        default: "",
        trim: true,
      },
      defaultDescription: {
        type: String,
        default: "",
        trim: true,
      },
      defaultOgImage: {
        type: imageSchema,
        default: () => ({}),
      },
      metaKeywords: {
        type: String,
        default: "",
        trim: true,
      },
    },

    social: {
      facebook: {
        type: String,
        default: "",
        trim: true,
      },
      instagram: {
        type: String,
        default: "",
        trim: true,
      },
      youtube: {
        type: String,
        default: "",
        trim: true,
      },
      linkedin: {
        type: String,
        default: "",
        trim: true,
      },
      twitter: {
        type: String,
        default: "",
        trim: true,
      },
    },

    order: {
      prefix: {
        type: String,
        default: "RC-",
        trim: true,
      },
      allowCancellation: {
        type: Boolean,
        default: true,
      },
      cancellationTimeLimit: {
        type: Number,
        default: 24,
        min: 0,
      },
      cancelPendingAfter: {
        type: Number,
        default: 24,
        min: 1,
      },
    },

    inventory: {
      lowStockThreshold: {
        type: Number,
        default: 10,
        min: 0,
      },
      allowBackorders: {
        type: Boolean,
        default: false,
      },
      hideOutOfStock: {
        type: Boolean,
        default: false,
      },
      autoUpdateInventory: {
        type: Boolean,
        default: true,
      },
    },

    review: {
      allowReviews: {
        type: Boolean,
        default: true,
      },
      verifiedPurchaseOnly: {
        type: Boolean,
        default: true,
      },
      autoApprove: {
        type: Boolean,
        default: false,
      },
      allowImages: {
        type: Boolean,
        default: true,
      },
      maxImages: {
        type: Number,
        default: 5,
        min: 1,
        max: 10,
      },
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "We'll be back soon!",
      trim: true,
    },

    notification: {
      orderConfirmation: {
        type: Boolean,
        default: true,
      },
      shippingUpdate: {
        type: Boolean,
        default: true,
      },
      paymentConfirmation: {
        type: Boolean,
        default: true,
      },
      lowStockAlerts: {
        type: Boolean,
        default: true,
      },
      newOrderAlerts: {
        type: Boolean,
        default: true,
      },
    },

    currency: {
      code: {
        type: String,
        default: "INR",
        trim: true,
      },
      symbol: {
        type: String,
        default: "₹",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.model("Settings", settingsSchema);

export const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

export default Settings;
