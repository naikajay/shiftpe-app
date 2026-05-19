const Task = require("../models/Task");
const TaskRequest = require("../models/TaskRequest");
const User = require("../models/User");
const ChatRoom = require("../models/ChatRoom");
const Payment = require("../models/Payment");
const AppError = require("../utils/AppError");
const { createNotification } = require("./notificationService");
const { emitTaskUpdate } = require("../sockets/socket");

const serializeRequest = (request) => ({
  _id: request._id,
  taskId: request.taskId,
  workerId: request.workerId,
  taskProviderId: request.taskProviderId,
  status: request.status,
  requestedAt: request.requestedAt,
  respondedAt: request.respondedAt,
  responseNote: request.responseNote,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
});

const buildPaymentAmounts = (amount) => {
  const feePercent = Number(process.env.PLATFORM_FEE_PERCENT) || 0;
  const platformFeeAmount = Number(((Number(amount) * feePercent) / 100).toFixed(2));

  return {
    platformFeeAmount,
    workerNetAmount: Number((Number(amount) - platformFeeAmount).toFixed(2)),
  };
};

const applyForTask = async (workerId, taskId) => {
  try {
    await Promise.all([Task.markFullTasks(), Task.markExpiredTasks()]);

    const worker = await User.findOne({ _id: workerId, role: "worker" });
    if (!worker) {
      throw new AppError("Only workers can apply to tasks", 403);
    }

    if (worker.isWorking || worker.activeTaskId) {
      throw new AppError("Worker already has an active task", 409);
    }

    const existingRequest = await TaskRequest.findOne({ taskId, workerId });
    if (existingRequest) {
      throw new AppError("Worker has already applied for this task", 409);
    }

    const task = await Task.findOne(Task.openTaskFilter({ _id: taskId }));
    if (!task) {
      throw new AppError("Task not found or no longer open", 404);
    }

    if (String(task.taskProviderId) === String(worker._id)) {
      throw new AppError("Task providers cannot apply to their own tasks", 400);
    }

    const createdRequest = await TaskRequest.create({
      taskId: task._id,
      workerId: worker._id,
      taskProviderId: task.taskProviderId,
    });

    await createNotification({
      userId: task.taskProviderId,
      title: "New task application",
      message: `${worker.fullName} applied for ${task.title}.`,
      type: "request",
      entityType: "TaskRequest",
      entityId: createdRequest._id,
    });

    return createdRequest;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("Worker has already applied for this task", 409);
    }

    throw error;
  }
};

