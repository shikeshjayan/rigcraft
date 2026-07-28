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

    banner: {
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

    isActive: {
      type: Boolean,
      default: true,
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    prebuiltPcs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PrebuiltPC",
      },
    ],
  },
  { timestamps: true },
);

dealSchema.pre("save", function () {
  if (this.isNew || this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
});

dealSchema.index({ isActive: 1, endDate: 1 });
dealSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Deal", dealSchema);
