const express = require("express");
const {
  getMyProfile,
  updateProfile,
  getActiveTask,
  getTaskHistory,
  getNearbyWorkers,
} = require("../controllers/workerController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { profileUpdateValidation } = require("../validators/profileValidators");
const { nearbyTasksValidation } = require("../validators/taskValidators");

const router = express.Router();

router.get(
  "/nearby",
  protect,
  authorizeRoles("taskProvider", "admin"),
  nearbyTasksValidation,
  validateRequest,
  getNearbyWorkers
);

router.use(protect, authorizeRoles("worker"));

router.get("/me", getMyProfile);
router.patch("/me", profileUpdateValidation, validateRequest, updateProfile);
router.get("/active-task", getActiveTask);
router.get("/task-history", getTaskHistory);

module.exports = router;
