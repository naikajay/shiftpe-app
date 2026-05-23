const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const {
  addUserSocket,
  removeSocket,
  setIO,
  userRoom,
  isUserOnline,
  getIO,
  emitToUser,
  emitToUsers,
  emitToRoom,
  emitTaskUpdate,
} = require("./socketManager");
const { registerChatEvents } = require("./chatEvents");
const { registerTaskEvents } = require("./taskEvents");
const { registerNotificationEvents } = require("./notificationEvents");

const initializeSocket = (httpServer, app) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
      credentials: true,
    },
  });

  setIO(io);

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

  io.on("connection", async (socket) => {
    const userId = String(socket.user._id);
    socket.join(userRoom(userId));
    addUserSocket(userId, socket.id);

    await User.findByIdAndUpdate(userId, {
      $set: { isOnline: true, lastActive: new Date() },
    });

    io.emit("user:online", { userId, online: true });

    socket.on("presence:get", ({ userIds = [] } = {}, ack) => {
      const statuses = userIds.reduce((result, id) => {
        result[id] = isUserOnline(id);
        return result;
      }, {});

      ack?.({ success: true, data: statuses });
    });

    registerChatEvents(socket);
    registerTaskEvents(socket);
    registerNotificationEvents(socket);

    socket.on("disconnect", async () => {
      const status = removeSocket(socket.id);

      if (status?.online === false) {
        await User.findByIdAndUpdate(status.userId, {
          $set: { isOnline: false, lastActive: new Date() },
        });
        io.emit("user:online", { userId: status.userId, online: false });
      }
    });
  });

  app?.set("io", io);
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToUsers,
  emitToRoom,
  emitTaskUpdate,
  isUserOnline,
};
