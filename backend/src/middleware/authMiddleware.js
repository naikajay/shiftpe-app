const User = require("../models/User");
const { verifyToken } = require("../utils/jwt");
const AppError = require("../utils/AppError");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return next(new AppError("Authorization token is required", 401));
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User for this token no longer exists", 401));
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

module.exports = {
  protect,
};
