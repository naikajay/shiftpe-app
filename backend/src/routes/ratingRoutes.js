const express = require("express");
const { createRating } = require("../controllers/ratingController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { createRatingValidation } = require("../validators/ratingValidators");

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("taskProvider"),
  createRatingValidation,
  validateRequest,
  createRating
);

module.exports = router;
