const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const notificationService = require("../services/notificationService");

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(
    req.user._id,
    req.query
  );

  return successResponse(res, 200, "Notifications fetched successfully", {
    count: notifications.length,
    notifications,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(
    req.user._id,
    req.params.notificationId
  );

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return successResponse(res, 200, "Notification marked as read", {
    notification,
  });
});

module.exports = {
  getNotifications,
  markAsRead,
};
