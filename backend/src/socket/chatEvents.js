const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const { emitToRoom } = require("./socketManager");

const assertChatParticipant = async (chatRoomId, userId) => {
  const chatRoom = await ChatRoom.findOne({
    _id: chatRoomId,
    participants: userId,
    isActive: true,
  });

  if (!chatRoom) {
    throw new Error("Chat room not found");
  }

  return chatRoom;
};

const registerChatEvents = (socket) => {
  const userId = String(socket.user._id);

  socket.on("chat:join", async ({ chatRoomId }, ack) => {
    try {
      const chatRoom = await assertChatParticipant(chatRoomId, socket.user._id);
      socket.join(String(chatRoom._id));
      socket.to(String(chatRoom._id)).emit("user:online", {
        userId,
        chatRoomId: String(chatRoom._id),
        online: true,
      });
      ack?.({ success: true });
    } catch (error) {
      ack?.({ success: false, message: error.message });
    }
  });

  socket.on("chat:typing", async ({ chatRoomId, isTyping = true }, ack) => {
    try {
      const chatRoom = await assertChatParticipant(chatRoomId, socket.user._id);
      socket.to(String(chatRoom._id)).emit("chat:typing", {
        chatRoomId: String(chatRoom._id),
        userId,
        isTyping: Boolean(isTyping),
      });
      ack?.({ success: true });
    } catch (error) {
      ack?.({ success: false, message: error.message });
    }
  });

  socket.on("message:seen", async ({ chatRoomId, messageIds = [] }, ack) => {
    try {
      const chatRoom = await assertChatParticipant(chatRoomId, socket.user._id);
      const filter = {
        chatRoomId,
        senderId: { $ne: socket.user._id },
        seen: false,
      };

      if (Array.isArray(messageIds) && messageIds.length) {
        filter._id = { $in: messageIds };
      }

      await Message.updateMany(filter, {
        $set: { seen: true, seenAt: new Date() },
      });

      emitToRoom(chatRoom._id, "message:seen", {
        chatRoomId: String(chatRoom._id),
        messageIds,
        seenBy: userId,
        seenAt: new Date().toISOString(),
      });
      ack?.({ success: true });
    } catch (error) {
      ack?.({ success: false, message: error.message });
    }
  });

  socket.on("message:send", async ({ chatRoomId, message, messageType = "text" }, ack) => {
    try {
      const chatRoom = await assertChatParticipant(chatRoomId, socket.user._id);
      const createdMessage = await Message.create({
        chatRoomId,
        senderId: socket.user._id,
        messageType,
        message,
      });

      chatRoom.lastMessage = createdMessage.message;
      chatRoom.lastMessageAt = createdMessage.createdAt;
      await chatRoom.save();

      emitToRoom(chatRoom._id, "message:new", createdMessage);
      ack?.({ success: true, data: createdMessage });
    } catch (error) {
      ack?.({ success: false, message: error.message });
    }
  });
};

module.exports = {
  registerChatEvents,
};
