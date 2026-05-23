let io;

const onlineUsers = new Map();
const socketUsers = new Map();

const userRoom = (userId) => `user:${userId}`;
const taskRoom = (taskId) => `task:${taskId}`;

const setIO = (nextIO) => {
  io = nextIO;
};

const getIO = () => io;

const addUserSocket = (userId, socketId) => {
  const key = String(userId);
  const sockets = onlineUsers.get(key) || new Set();
  sockets.add(socketId);
  onlineUsers.set(key, sockets);
  socketUsers.set(socketId, key);
};

const removeSocket = (socketId) => {
  const userId = socketUsers.get(socketId);

  if (!userId) {
    return null;
  }

  const sockets = onlineUsers.get(userId);
  sockets?.delete(socketId);
  socketUsers.delete(socketId);

  if (!sockets || sockets.size === 0) {
    onlineUsers.delete(userId);
    return { userId, online: false };
  }

  return { userId, online: true };
};

const getUserSocketIds = (userId) => {
  return [...(onlineUsers.get(String(userId)) || [])];
};

const isUserOnline = (userId) => onlineUsers.has(String(userId));

const emitToUser = (userId, event, payload) => {
  if (io) {
    io.to(userRoom(userId)).emit(event, payload);
  }
};

const emitToUsers = (userIds, event, payload) => {
  userIds.forEach((userId) => emitToUser(userId, event, payload));
};

const emitToRoom = (roomId, event, payload) => {
  if (io) {
    io.to(String(roomId)).emit(event, payload);
  }
};

const emitTaskUpdate = (taskId, event, payload) => {
  if (io) {
    io.to(taskRoom(taskId)).emit(event, payload);
  }
};

module.exports = {
  userRoom,
  taskRoom,
  setIO,
  getIO,
  addUserSocket,
  removeSocket,
  getUserSocketIds,
  isUserOnline,
  emitToUser,
  emitToUsers,
  emitToRoom,
  emitTaskUpdate,
};
