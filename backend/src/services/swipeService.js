const Task = require("../models/Task");
const TaskRequest = require("../models/TaskRequest");
const AppError = require("../utils/AppError");
const { getPagination } = require("../utils/pagination");
const { createNotification } = require("./notificationService");

const getCoordinates = (worker, query) => {
  const longitude =
    query.longitude !== undefined ? Number(query.longitude) : worker.location?.coordinates?.[0];
  const latitude =
    query.latitude !== undefined ? Number(query.latitude) : worker.location?.coordinates?.[1];

  if (longitude === undefined || latitude === undefined) {
    throw new AppError("Worker location is required for swipe feed", 400);
  }

  return [longitude, latitude];
};

const serializeSwipeTask = (task) => ({
  taskId: task._id,
  title: task.title,
  description: task.description,
  payAmount: task.payAmount,
  payType: task.payType,
  workersNeeded: task.workersNeeded,
  workersJoined: task.workersJoined,
  startTime: task.startTime,
  endTime: task.endTime,
  address: task.address,
  distance: task.distance,
  taskProvider:
    task.taskProviderId && typeof task.taskProviderId === "object"
      ? {
          _id: task.taskProviderId._id,
          fullName: task.taskProviderId.fullName,
          phone: task.taskProviderId.phone,
          ratingAverage: task.taskProviderId.ratingAverage,
          verified: task.taskProviderId.verified,
        }
      : null,
});

const getSwipeFeed = async (worker, query = {}) => {
  if (worker.role !== "worker") {
    throw new AppError("Only workers can access swipe feed", 403);
  }

  if (worker.isWorking) {
    throw new AppError("Worker already has an active task", 409);
  }

  await Promise.all([Task.markFullTasks(), Task.markExpiredTasks()]);

  const { page, limit, skip } = getPagination(query);
  const [longitude, latitude] = getCoordinates(worker, query);
  const radiusKm = Math.min(Number(query.radiusKm) || 25, 100);

  const requestedTaskIds = await TaskRequest.distinct("taskId", {
    workerId: worker._id,
  });

  const filter = Task.openTaskFilter({
    taskProviderId: { $ne: worker._id },
    _id: { $nin: requestedTaskIds },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: radiusKm * 1000,
      },
    },
  });

  const tasks = await Task.find(filter)
    .populate("taskProviderId", "fullName phone ratingAverage verified")
    .skip(skip)
    .limit(limit);

  return {
    page,
    limit,
    hasMore: tasks.length === limit,
    tasks: tasks.map((task) => {
      const [taskLongitude, taskLatitude] = task.location.coordinates;
      const distance = calculateDistanceMeters(latitude, longitude, taskLatitude, taskLongitude);

      return serializeSwipeTask({
        ...task.toObject(),
        distance,
      });
    }),
  };
};

const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const earthRadiusMeters = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const swipeRight = async (worker, taskId) => {
  if (worker.role !== "worker") {
    throw new AppError("Only workers can request tasks", 403);
  }

  if (worker.isWorking) {
    throw new AppError("Worker already has an active task", 409);
  }

  const existingRequest = await TaskRequest.findOne({
    taskId,
    workerId: worker._id,
  });

  if (existingRequest) {
    throw new AppError("You have already requested this task", 409);
  }

  const task = await Task.findOne(Task.openTaskFilter({ _id: taskId }));

  if (!task) {
    throw new AppError("Task is not open for requests", 409);
  }

  if (String(task.taskProviderId) === String(worker._id)) {
    throw new AppError("You cannot request your own task", 400);
  }

  try {
    const request = await TaskRequest.create({
      taskId: task._id,
      workerId: worker._id,
      taskProviderId: task.taskProviderId,
    });

    await createNotification({
      userId: task.taskProviderId,
      title: "New task request",
      message: `${worker.fullName} requested to join ${task.title}.`,
      type: "request",
      entityType: "TaskRequest",
      entityId: request._id,
    });

    return request;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("You have already requested this task", 409);
    }

    throw error;
  }
};

const swipeLeft = async () => ({
  skipped: true,
});

const swipe = async (worker, payload) => {
  const direction =
    payload.direction ||
    (payload.action === "interested" ? "right" : "left");

  if (direction === "right") {
    const request = await swipeRight(worker, payload.taskId);
    return { direction: "right", action: "interested", request };
  }

  await swipeLeft(worker, payload.taskId);
  return { direction: "left", action: "ignored", skipped: true };
};

module.exports = {
  getSwipeFeed,
  swipeRight,
  swipeLeft,
  swipe,
};
