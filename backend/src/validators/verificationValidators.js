const { body, param, query } = require("express-validator");

const DOCUMENT_TYPES = ["aadhaar", "pan", "selfie", "driving_license", "voter_id", "other"];
const VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

const uploadVerificationValidation = [
  body("documentType").isIn(DOCUMENT_TYPES),
  body("documentUrl").trim().isURL().withMessage("documentUrl must be a valid URL"),
  body("notes").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

const updateVerificationStatusValidation = [
  param("verificationId").isMongoId().withMessage("verificationId must be valid"),
  body("status").isIn(VERIFICATION_STATUSES),
  body("reviewNote").optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

const verificationListValidation = [
  query("status").optional().isIn(VERIFICATION_STATUSES),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  DOCUMENT_TYPES,
  VERIFICATION_STATUSES,
  uploadVerificationValidation,
  updateVerificationStatusValidation,
  verificationListValidation,
};
