const mongoose = require("mongoose");

const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      default: undefined,
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }

          return (
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

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["worker", "taskProvider", "admin"],
      default: "worker",
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: PHONE_REGEX,
    },
    profileImage: {
      type: String,
      trim: true,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    hourlyRate: {
      type: Number,
      min: 0,
      default: 0,
    },
    expoPushToken: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    skills: {
      type: [String],
      default: [],
      set: (skills) =>
        Array.isArray(skills)
          ? [...new Set(skills.map((skill) => String(skill).trim().toLowerCase()))]
          : skills,
      validate: {
        validator(value) {
          return value.length <= 30;
        },
        message: "A user can have at most 30 skills",
      },
    },
    location: pointSchema,
    isWorking: {
      type: Boolean,
      default: false,
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    activeTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    currentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },
    lastActive: {
      type: Date,
      default: null,
      index: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reliabilityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedTasksCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ location: "2dsphere" });
userSchema.index({ role: 1, isWorking: 1 });
userSchema.index({ role: 1, isAvailable: 1, isWorking: 1, isOnline: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ ratingAverage: -1 });
userSchema.index({ activeTaskId: 1 });

module.exports = mongoose.model("User", userSchema);
