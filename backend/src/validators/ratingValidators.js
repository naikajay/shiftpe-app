const { body } = require("express-validator");

const createRatingValidation = [
  body("taskId").isMongoId().withMessage("taskId must be valid"),
  body("toUserId").isMongoId().withMessage("toUserId must be valid"),
  body("score").isInt({ min: 1, max: 5 }).toInt(),
  body("review").optional().trim().isLength({ max: 1000 }),
];

module.exports = {
  createRatingValidation,
};
