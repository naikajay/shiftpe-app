const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      enum: ["aadhaar", "pan", "selfie", "driving_license", "voter_id", "other"],
    },
    documentUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

verificationSchema.index({ userId: 1, documentType: 1 }, { unique: true });
verificationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Verification", verificationSchema);
