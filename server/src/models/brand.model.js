import mongoose from "mongoose";
import slugify from "slugify";

const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    logo: {
      url: {
        type: String,
        trim: true,
      },
      publicId: {
        type: String,
        trim: true,
      },
      alt: {
        type: String,
        trim: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

brandSchema.pre("save", function () {
  if (this.isNew || this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

brandSchema.index({ isActive: 1 });

export default mongoose.model("Brand", brandSchema);
