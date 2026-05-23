const registerNotificationEvents = (socket) => {
  socket.on("notifications:join", (ack) => {
    socket.join(`user:${socket.user._id}`);
    ack?.({ success: true });
  });
};

module.exports = {
  registerNotificationEvents,
};
