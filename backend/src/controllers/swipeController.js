const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const swipeService = require("../services/swipeService");

const getSwipeFeed = asyncHandler(async (req, res) => {
  const feed = await swipeService.getSwipeFeed(req.user, req.query);

  return successResponse(res, 200, "Swipe feed fetched successfully", feed);
});

const swipeRight = asyncHandler(async (req, res) => {
  const request = await swipeService.swipeRight(req.user, req.params.taskId);

  return successResponse(res, 201, "Task request sent successfully", {
    request,
  });
});

const swipeLeft = asyncHandler(async (req, res) => {
  const result = await swipeService.swipeLeft(req.user, req.params.taskId);

  return successResponse(res, 200, "Task skipped successfully", result);
});

module.exports = {
  getSwipeFeed,
  swipeRight,
  swipeLeft,
};
