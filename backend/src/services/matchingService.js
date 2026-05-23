const Task = require("../models/Task");
const User = require("../models/User");

const buildExploreFilter = (query = {}) => {
  const filter = {};

  if (query.category) {
    filter.category = String(query.category).trim().toLowerCase();
  }

  if (query.payType) {
    filter.payType = query.payType;
  }

  if (query.minPay !== undefined || query.maxPay !== undefined) {
    filter.payAmount = {};
    if (query.minPay !== undefined) filter.payAmount.$gte = Number(query.minPay);
    if (query.maxPay !== undefined) filter.payAmount.$lte = Number(query.maxPay);
  }

  return filter;
};

const getOpenTasks = async (query = {}) => {
  await Promise.all([Task.markFullTasks(), Task.markExpiredTasks()]);

  const filters = buildExploreFilter(query);
  const limit = Math.min(Number(query.limit) || 20, 100);
  const sortBy = query.sortBy || (query.longitude ? "distance" : "startTime");

  if (query.longitude !== undefined) {
    const sort =
      sortBy === "payAmount"
        ? { payAmount: -1 }
        : sortBy === "createdAt"
        ? { createdAt: -1 }
        : sortBy === "startTime"
        ? { startTime: 1 }
        : { distanceMeters: 1 };

    return Task.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(query.longitude), Number(query.latitude)],
          },
          distanceField: "distanceMeters",
          maxDistance: Number(query.radiusKm) * 1000,
          spherical: true,
          query: {
            ...filters,
            status: "open",
            endTime: { $gt: new Date() },
          },
        },
      },
      { $match: { $expr: { $lt: ["$workersJoined", "$workersNeeded"] } } },
      { $sort: sort },
      { $limit: limit },
    ]);
  }

  const sort =
    sortBy === "payAmount"
      ? { payAmount: -1 }
      : sortBy === "createdAt"
      ? { createdAt: -1 }
      : { startTime: 1 };

  return Task.find(Task.openTaskFilter(filters)).sort(sort).limit(limit);
};

const getNearbyWorkersForTask = async (task, options = {}) => {
  const radiusKm = Math.min(Number(options.radiusKm) || Number(process.env.NEARBY_TASK_RADIUS_KM) || 25, 100);
  const limit = Math.min(Number(options.limit) || 100, 200);

  if (!task.location?.coordinates?.length) {
    return [];
  }

  return User.find({
    role: "worker",
    isAvailable: true,
    isWorking: false,
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: task.location.coordinates,
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  })
    .limit(limit)
    .select("_id fullName phone location skills ratingAverage reliabilityScore");
};

const getRecommendedTasks = async (worker, query = {}) => {
  const baseQuery = {
    ...query,
    longitude: query.longitude ?? worker.location?.coordinates?.[0],
    latitude: query.latitude ?? worker.location?.coordinates?.[1],
    radiusKm: query.radiusKm ?? 25,
    limit: query.limit ?? 20,
    sortBy: "distance",
  };

  const tasks = await getOpenTasks(baseQuery);
  const skills = new Set((worker.skills || []).map((skill) => String(skill).toLowerCase()));

  return tasks
    .map((task) => {
      const categoryMatch = skills.has(String(task.category).toLowerCase()) ? 1 : 0;
      const distanceScore = task.distanceMeters ? Math.max(0, 1 - task.distanceMeters / 25000) : 0.5;
      const payScore = Math.min(Number(task.payAmount || 0) / 1000, 1);

      return {
        ...task,
        recommendationScore: Number((distanceScore * 0.5 + categoryMatch * 0.3 + payScore * 0.2).toFixed(3)),
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore);
};

module.exports = {
  buildExploreFilter,
  getOpenTasks,
  getNearbyWorkersForTask,
  getRecommendedTasks,
};
