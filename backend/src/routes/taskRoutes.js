const express = require("express");
const {
  createTask,
  getNearbyTasks,
  getRecommendedTasks,
  getTaskById,
  getProviderTasks,
  updateTaskStatus,
} = require("../controllers/taskController");
const {
  getSwipeFeed,
  swipeRight,
  swipeLeft,
  swipe,
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
  swipeActionValidation,
} = require("../validators/taskValidators");

const router = express.Router();

router.get("/explore", nearbyTasksValidation, validateRequest, getNearbyTasks);
router.get("/nearby", nearbyTasksValidation, validateRequest, getNearbyTasks);

router.get(
  "/recommended",
  protect,
  authorizeRoles("worker"),
  nearbyTasksValidation,
  validateRequest,
  getRecommendedTasks
);

router.get(
  "/swipe-feed",
  protect,
  authorizeRoles("worker"),
  swipeFeedValidation,
  validateRequest,
  getSwipeFeed
);

router.post(
  "/swipe",
  protect,
  authorizeRoles("worker"),
  swipeActionValidation,
  validateRequest,
  swipe
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
