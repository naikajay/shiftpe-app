const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFeeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    workerNetAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Cash", "Card", "Wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    transactionRef: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ taskId: 1, receiverId: 1 }, { unique: true });
paymentSchema.index({ payerId: 1, paymentStatus: 1, createdAt: -1 });
paymentSchema.pre("validate", function calculateAmounts() {
  if (!this.workerNetAmount) {
    this.workerNetAmount = Math.max(0, this.amount - (this.platformFeeAmount || 0));
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
