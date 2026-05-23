const { body } = require("express-validator");

const isSupportedProfileImage = (value) => {
  if (!value) return true;
  return /^(https?:\/\/|file:\/\/|data:image\/)/.test(value);
};

const profileUpdateValidation = [
  body("fullName").optional().trim().isLength({ min: 2, max: 80 }),
  body("profileImage")
    .optional({ checkFalsy: true })
    .trim()
    .custom(isSupportedProfileImage)
    .withMessage("profileImage must be http(s), file, or image data URI"),
  body("bio").optional().trim().isLength({ max: 300 }),
  body("hourlyRate").optional().isFloat({ min: 0 }).toFloat(),
  body("skills").optional().isArray({ max: 30 }),
  body("skills.*").optional().trim().isLength({ min: 1, max: 60 }),
  body("isAvailable").optional().isBoolean().toBoolean(),
  body("location.type").optional().equals("Point"),
  body("location.coordinates").optional().isArray({ min: 2, max: 2 }),
  body("location.coordinates.0").optional().isFloat({ min: -180, max: 180 }).toFloat(),
  body("location.coordinates.1").optional().isFloat({ min: -90, max: 90 }).toFloat(),
];

module.exports = {
  profileUpdateValidation,
};
