const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const taskService = require("../services/taskService");

const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user._id, req.body);
  return successResponse(res, 201, "Task created successfully", {
    task: taskService.serializeTask(task),
  });
});

const getNearbyTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getNearbyTasks(req.query);
  return successResponse(res, 200, "Open tasks fetched successfully", {
    count: tasks.length,
    tasks: tasks.map(taskService.serializeTask),
  });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.params.taskId, {
    openOnly: false,
  });

  return successResponse(res, 200, "Task fetched successfully", {
    task: taskService.serializeTask(task),
  });
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(
    req.user._id,
    req.params.taskId,
    req.body.status
  );

  return successResponse(res, 200, "Task status updated successfully", {
    task: taskService.serializeTask(task),
  });
});

const getProviderTasks = asyncHandler(async (req, res) => {
  const tasks = await taskService.getProviderTasks(req.user._id, req.query);
  return successResponse(res, 200, "Provider tasks fetched successfully", {
    count: tasks.length,
    tasks: tasks.map(taskService.serializeTask),
  });
});

module.exports = {
  createTask,
  getNearbyTasks,
  exploreTasks: getNearbyTasks,
  getTaskById,
  updateTaskStatus,
  getProviderTasks,
};
