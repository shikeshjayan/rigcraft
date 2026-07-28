import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    label: {
      type: String,
      default: "home",
      trim: true,
      maxlength: 100,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    landmark: {
      type: String,
      trim: true,
      maxlength: 255,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
      maxlength: 100,
    },

    postalCode: {
      type: String,
      required: true,
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  }
);

addressSchema.index({ user: 1, isDefault: 1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;
