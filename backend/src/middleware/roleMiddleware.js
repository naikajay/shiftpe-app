const { VALID_ROLES } = require("../validators/authValidators");
const AppError = require("../utils/AppError");

const authorizeRoles = (...roles) => {
  const allowedRoles = roles.flat();

  return (req, res, next) => {
    if (!allowedRoles.length || allowedRoles.some((role) => !VALID_ROLES.includes(role))) {
      return next(new AppError("Route role configuration is invalid", 500));
    }

    if (!req.user) {
      return next(new AppError("Authentication is required", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to access this resource", 403));
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
};
