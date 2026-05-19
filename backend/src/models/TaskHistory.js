const mongoose = require("mongoose");

const taskHistorySchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    taskTitle: {
      type: String,
      required: true,
      trim: true,
    },
    amountEarned: {
      type: Number,
      required: true,
      min: 0,
    },
    workedHours: {
      type: Number,
      required: true,
      min: 0,
    },
    taskProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TaskHistory", taskHistorySchema);
