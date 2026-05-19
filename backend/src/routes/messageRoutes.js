const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const { sendMessage, getMessages } = require("../controllers/messageController");
const {
  createMessageValidation,
  chatRoomIdValidation,
} = require("../validators/messageValidators");

const router = express.Router();

router.use(protect);

router.post("/", createMessageValidation, validateRequest, sendMessage);
router.get("/:chatRoomId", chatRoomIdValidation, validateRequest, getMessages);

module.exports = router;
