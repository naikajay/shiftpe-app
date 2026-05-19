const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const verificationService = require("../services/verificationService");

const submitVerification = asyncHandler(async (req, res) => {
  const verification = await verificationService.submitVerification(req.user._id, req.body);
  return successResponse(res, 201, "Verification submitted successfully", { verification });
});

const getMyVerifications = asyncHandler(async (req, res) => {
  const verifications = await verificationService.getMyVerifications(req.user._id);
  return successResponse(res, 200, "Verifications fetched successfully", {
    count: verifications.length,
    verifications,
  });
});

module.exports = {
  submitVerification,
  getMyVerifications,
};
