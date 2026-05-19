const { body, param, query } = require("express-validator");

const REQUEST_STATUSES = ["pending", "accepted", "rejected", "cancelled", "completed"];

const applyForTaskValidation = [
  body("taskId").isMongoId().withMessage("taskId must be valid"),
];

const requestIdValidation = [
  param("requestId").isMongoId().withMessage("requestId must be valid"),
];

const requestListValidation = [
  query("status").optional().isIn(REQUEST_STATUSES),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

const taskApplicantsValidation = [
  param("taskId").isMongoId().withMessage("taskId must be valid"),
  query("status").optional().isIn(REQUEST_STATUSES),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  REQUEST_STATUSES,
  applyForTaskValidation,
  requestIdValidation,
  requestListValidation,
  taskApplicantsValidation,
};
