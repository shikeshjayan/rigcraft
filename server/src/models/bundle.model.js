import mongoose from "mongoose";
import slugify from "slugify";

const bundleSchema = new mongoose.Schema(
  {
    name: {
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

    image: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
      alt: { type: String, trim: true },
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

    bundlePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      default: () => new Date(),
    },

    endDate: {
      type: Date,
      default: null,
    },

    displayOrder: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

bundleSchema.pre("save", function () {
  if ((this.isNew || this.isModified("name")) && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

bundleSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
bundleSchema.index({ isFeatured: 1, isActive: 1, endDate: 1 });
bundleSchema.index({ displayOrder: 1 });

export default mongoose.model("Bundle", bundleSchema);
