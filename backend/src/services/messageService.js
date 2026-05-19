const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const AppError = require("../utils/AppError");
const { emitToRoom } = require("../sockets/socket");

const assertParticipant = async (chatRoomId, userId) => {
  const chatRoom = await ChatRoom.findOne({
    _id: chatRoomId,
    participants: userId,
    isActive: true,
  });

  if (!chatRoom) {
    throw new AppError("Chat room not found", 404);
  }

  return chatRoom;
};

const sendMessage = async (userId, payload) => {
  const chatRoom = await assertParticipant(payload.chatRoomId, userId);

  const message = await Message.create({
    chatRoomId: chatRoom._id,
    senderId: userId,
    messageType: payload.messageType || "text",
    message: payload.message,
  });

  chatRoom.lastMessage = message.message;
  chatRoom.lastMessageAt = message.createdAt;
  await chatRoom.save();

  emitToRoom(String(chatRoom._id), "message:new", message);
  return message;
};

const getMessages = async (userId, chatRoomId, query = {}) => {
  await assertParticipant(chatRoomId, userId);

  return Message.find({ chatRoomId })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(query.limit) || 50, 100));
};

module.exports = {
  sendMessage,
  getMessages,
};
