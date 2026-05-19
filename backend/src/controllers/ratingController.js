const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const ratingService = require("../services/ratingService");
const { serializeUser } = require("../services/workerService");

const createRating = asyncHandler(async (req, res) => {
  const result = await ratingService.createRating(req.user._id, req.body);
  return successResponse(res, 201, "Rating submitted successfully", {
    rating: result.rating,
    worker: serializeUser(result.worker),
  });
});

module.exports = {
  createRating,
};
