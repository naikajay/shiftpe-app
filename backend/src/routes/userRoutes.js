const express = require("express");

const { updateMe, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { profileUpdateValidation } = require("../validators/profileValidators");

const router = express.Router();

router.use(protect);

router.get("/profile", getMe);
router.patch("/profile", profileUpdateValidation, validateRequest, updateMe);

module.exports = router;
