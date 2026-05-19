const express = require("express");
const {
  applyForTask,
  acceptRequest,
  rejectRequest,
  getTaskApplicants,
  getWorkerRequests,
  markWorkerRequestComplete,
  getRequestChatRoom,
} = require("../controllers/taskRequestController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const {
  applyForTaskValidation,
  requestIdValidation,
  requestListValidation,
  taskApplicantsValidation,
} = require("../validators/taskRequestValidators");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("worker"),
  applyForTaskValidation,
  validateRequest,
  applyForTask
);

router.get(
  "/my",
  protect,
  authorizeRoles("worker"),
  requestListValidation,
  validateRequest,
  getWorkerRequests
);

router.get(
  "/:requestId/chat",
  protect,
  requestIdValidation,
  validateRequest,
  getRequestChatRoom
);

router.patch(
  "/:requestId/complete",
  protect,
  authorizeRoles("worker"),
  requestIdValidation,
  validateRequest,
  markWorkerRequestComplete
);

router.get(
  "/tasks/:taskId/applicants",
  protect,
  authorizeRoles("taskProvider"),
  taskApplicantsValidation,
  validateRequest,
  getTaskApplicants
);

router.patch(
  "/:requestId/accept",
  protect,
  authorizeRoles("taskProvider"),
  requestIdValidation,
  validateRequest,
  acceptRequest
);

router.patch(
  "/:requestId/reject",
  protect,
  authorizeRoles("taskProvider"),
  requestIdValidation,
  validateRequest,
  rejectRequest
);

module.exports = router;
