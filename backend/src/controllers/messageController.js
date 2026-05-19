const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const messageService = require("../services/messageService");

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(req.user._id, req.body);
  return successResponse(res, 201, "Message sent successfully", { message });
});

const getMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getMessages(
    req.user._id,
    req.params.chatRoomId,
    req.query
  );

  return successResponse(res, 200, "Messages fetched successfully", {
    count: messages.length,
    messages,
  });
});

module.exports = {
  sendMessage,
  getMessages,
};
