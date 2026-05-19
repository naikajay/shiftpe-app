const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");

let io;
const onlineUsers = new Map();

const userRoom = (userId) => `user:${userId}`;
const taskRoom = (taskId) => `task:${taskId}`;

const initializeSocket = (httpServer, app) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("_id role fullName");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Invalid socket token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = String(socket.user._id);
    socket.join(userRoom(userId));

    onlineUsers.set(userId, (onlineUsers.get(userId) || 0) + 1);
    io.emit("user:online", { userId, online: true });

    socket.on("presence:get", ({ userIds = [] } = {}, ack) => {
      const statuses = userIds.reduce((result, id) => {
        result[id] = onlineUsers.has(String(id));
        return result;
      }, {});

      ack?.({ success: true, data: statuses });
    });

    socket.on("chat:join", async ({ chatRoomId }, ack) => {
      try {
        const chatRoom = await ChatRoom.findOne({
          _id: chatRoomId,
          participants: socket.user._id,
          isActive: true,
        });

        if (!chatRoom) {
          throw new Error("Chat room not found");
        }

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
        const chatRoom = await ChatRoom.findOne({
          _id: chatRoomId,
          participants: socket.user._id,
          isActive: true,
        });

        if (!chatRoom) {
          throw new Error("Chat room not found");
        }

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
        const chatRoom = await ChatRoom.findOne({
          _id: chatRoomId,
          participants: socket.user._id,
          isActive: true,
        });

        if (!chatRoom) {
          throw new Error("Chat room not found");
        }

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

        io.to(String(chatRoom._id)).emit("message:seen", {
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

    socket.on("task:join", ({ taskId }, ack) => {
      if (taskId) {
        socket.join(taskRoom(taskId));
        ack?.({ success: true });
      } else {
        ack?.({ success: false, message: "taskId is required" });
      }
    });

    socket.on("task:worker-arrived", ({ taskId }, ack) => {
      if (!taskId) {
        ack?.({ success: false, message: "taskId is required" });
        return;
      }

      io.to(taskRoom(taskId)).emit("task:worker-arrived", {
        taskId,
        workerId: userId,
        arrivedAt: new Date().toISOString(),
      });
      ack?.({ success: true });
    });

    socket.on("message:send", async ({ chatRoomId, message, messageType = "text" }, ack) => {
      try {
        const chatRoom = await ChatRoom.findOne({
          _id: chatRoomId,
          participants: socket.user._id,
          isActive: true,
        });

        if (!chatRoom) {
          throw new Error("Chat room not found");
        }

        const createdMessage = await Message.create({
          chatRoomId,
          senderId: socket.user._id,
          messageType,
          message,
        });

        chatRoom.lastMessage = createdMessage.message;
        chatRoom.lastMessageAt = createdMessage.createdAt;
        await chatRoom.save();

        io.to(String(chatRoom._id)).emit("message:new", createdMessage);
        ack?.({ success: true, data: createdMessage });
      } catch (error) {
        ack?.({ success: false, message: error.message });
      }
    });

    socket.on("disconnect", () => {
      const nextCount = (onlineUsers.get(userId) || 1) - 1;

      if (nextCount <= 0) {
        onlineUsers.delete(userId);
        io.emit("user:online", { userId, online: false });
      } else {
        onlineUsers.set(userId, nextCount);
      }
    });
  });

  app?.set("io", io);
  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, payload) => {
  if (io) {
    io.to(userRoom(userId)).emit(event, payload);
  }
};

const emitToRoom = (roomId, event, payload) => {
  if (io) {
    io.to(roomId).emit(event, payload);
  }
};

const emitTaskUpdate = (taskId, event, payload) => {
  if (io) {
    io.to(taskRoom(taskId)).emit(event, payload);
  }
};

const isUserOnline = (userId) => onlineUsers.has(String(userId));

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRoom,
  emitTaskUpdate,
  isUserOnline,
};
