const Task = require("../models/Task");

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

module.exports = {
  buildExploreFilter,
  getOpenTasks,
};
