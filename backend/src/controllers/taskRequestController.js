const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const requestService = require("../services/requestService");
const taskService = require("../services/taskService");

const applyForTask = asyncHandler(async (req, res) => {
  const request = await requestService.applyForTask(req.user._id, req.body.taskId);
  return successResponse(res, 201, "Task application submitted successfully", {
    request: requestService.serializeRequest(request),
  });
});

const acceptRequest = asyncHandler(async (req, res) => {
  const result = await requestService.acceptRequest(req.user._id, req.params.requestId);
  return successResponse(res, 200, "Task request accepted successfully", {
    request: requestService.serializeRequest(result.request),
    task: taskService.serializeTask(result.task),
  });
});

const rejectRequest = asyncHandler(async (req, res) => {
  const request = await requestService.rejectRequest(
    req.user._id,
    req.params.requestId,
    req.body.responseNote || ""
  );

  return successResponse(res, 200, "Task request rejected successfully", {
    request: requestService.serializeRequest(request),
  });
});

const getTaskApplicants = asyncHandler(async (req, res) => {
  const requests = await requestService.getTaskApplicants(
    req.user._id,
    req.params.taskId,
    req.query
  );

  return successResponse(res, 200, "Task applicants fetched successfully", {
    count: requests.length,
    requests: requests.map(requestService.serializeRequest),
  });
});

const getWorkerRequests = asyncHandler(async (req, res) => {
  const requests = await requestService.getWorkerRequests(req.user._id, req.query);
  return successResponse(res, 200, "Worker requests fetched successfully", {
    count: requests.length,
    requests: requests.map(requestService.serializeRequest),
  });
});

const markWorkerRequestComplete = asyncHandler(async (req, res) => {
  const result = await requestService.markWorkerRequestComplete(
    req.user._id,
    req.params.requestId
  );

  return successResponse(res, 200, "Work marked complete successfully", {
    request: requestService.serializeRequest(result.request),
    task: taskService.serializeTask(result.task),
  });
});

const getRequestChatRoom = asyncHandler(async (req, res) => {
  const chatRoom = await requestService.getRequestChatRoom(req.user._id, req.params.requestId);
  return successResponse(res, 200, "Chat room fetched successfully", { chatRoom });
});

module.exports = {
  applyForTask,
  sendTaskRequest: applyForTask,
  acceptRequest,
  acceptTaskRequest: acceptRequest,
  rejectRequest,
  rejectTaskRequest: rejectRequest,
  getTaskApplicants,
  getProviderTaskRequests: getTaskApplicants,
  getWorkerRequests,
  getWorkerTaskRequests: getWorkerRequests,
  markWorkerRequestComplete,
  getRequestChatRoom,
};
