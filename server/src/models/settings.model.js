import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
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
