const express = require("express");
const {
  listUsers,
  updateUser,
  listTasks,
  listReports,
  updateReport,
  listPayments,
  listVerifications,
  updateVerificationStatus,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const {
  listValidation,
  updateUserValidation,
  updateReportValidation,
} = require("../validators/adminValidators");
const {
  updateVerificationStatusValidation,
  verificationListValidation,
} = require("../validators/verificationValidators");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/users", listValidation, validateRequest, listUsers);
router.patch("/users/:userId", updateUserValidation, validateRequest, updateUser);
router.get("/tasks", listValidation, validateRequest, listTasks);
router.get("/reports", listValidation, validateRequest, listReports);
router.patch("/reports/:reportId", updateReportValidation, validateRequest, updateReport);
router.get("/payments", listValidation, validateRequest, listPayments);
router.get("/verifications", verificationListValidation, validateRequest, listVerifications);
router.patch(
  "/verifications/:verificationId",
  updateVerificationStatusValidation,
  validateRequest,
  updateVerificationStatus
);

module.exports = router;
