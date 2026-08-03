import mongoose from "mongoose";
import slugify from "slugify";

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    desktopBanner: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
      alt: { type: String, trim: true },
    },

    mobileBanner: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
      alt: { type: String, trim: true },
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    prebuiltPCs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PrebuiltPC",
      },
    ],

    promotion: {
      topBar: {
        enabled: { type: Boolean, default: false },
        text: { type: String, trim: true, maxlength: 200 },
      },
      homeOffer: {
        enabled: { type: Boolean, default: false },
        title: { type: String, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500 },
        banner: {
          url: { type: String, trim: true },
          publicId: { type: String, trim: true },
          alt: { type: String, trim: true },
        },
      },
    },

    buttonText: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    buttonLink: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

dealSchema.pre("save", function () {
  if ((this.isNew || this.isModified("title")) && !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

dealSchema.index({ isActive: 1, endDate: 1 });
dealSchema.index({ startDate: 1, endDate: 1 });
dealSchema.index({ displayOrder: 1 });

export default mongoose.model("Deal", dealSchema);
