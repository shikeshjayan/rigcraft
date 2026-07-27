import mongoose from "mongoose";
import slugify from "slugify";
import mongoosePaginate from "mongoose-paginate-v2";
import { PREBUILT_PC_STATUS } from "../constants/constants.js";
import buildComponentSchema from "../schemas/buildComponent.schema.js";

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

const prebuiltPcSchema = new mongoose.Schema(
  {
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

    images: {
      type: [imageSchema],
      default: [],
    },

    components: {
      type: [buildComponentSchema],
      default: [],
    },

    pricing: {
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
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },

    assemblyIncluded: {
      type: Boolean,
      default: true,
    },
    stressTested: {
      type: Boolean,
      default: true,
    },
    readyToShip: {
      type: Boolean,
      default: true,
    },

    warranty: {
      duration: Number,
      unit: {
        type: String,
        enum: ["month", "year"],
      },
      type: {
        type: String,
        enum: ["manufacturer", "seller"],
      },
    },

    category: {
      type: String,
      enum: ["gaming", "streaming", "workstation", "office", "budget"],
    },

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
      },
    },

    viewCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },

    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(PREBUILT_PC_STATUS),
      default: PREBUILT_PC_STATUS.DRAFT,
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

prebuiltPcSchema.pre("save", function () {
  if (this.isNew || this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

prebuiltPcSchema.plugin(mongoosePaginate);

prebuiltPcSchema.index({ "pricing.price": 1 });
prebuiltPcSchema.index({ status: 1 });
prebuiltPcSchema.index({ status: 1, isFeatured: 1 });
prebuiltPcSchema.index({ soldCount: -1 });
prebuiltPcSchema.index({ "rating.average": -1 });
prebuiltPcSchema.index({ category: 1 });

const PrebuiltPC = mongoose.model("PrebuiltPC", prebuiltPcSchema);

export default PrebuiltPC;
