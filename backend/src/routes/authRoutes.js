const express = require("express");

const {
  verifyOtp,
  getMe,
  refreshToken,
  updateMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { verifyOtpValidation } = require("../validators/authValidators");
const { profileUpdateValidation } = require("../validators/profileValidators");

const router = express.Router();

// POST /api/auth/verify-otp
// Verifies Firebase phone OTP ID token, creates/updates Mongo user, returns JWT.
router.post("/verify-otp", verifyOtpValidation, validateRequest, verifyOtp);

// Backward-compatible alias for Firebase phone auth clients.
router.post("/firebase", verifyOtpValidation, validateRequest, verifyOtp);

// GET /api/auth/me
// Returns current authenticated user from backend JWT.
router.get("/me", protect, getMe);

// PATCH /api/auth/me
// Updates the current authenticated user profile for any app role.
router.patch("/me", protect, profileUpdateValidation, validateRequest, updateMe);

// POST /api/auth/refresh-token
// Issues a fresh backend JWT for a valid backend JWT.
router.post("/refresh-token", protect, refreshToken);

// GET /api/auth/admin-check
// Example protected route using role middleware.
router.get("/admin-check", protect, authorizeRoles("admin"), getMe);

module.exports = router;
