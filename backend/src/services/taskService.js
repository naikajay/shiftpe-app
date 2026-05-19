const Task = require("../models/Task");
const TaskRequest = require("../models/TaskRequest");
const TaskHistory = require("../models/TaskHistory");
const Payment = require("../models/Payment");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { createNotifications } = require("./notificationService");
const matchingService = require("./matchingService");
const { emitTaskUpdate } = require("../sockets/socket");

const buildPaymentAmounts = (amount) => {
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT) || 0;
  const platformFeeAmount = Number(((Number(amount) * feePercent) / 100).toFixed(2));

  return {
    platformFeeAmount,
    workerNetAmount: Number((Number(amount) - platformFeeAmount).toFixed(2)),
  };
};

const serializeTask = (task) => ({
  _id: task._id,
  taskProviderId: task.taskProviderId,
  title: task.title,
  description: task.description,
  category: task.category,
  payAmount: task.payAmount,
  payType: task.payType,
  workersNeeded: task.workersNeeded,
  workersJoined: task.workersJoined,
  startTime: task.startTime,
  endTime: task.endTime,
  location: task.location,
  address: task.address,
  status: task.status,
  distanceMeters: task.distanceMeters,
  completedAt: task.completedAt,
  cancelledAt: task.cancelledAt,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const createTask = async (providerId, payload) => {
  const task = await Task.create({
    taskProviderId: providerId,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    payAmount: payload.payAmount,
    payType: payload.payType,
    workersNeeded: payload.workersNeeded,
    startTime: payload.startTime,
    endTime: payload.endTime,
    location: payload.location,
    address: payload.address,
  });

  return task;
};

const getNearbyTasks = async (query) => {
  return matchingService.getOpenTasks(query);
};

const getTaskById = async (taskId, options = {}) => {
  await Promise.all([Task.markFullTasks(), Task.markExpiredTasks()]);

  const filter = options.openOnly
    ? Task.openTaskFilter({ _id: taskId })
    : { _id: taskId };

  const task = await Task.findOne(filter);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  return task;
};

const getProviderTasks = async (providerId, query = {}) => {
  await Promise.all([Task.markFullTasks(), Task.markExpiredTasks()]);

  const filter = { taskProviderId: providerId };
  if (query.status) {
    filter.status = query.status;
  }

  return Task.find(filter).sort({ createdAt: -1 }).limit(100);
};

const completeTask = async (task) => {
  const acceptedRequests = await TaskRequest.find({
    taskId: task._id,
    status: "accepted",
  });

  const acceptedWorkerIds = acceptedRequests.map((request) => request.workerId);
  const workedHours = Math.max(
    0,
    (new Date(task.endTime).getTime() - new Date(task.startTime).getTime()) /
      (1000 * 60 * 60)
  );

  task.status = "completed";
  task.completedAt = new Date();
  await task.save();

  await TaskRequest.updateMany(
    { taskId: task._id, status: "accepted" },
    { $set: { status: "completed" } }
  );

  await TaskRequest.updateMany(
    { taskId: task._id, status: "pending" },
    { $set: { status: "rejected", respondedAt: new Date(), responseNote: "Task completed" } }
  );

  if (acceptedWorkerIds.length) {
    await User.updateMany(
      { _id: { $in: acceptedWorkerIds }, activeTaskId: task._id },
      {
        $set: { isWorking: false, activeTaskId: null },
        $inc: { completedTasksCount: 1 },
      }
    );

    await TaskHistory.insertMany(
      acceptedWorkerIds.map((workerId) => ({
        workerId,
        taskId: task._id,
        taskProviderId: task.taskProviderId,
        taskTitle: task.title,
        amountEarned: task.payAmount,
        workedHours,
      }))
    );

    await Payment.insertMany(
      acceptedWorkerIds.map((workerId) => ({
        taskId: task._id,
        payerId: task.taskProviderId,
        receiverId: workerId,
        amount: task.payAmount,
        ...buildPaymentAmounts(task.payAmount),
        paymentMethod: "Cash",
        paymentStatus: "pending",
      })),
      { ordered: false }
    ).catch((error) => {
      if (error.code !== 11000) {
        throw error;
      }
    });

    await createNotifications(
      acceptedWorkerIds.map((workerId) => ({
        userId: workerId,
        title: "Task completed",
        message: `${task.title} has been marked completed.`,
        type: "task",
        entityType: "Task",
        entityId: task._id,
      }))
    );
  }

  return task;
};

const cancelTask = async (task) => {
  const activeRequests = await TaskRequest.find({
    taskId: task._id,
    status: { $in: ["accepted", "pending"] },
  });
  const acceptedWorkerIds = activeRequests
    .filter((request) => request.status === "accepted")
    .map((request) => request.workerId);

  task.status = "cancelled";
  task.cancelledAt = new Date();
  await task.save();

  await TaskRequest.updateMany(
    { taskId: task._id, status: { $in: ["accepted", "pending"] } },
    { $set: { status: "cancelled", respondedAt: new Date(), responseNote: "Task cancelled" } }
  );

  if (acceptedWorkerIds.length) {
    await User.updateMany(
      { _id: { $in: acceptedWorkerIds }, activeTaskId: task._id },
      { $set: { isWorking: false, activeTaskId: null } }
    );
  }

  await createNotifications(
    activeRequests.map((request) => ({
      userId: request.workerId,
      title: "Task cancelled",
      message: `${task.title} has been cancelled.`,
      type: "task",
      entityType: "Task",
      entityId: task._id,
    }))
  );

  return task;
};

const updateTaskStatus = async (providerId, taskId, status) => {
  const task = await Task.findOne({ _id: taskId, taskProviderId: providerId });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (task.status === status) {
    return task;
  }

  let updatedTask = task;

  if (status === "completed") {
    updatedTask = await completeTask(task);
  } else if (status === "cancelled") {
    updatedTask = await cancelTask(task);
  } else if (status === "open") {
    if (task.workersJoined >= task.workersNeeded) {
      throw new AppError("Full tasks cannot be reopened without increasing workersNeeded", 409);
    }
    task.status = "open";
    task.cancelledAt = null;
    updatedTask = await task.save();
  }

  emitTaskUpdate(String(updatedTask._id), "task:status", serializeTask(updatedTask));
  return updatedTask;
};

module.exports = {
  serializeTask,
  createTask,
  getNearbyTasks,
  getTaskById,
  getProviderTasks,
  updateTaskStatus,
};
