const User = require("../models/User");
const Task = require("../models/Task");
const Report = require("../models/Report");
const Payment = require("../models/Payment");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const verificationService = require("../services/verificationService");

const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 50, 100))
    .select("-firebaseUid");

  return successResponse(res, 200, "Users fetched successfully", {
    count: users.length,
    users,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ["verified", "isAvailable", "role"];
  const patch = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      patch[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.params.userId, patch, {
    returnDocument: "after",
    runValidators: true,
  }).select("-firebaseUid");

  return successResponse(res, 200, "User updated successfully", { user });
});

const listTasks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const tasks = await Task.find(filter)
    .populate("taskProviderId", "fullName phone")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 50, 100));

  return successResponse(res, 200, "Tasks fetched successfully", {
    count: tasks.length,
    tasks,
  });
});

const listReports = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const reports = await Report.find(filter)
    .populate("reporterId", "fullName phone")
    .populate("reportedUserId", "fullName phone role")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 50, 100));

  return successResponse(res, 200, "Reports fetched successfully", {
    count: reports.length,
    reports,
  });
});

const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(
    req.params.reportId,
    { $set: { status: req.body.status } },
    { returnDocument: "after", runValidators: true }
  );

  return successResponse(res, 200, "Report updated successfully", { report });
});

const listPayments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.paymentStatus = req.query.status;

  const payments = await Payment.find(filter)
    .populate("taskId", "title status")
    .populate("payerId", "fullName phone")
    .populate("receiverId", "fullName phone")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(req.query.limit) || 50, 100));

  return successResponse(res, 200, "Payments fetched successfully", {
    count: payments.length,
    payments,
  });
});

const listVerifications = asyncHandler(async (req, res) => {
  const verifications = await verificationService.listVerifications(req.query);
  return successResponse(res, 200, "Verifications fetched successfully", {
    count: verifications.length,
    verifications,
  });
});

const updateVerificationStatus = asyncHandler(async (req, res) => {
  const verification = await verificationService.updateVerificationStatus(
    req.user._id,
    req.params.verificationId,
    req.body
  );

  return successResponse(res, 200, "Verification updated successfully", { verification });
});

module.exports = {
  listUsers,
  updateUser,
  listTasks,
  listReports,
  updateReport,
  listPayments,
  listVerifications,
  updateVerificationStatus,
};
