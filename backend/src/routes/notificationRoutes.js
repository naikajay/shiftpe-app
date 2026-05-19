const express = require("express");
const { param, query } = require("express-validator");
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notificationController");
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
  "/:notificationId/read",
  [param("notificationId").isMongoId()],
  validateRequest,
  markAsRead
);

module.exports = router;
