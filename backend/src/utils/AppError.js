class AppError extends Error {
  constructor(message, statusCode = 500, error = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
