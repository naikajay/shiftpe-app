const { taskRoom, emitTaskUpdate } = require("./socketManager");

const registerTaskEvents = (socket) => {
  const userId = String(socket.user._id);

  socket.on("task:join", ({ taskId }, ack) => {
    if (!taskId) {
      ack?.({ success: false, message: "taskId is required" });
      return;
    }

    socket.join(taskRoom(taskId));
    ack?.({ success: true });
  });

  socket.on("task:worker-arrived", ({ taskId }, ack) => {
    if (!taskId) {
      ack?.({ success: false, message: "taskId is required" });
      return;
    }

    emitTaskUpdate(taskId, "task:worker-arrived", {
      taskId,
      workerId: userId,
      arrivedAt: new Date().toISOString(),
    });
    ack?.({ success: true });
  });
};

module.exports = {
  registerTaskEvents,
};
