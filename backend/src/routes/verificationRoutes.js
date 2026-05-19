const express = require("express");
const {
  submitVerification,
  getMyVerifications,
} = require("../controllers/verificationController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { uploadVerificationValidation } = require("../validators/verificationValidators");

const router = express.Router();

router.use(protect, authorizeRoles("worker"));
router.get("/my", getMyVerifications);
router.post("/", uploadVerificationValidation, validateRequest, submitVerification);

module.exports = router;
