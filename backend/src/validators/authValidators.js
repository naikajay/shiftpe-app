const { body } = require("express-validator");

const VALID_ROLES = ["worker", "taskProvider", "admin"];
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const normalizeRole = (role) => {
  return VALID_ROLES.includes(role) ? role : "worker";
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isSupportedProfileImage = (value) => {
  if (!value) return true;
  return /^(https?:\/\/|file:\/\/|data:image\/)/.test(value);
};

const validateLocation = (location) => {
  if (location == null) {
    return null;
  }

  if (
    location.type !== "Point" ||
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2
  ) {
    return "Location must be a GeoJSON Point with [longitude, latitude]";
  }

  const [longitude, latitude] = location.coordinates;

  if (
    typeof longitude !== "number" ||
    typeof latitude !== "number" ||
    longitude < -180 ||
    longitude > 180 ||
    latitude < -90 ||
    latitude > 90
  ) {
    return "Location coordinates must be valid longitude and latitude numbers";
  }

  return null;
};

const validateUserProfileInput = (body, options = {}) => {
  const errors = [];
  const role = normalizeRole(body.role);

  if (options.requireFullName && !isNonEmptyString(body.fullName)) {
    errors.push("fullName is required");
  }

  if (body.fullName && body.fullName.trim().length < 2) {
    errors.push("fullName must be at least 2 characters");
  }

  if (body.fullName && body.fullName.trim().length > 80) {
    errors.push("fullName must be at most 80 characters");
  }

  if (body.phone && !PHONE_REGEX.test(body.phone)) {
    errors.push("phone must be in E.164 format, for example +919876543210");
  }

  if (body.role && !VALID_ROLES.includes(body.role)) {
    errors.push(`role must be one of: ${VALID_ROLES.join(", ")}`);
  }

  if (body.bio && body.bio.trim().length > 300) {
    errors.push("bio must be at most 300 characters");
  }

  if (body.hourlyRate != null && (Number.isNaN(Number(body.hourlyRate)) || Number(body.hourlyRate) < 0)) {
    errors.push("hourlyRate must be a non-negative number");
  }

  if (body.skills != null) {
    if (!Array.isArray(body.skills)) {
      errors.push("skills must be an array");
    } else if (body.skills.some((skill) => !isNonEmptyString(skill))) {
      errors.push("skills must contain only non-empty strings");
    } else if (body.skills.length > 30) {
      errors.push("skills can contain at most 30 items");
    }
  }

  const locationError = validateLocation(body.location);
  if (locationError) {
    errors.push(locationError);
  }

  return {
    errors,
    role,
  };
};

module.exports = {
  VALID_ROLES,
  PHONE_REGEX,
  normalizeRole,
  validateUserProfileInput,
  verifyOtpValidation: [
    body("idToken").trim().notEmpty().withMessage("Firebase ID token is required"),
    body("role").optional({ checkFalsy: true }).isIn(VALID_ROLES),
    body("fullName").optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 80 }),
    body("profileImage").optional({ checkFalsy: true }).trim().custom(isSupportedProfileImage),
    body("bio").optional({ checkFalsy: true }).trim().isLength({ max: 300 }),
    body("hourlyRate").optional({ checkFalsy: true }).isFloat({ min: 0 }).toFloat(),
    body("skills").optional({ checkFalsy: true }).isArray({ max: 30 }),
  ],
};
