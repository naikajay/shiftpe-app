const { body, param, query } = require("express-validator");

const listValidation = [
  query("status").optional().trim().isLength({ min: 1, max: 40 }),
  query("role").optional().isIn(["worker", "taskProvider", "admin"]),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const userIdValidation = [param("userId").isMongoId().withMessage("userId must be valid")];

const updateUserValidation = [
  ...userIdValidation,
  body("verified").optional().isBoolean().toBoolean(),
  body("isAvailable").optional().isBoolean().toBoolean(),
  body("role").optional().isIn(["worker", "taskProvider", "admin"]),
];

const reportIdValidation = [param("reportId").isMongoId().withMessage("reportId must be valid")];

const updateReportValidation = [
  ...reportIdValidation,
  body("status").isIn(["open", "reviewing", "resolved", "dismissed"]),
];

module.exports = {
  listValidation,
  userIdValidation,
  updateUserValidation,
  reportIdValidation,
  updateReportValidation,
};