const acceptRequest = async (providerId, requestId) => {
  await Promise.all([Task.markFullTasks(), Task.markExpiredTasks()]);

  const request = await TaskRequest.findOne({
    _id: requestId,
    taskProviderId: providerId,
    status: "pending",
  });

  if (!request) {
    throw new AppError("Pending task request not found", 404);
  }

  const workerUpdate = await User.updateOne(
    {
      _id: request.workerId,
      role: "worker",
      isWorking: false,
      activeTaskId: null,
    },
    {
      $set: {
        isWorking: true,
        activeTaskId: request.taskId,
      },
    }
  );

  if (workerUpdate.modifiedCount !== 1) {
    throw new AppError("Worker is no longer available", 409);
  }

  const taskUpdate = await Task.updateOne(
    {
      _id: request.taskId,
      taskProviderId: providerId,
      status: "open",
      endTime: { $gt: new Date() },
      $expr: { $lt: ["$workersJoined", "$workersNeeded"] },
    },
    { $inc: { workersJoined: 1 } }
  );

  if (taskUpdate.modifiedCount !== 1) {
    await User.updateOne(
      { _id: request.workerId },
      { $set: { isWorking: false, activeTaskId: null } }
    );
    throw new AppError("Task is full or no longer open", 409);
  }

  const updatedTask = await Task.findById(request.taskId);
  if (updatedTask.workersJoined >= updatedTask.workersNeeded) {
    updatedTask.status = "full";
    await updatedTask.save();
  }

  const acceptedRequest = await TaskRequest.findOneAndUpdate(
    { _id: request._id, status: "pending" },
    { $set: { status: "accepted", respondedAt: new Date() } },
    { returnDocument: "after", runValidators: true }
  );

  if (!acceptedRequest) {
    await User.updateOne(
      { _id: request.workerId, activeTaskId: request.taskId },
      { $set: { isWorking: false, activeTaskId: null } }
    );
    await Task.updateOne({ _id: request.taskId }, { $inc: { workersJoined: -1 } });
    throw new AppError("Task request was already handled", 409);
  }

  await ChatRoom.findOneAndUpdate(
    { taskId: updatedTask._id },
    {
      $addToSet: {
        participants: { $each: [providerId, request.workerId] },
      },
      $setOnInsert: {
        taskId: updatedTask._id,
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true }
  );

  await createNotification({
    userId: request.workerId,
    title: "Application accepted",
    message: `You were accepted for ${updatedTask.title}.`,
    type: "request",
    entityType: "TaskRequest",
    entityId: acceptedRequest._id,
  });

  emitTaskUpdate(String(updatedTask._id), "task:status", updatedTask);
  emitTaskUpdate(String(updatedTask._id), "task:accepted", {
    task: updatedTask,
    request: acceptedRequest,
  });
  return { request: acceptedRequest, task: updatedTask };
};

const rejectRequest = async (providerId, requestId, responseNote = "") => {
  const request = await TaskRequest.findOneAndUpdate(
    {
      _id: requestId,
      taskProviderId: providerId,
      status: "pending",
    },
    {
      $set: {
        status: "rejected",
        respondedAt: new Date(),
        responseNote,
      },
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!request) {
    throw new AppError("Pending task request not found", 404);
  }

  await createNotification({
    userId: request.workerId,
    title: "Application rejected",
    message: "Your task application was rejected.",
    type: "request",
    entityType: "TaskRequest",
    entityId: request._id,
  });

  return request;
};

const getTaskApplicants = async (providerId, taskId, query = {}) => {
  const task = await Task.findOne({ _id: taskId, taskProviderId: providerId });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const filter = { taskId, taskProviderId: providerId };
  if (query.status) {
    filter.status = query.status;
  }

  return TaskRequest.find(filter)
    .populate("workerId", "fullName phone profileImage skills ratingAverage reliabilityScore verified")
    .sort({ requestedAt: -1 })
    .limit(Math.min(Number(query.limit) || 100, 100));
};

const getWorkerRequests = async (workerId, query = {}) => {
  const filter = { workerId };
  if (query.status) {
    filter.status = query.status;
  }

  return TaskRequest.find(filter)
    .populate("taskId")
    .sort({ requestedAt: -1 })
    .limit(Math.min(Number(query.limit) || 100, 100));
};

const markWorkerRequestComplete = async (workerId, requestId) => {
  const request = await TaskRequest.findOne({
    _id: requestId,
    workerId,
    status: "accepted",
  });

  if (!request) {
    throw new AppError("Accepted task request not found", 404);
  }

  const task = await Task.findOne({
    _id: request.taskId,
    status: { $in: ["full", "in_progress", "open"] },
  });

  if (!task) {
    throw new AppError("Task is not active", 409);
  }

  request.status = "completed";
  request.respondedAt = new Date();
  request.responseNote = "Marked complete by worker";
  await request.save();

  await User.updateOne(
    { _id: workerId, activeTaskId: request.taskId },
    { $set: { isWorking: false, activeTaskId: null } }
  );

  const remainingAccepted = await TaskRequest.countDocuments({
    taskId: request.taskId,
    status: "accepted",
  });

  if (remainingAccepted === 0) {
    task.status = "completed";
    task.completedAt = new Date();
    await task.save();
  } else if (task.status === "full") {
    task.status = "in_progress";
    await task.save();
  }

  await Payment.findOneAndUpdate(
    { taskId: request.taskId, receiverId: workerId },
    {
      $setOnInsert: {
        taskId: request.taskId,
        payerId: request.taskProviderId,
        receiverId: workerId,
        amount: task.payAmount,
        ...buildPaymentAmounts(task.payAmount),
        paymentMethod: "Cash",
        paymentStatus: "pending",
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true }
  );

  await createNotification({
    userId: request.taskProviderId,
    title: "Work marked complete",
    message: "A worker marked their assigned task complete.",
    type: "task",
    entityType: "TaskRequest",
    entityId: request._id,
  });

  emitTaskUpdate(String(task._id), "task:status", task);
  emitTaskUpdate(String(task._id), "task:work-completed", {
    task,
    request,
    workerId,
  });
  return { request, task };
};

const getRequestChatRoom = async (userId, requestId) => {
  const request = await TaskRequest.findOne({
    _id: requestId,
    $or: [{ workerId: userId }, { taskProviderId: userId }],
    status: { $in: ["accepted", "completed"] },
  });

  if (!request) {
    throw new AppError("Task request chat not found", 404);
  }

  const chatRoom = await ChatRoom.findOne({ taskId: request.taskId, participants: userId });

  if (!chatRoom) {
    throw new AppError("Chat room not found", 404);
  }

  return chatRoom;
};

module.exports = {
  serializeRequest,
  applyForTask,
  acceptRequest,
  rejectRequest,
  getTaskApplicants,
  getWorkerRequests,
  markWorkerRequestComplete,
  getRequestChatRoom,
};
