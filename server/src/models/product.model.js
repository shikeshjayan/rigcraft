import mongoose from "mongoose";
import slugify from "slugify";
import mongoosePaginate from "mongoose-paginate-v2";
import {
  PRODUCT_STATUS,
  PRODUCT_TYPES,
  WARRANTY_TYPES,
  WARRANTY_UNITS,
} from "../constants/constants.js";

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
    },

    alt: {
      type: String,
      trim: true,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    productType: {
      type: String,
      enum: Object.values(PRODUCT_TYPES),
      default: PRODUCT_TYPES.COMPONENT,
    },

    categoryType: {
      type: String,
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
      index: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    description: {
      type: String,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      min: 0,
    },

    saleStart: Date,

    saleEnd: Date,

    currency: {
      type: String,
      default: "INR",
    },

    // Inventory
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    // Images
    images: {
      type: [imageSchema],
      default: [],
    },

    // Shipping
    weight: {
      type: Number,
      min: 0,
    },

    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    // Warranty
    warranty: {
      duration: Number,

      unit: {
        type: String,
        enum: Object.values(WARRANTY_UNITS),
      },

      type: {
        type: String,
        enum: Object.values(WARRANTY_TYPES),
      },
    },

    /*
      Only fields used by the
      compatibility engine.
    */
    compatibility: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    /*
      Technical specifications
      displayed on Product Details page.
    */
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },

      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // SEO
    metaTitle: String,

    metaDescription: String,

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    featuredOrder: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.isDeleted;
        return ret;
      },
    },
  }
);

productSchema.pre("save", function () {
  if (this.isNew || this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

productSchema.pre("validate", function () {
  if (this.saleStart && this.saleEnd && this.saleStart >= this.saleEnd) {
    this.invalidate("saleEnd", "saleEnd must be after saleStart");
  }
});

productSchema.plugin(mongoosePaginate);

// Indexes
productSchema.index({ category: 1, status: 1 });

productSchema.index({ brand: 1, category: 1 });

productSchema.index({ price: 1 });

productSchema.index({ soldCount: -1 });

productSchema.index({ "rating.average": -1 });

productSchema.index({ status: 1, isFeatured: 1 });

productSchema.index({ "compatibility.$**": 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
