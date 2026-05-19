const mongoose = require("mongoose");

const PAY_TYPES = ["hourly", "daily", "fixed"];
const TASK_STATUSES = ["draft", "open", "full", "in_progress", "completed", "cancelled"];

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator(value) {
          return (
            Array.isArray(value) &&
            value.length === 2 &&
            value[0] >= -180 &&
            value[0] <= 180 &&
            value[1] >= -90 &&
            value[1] <= 90
          );
        },
        message: "Location coordinates must be [longitude, latitude]",
      },
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      maxlength: 80,
    },
    payAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    payType: {
      type: String,
      enum: PAY_TYPES,
      required: true,
    },
    workersNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    workersJoined: {
      type: Number,
      default: 0,
      min: 0,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    location: {
      type: pointSchema,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "open",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
      index: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ location: "2dsphere" });
taskSchema.index({ status: 1, startTime: 1 });
taskSchema.index({ status: 1, category: 1, payType: 1 });
taskSchema.index({ taskProviderId: 1, createdAt: -1 });
taskSchema.index({ taskProviderId: 1, status: 1, createdAt: -1 });

taskSchema.pre("validate", function validateTaskWindow() {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate("endTime", "endTime must be after startTime");
  }

  if (this.workersJoined > this.workersNeeded) {
    this.invalidate("workersJoined", "workersJoined cannot exceed workersNeeded");
  }

  if (this.workersJoined >= this.workersNeeded && this.status === "open") {
    this.status = "full";
  }
});

taskSchema.statics.openTaskFilter = function openTaskFilter(extraFilter = {}) {
  return {
    ...extraFilter,
    status: "open",
    $expr: { $lt: ["$workersJoined", "$workersNeeded"] },
    endTime: { $gt: new Date() },
  };
};

taskSchema.statics.markFullTasks = function markFullTasks() {
  return this.updateMany(
    {
      status: "open",
      $expr: { $gte: ["$workersJoined", "$workersNeeded"] },
    },
    { $set: { status: "full" } }
  );
};

taskSchema.statics.markExpiredTasks = function markExpiredTasks() {
  return this.updateMany(
    {
      status: "open",
      endTime: { $lte: new Date() },
    },
    { $set: { status: "completed" } }
  );
};

module.exports = mongoose.model("Task", taskSchema);
