import mongoose from "mongoose";
import { SENDER_ROLES } from "../constants/support.constants.js";

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true },
    originalName: { type: String, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number },
  },
  { _id: false }
);

const supportMessageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderRole: {
      type: String,
      enum: Object.values(SENDER_ROLES),
      required: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 5000,
    },

    attachments: {
      type: [attachmentSchema],
      default: [],
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  }
);

supportMessageSchema.index({ ticket: 1, createdAt: 1 });

const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);

export default SupportMessage;