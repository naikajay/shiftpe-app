const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const workerService = require("../services/workerService");
const taskService = require("../services/taskService");

const getMyProfile = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "Profile fetched successfully", {
    user: workerService.serializeUser(req.user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await workerService.updateProfile(req.user._id, req.body);
  return successResponse(res, 200, "Profile updated successfully", {
    user: workerService.serializeUser(user),
  });
});

const getActiveTask = asyncHandler(async (req, res) => {
  const task = await workerService.getActiveTask(req.user);
  return successResponse(res, 200, "Active task fetched successfully", {
    task: task ? taskService.serializeTask(task) : null,
  });
});

const getTaskHistory = asyncHandler(async (req, res) => {
  const history = await workerService.getTaskHistory(req.user._id, req.query);
  return successResponse(res, 200, "Task history fetched successfully", {
    count: history.length,
    history,
  });
});

const getNearbyWorkers = asyncHandler(async (req, res) => {
  const workers = await workerService.getNearbyWorkers(req.query);
  return successResponse(res, 200, "Nearby workers fetched successfully", {
    count: workers.length,
    workers,
  });
});

module.exports = {
  getMyProfile,
  updateProfile,
  getActiveTask,
  getTaskHistory,
  getNearbyWorkers,
};
