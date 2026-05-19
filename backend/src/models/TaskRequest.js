const mongoose = require("mongoose");

const REQUEST_STATUSES = ["pending", "accepted", "rejected", "cancelled", "completed"];

const taskRequestSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    responseNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

taskRequestSchema.index({ taskId: 1, workerId: 1 }, { unique: true });
taskRequestSchema.index({ taskId: 1, status: 1, requestedAt: -1 });
taskRequestSchema.index({ taskProviderId: 1, status: 1, requestedAt: -1 });
taskRequestSchema.index({ workerId: 1, status: 1, requestedAt: -1 });

module.exports = mongoose.model("TaskRequest", taskRequestSchema);
