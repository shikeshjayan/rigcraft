import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
    },
    alternatePhone: {
      type: String,
    },
    addressLine1: {
      type: String,
      required: [true, 'Address Line 1 is required'],
    },
    addressLine2: {
      type: String,
    },
    landmark: {
      type: String,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    country: {
      type: String,
      default: 'India',
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
    },
    label: {
      type: String,
      required: [true, 'Label is required'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Address = mongoose.model('Address', addressSchema);
export default Address;
