const { body, param, query } = require("express-validator");

const createMessageValidation = [
  body("chatRoomId").isMongoId().withMessage("chatRoomId must be valid"),
  body("messageType").optional().isIn(["text", "image", "location"]),
  body("message").trim().isLength({ min: 1, max: 5000 }),
];

const chatRoomIdValidation = [
  param("chatRoomId").isMongoId().withMessage("chatRoomId must be valid"),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  createMessageValidation,
  chatRoomIdValidation,
};
