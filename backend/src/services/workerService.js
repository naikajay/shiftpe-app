const User = require("../models/User");
const Task = require("../models/Task");
const TaskHistory = require("../models/TaskHistory");

const serializeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage,
  skills: user.skills,
  hourlyRate: user.hourlyRate,
  location: user.location,
  isWorking: user.isWorking,
  isAvailable: user.isAvailable,
  activeTaskId: user.activeTaskId,
  verified: user.verified,
  reliabilityScore: user.reliabilityScore,
  ratingAverage: user.ratingAverage,
  totalRatings: user.totalRatings,
  completedTasksCount: user.completedTasksCount,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const updateProfile = async (userId, payload) => {
  const allowedFields = ["fullName", "profileImage", "skills", "hourlyRate", "location", "isAvailable"];
  const patch = {};

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      patch[field] = payload[field];
    }
  });

  return User.findByIdAndUpdate(userId, patch, {
    returnDocument: "after",
    runValidators: true,
  });
};

const getActiveTask = async (worker) => {
  if (!worker.activeTaskId) {
    return null;
  }

  return Task.findById(worker.activeTaskId);
};

const getTaskHistory = async (workerId, query = {}) => {
  return TaskHistory.find({ workerId })
    .populate("taskId")
    .sort({ completedAt: -1 })
    .limit(Math.min(Number(query.limit) || 50, 100));
};

const getNearbyWorkers = async (query = {}) => {
  const limit = Math.min(Number(query.limit) || 20, 100);
  const filter = {
    role: "worker",
    isAvailable: true,
    isWorking: false,
  };

  if (query.skills) {
    const skills = String(query.skills)
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
      .filter(Boolean);

    if (skills.length) {
      filter.skills = { $in: skills };
    }
  }

  if (query.longitude !== undefined && query.latitude !== undefined && query.radiusKm !== undefined) {
    return User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(query.longitude), Number(query.latitude)],
          },
          distanceField: "distanceMeters",
          maxDistance: Number(query.radiusKm) * 1000,
          spherical: true,
          query: filter,
        },
      },
      { $sort: { reliabilityScore: -1, ratingAverage: -1 } },
      { $limit: limit },
      {
        $project: {
          firebaseUid: 0,
        },
      },
    ]);
  }

  return User.find(filter)
    .sort({ reliabilityScore: -1, ratingAverage: -1 })
    .limit(limit)
    .select("-firebaseUid");
};

module.exports = {
  serializeUser,
  updateProfile,
  getActiveTask,
  getTaskHistory,
  getNearbyWorkers,
};
