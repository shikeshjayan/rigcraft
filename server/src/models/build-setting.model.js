import mongoose from "mongoose";

const buildSettingSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    assemblyFeeEnabled: {
      type: Boolean,
      default: false,
    },
    assemblyFeeType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    assemblyFeeValue: {
      type: Number,
      default: 0.5,
    },
    requireCompleteBuild: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.maintenanceMessage;
        return ret;
      },
    },
  },
);

const BuildSetting = mongoose.model("BuildSetting", buildSettingSchema);

export default BuildSetting;
