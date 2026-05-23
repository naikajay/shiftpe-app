const express = require("express");
const { param, query } = require("express-validator");
const {
  getNotifications,
  markAsRead,
  markManyAsRead,
} = require("../controllers/notificationController");
const { body } = require("express-validator");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");

const router = express.Router();

router.use(protect);

router.get(
  "/",
  [
    query("read").optional().isBoolean(),
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validateRequest,
  getNotifications
);

router.patch(
  "/read",
  [body("notificationIds").optional().isArray({ max: 100 })],
  validateRequest,
  markManyAsRead
);

router.patch(
  "/:notificationId/read",
  [param("notificationId").isMongoId()],
  validateRequest,
  markAsRead
);

module.exports = router;
