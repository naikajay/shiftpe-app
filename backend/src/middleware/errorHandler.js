const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return errorResponse(
    res,
    400,
    "Validation failed",
    errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }))
  );
};

const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, "Route not found", `${req.method} ${req.originalUrl}`);
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Internal server error";
  const details =
    process.env.NODE_ENV === "production"
      ? error.error || ""
      : error.error || error.message;

  if (statusCode >= 500) {
    console.error("Unhandled request error", {
      method: req.method,
      path: req.originalUrl,
      message: error.message,
      stack: error.stack,
    });
  }

  return errorResponse(res, statusCode, message, details);
};

module.exports = {
  validateRequest,
  notFoundHandler,
  errorHandler,
};
