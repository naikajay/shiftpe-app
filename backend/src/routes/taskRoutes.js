const express = require("express");
const {
  createTask,
  getNearbyTasks,
  getTaskById,
  getProviderTasks,
  updateTaskStatus,
} = require("../controllers/taskController");
const {
  getSwipeFeed,
  swipeRight,
  swipeLeft,
} = require("../controllers/swipeController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const {
  createTaskValidation,
  nearbyTasksValidation,
  taskIdValidation,
  updateTaskStatusValidation,
  swipeFeedValidation,
} = require("../validators/taskValidators");

const router = express.Router();

router.get("/explore", nearbyTasksValidation, validateRequest, getNearbyTasks);

router.get(
  "/swipe-feed",
  protect,
  authorizeRoles("worker"),
  swipeFeedValidation,
  validateRequest,
  getSwipeFeed
);

router.post(
  "/:taskId/swipe-right",
  protect,
  authorizeRoles("worker"),
  taskIdValidation,
  validateRequest,
  swipeRight
);

router.post(
  "/:taskId/swipe-left",
  protect,
  authorizeRoles("worker"),
  taskIdValidation,
  validateRequest,
  swipeLeft
);

router.post(
  "/",
  protect,
  authorizeRoles("taskProvider"),
  createTaskValidation,
  validateRequest,
  createTask
);

router.get("/provider", protect, authorizeRoles("taskProvider"), getProviderTasks);

router.get("/:taskId", taskIdValidation, validateRequest, getTaskById);

router.patch(
  "/:taskId/status",
  protect,
  authorizeRoles("taskProvider"),
  updateTaskStatusValidation,
  validateRequest,
  updateTaskStatus
);

module.exports = router;
