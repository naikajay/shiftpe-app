require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const { generateToken } = require("../src/utils/jwt");
const User = require("../src/models/User");
const Task = require("../src/models/Task");
const TaskRequest = require("../src/models/TaskRequest");
const ChatRoom = require("../src/models/ChatRoom");
const Message = require("../src/models/Message");
const Notification = require("../src/models/Notification");
const Payment = require("../src/models/Payment");
const Rating = require("../src/models/Rating");

const run = async () => {
  const marker = `smoke-${Date.now()}`;
  const created = {
    users: [],
    tasks: [],
    requests: [],
    rooms: [],
    messages: [],
    payments: [],
    ratings: [],
  };

  await connectDB();

  const server = http.createServer(app);

  try {
    await new Promise((resolve) => server.listen(0, resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

    const provider = await User.create({
      firebaseUid: `${marker}-provider`,
      phone: `+1555${String(Date.now()).slice(-10)}`,
      fullName: "Smoke Provider",
      role: "taskProvider",
      verified: true,
    });
    const worker = await User.create({
      firebaseUid: `${marker}-worker`,
      phone: `+1666${String(Date.now()).slice(-10)}`,
      fullName: "Smoke Worker",
      role: "worker",
      verified: true,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
    });

    created.users.push(provider._id, worker._id);

    const providerToken = generateToken(provider);
    const workerToken = generateToken(worker);

    const request = async (path, options = {}) => {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          "content-type": "application/json",
          ...(options.headers || {}),
        },
      });
      const body = await response.json();
      if (!response.ok || body.success === false) {
        throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${body.message}`);
      }
      return body.data;
    };

    const taskData = await request("/tasks", {
      method: "POST",
      headers: { authorization: `Bearer ${providerToken}` },
      body: JSON.stringify({
        title: "Smoke shift",
        description: "Temporary backend smoke test task.",
        category: "testing",
        payAmount: 100,
        payType: "fixed",
        workersNeeded: 1,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        location: { type: "Point", coordinates: [77.5946, 12.9716] },
        address: "Smoke test address",
      }),
    });
    created.tasks.push(taskData.task._id);

    const nearbyData = await request("/tasks/explore?longitude=77.5946&latitude=12.9716&radiusKm=5&limit=5");
    if (!nearbyData.tasks.some((task) => task._id === taskData.task._id)) {
      throw new Error("Created task was not returned by nearby task search");
    }

    const applicationData = await request("/task-requests", {
      method: "POST",
      headers: { authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({ taskId: taskData.task._id }),
    });
    created.requests.push(applicationData.request._id);

    await request(`/task-requests/${applicationData.request._id}/accept`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${providerToken}` },
    });

    await request("/workers/active-task", {
      headers: { authorization: `Bearer ${workerToken}` },
    });

    await request("/auth/me", {
      method: "PATCH",
      headers: { authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({ skills: ["testing"] }),
    });

    const room = await ChatRoom.findOne({ taskId: taskData.task._id });
    if (!room) {
      throw new Error("Accepting a task request did not create a chat room");
    }
    created.rooms.push(room._id);

    const messageData = await request("/messages", {
      method: "POST",
      headers: { authorization: `Bearer ${workerToken}` },
      body: JSON.stringify({
        chatRoomId: room._id,
        message: "Smoke message",
      }),
    });
    created.messages.push(messageData.message._id);

    await request(`/messages/${room._id}`, {
      headers: { authorization: `Bearer ${providerToken}` },
    });

    await request(`/tasks/${taskData.task._id}/status`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${providerToken}` },
      body: JSON.stringify({ status: "completed" }),
    });

    const paymentsData = await request("/payments", {
      headers: { authorization: `Bearer ${providerToken}` },
    });
    const payment = paymentsData.payments.find((item) => item.taskId?._id === taskData.task._id);
    if (!payment) {
      throw new Error("Completing work did not create a payment");
    }
    created.payments.push(payment._id);

    await request(`/payments/${payment._id}/paid`, {
      method: "PATCH",
      headers: { authorization: `Bearer ${providerToken}` },
      body: JSON.stringify({ transactionRef: marker }),
    });

    const ratingData = await request("/ratings", {
      method: "POST",
      headers: { authorization: `Bearer ${providerToken}` },
      body: JSON.stringify({
        taskId: taskData.task._id,
        toUserId: worker._id,
        score: 5,
        review: "Smoke rating",
      }),
    });
    created.ratings.push(ratingData.rating._id);

    console.log("core flow ok");
  } finally {
    await Rating.deleteMany({ _id: { $in: created.ratings } });
    await Payment.deleteMany({ _id: { $in: created.payments } });
    await Message.deleteMany({ _id: { $in: created.messages } });
    await ChatRoom.deleteMany({ _id: { $in: created.rooms } });
    await TaskRequest.deleteMany({ _id: { $in: created.requests } });
    await Notification.deleteMany({ entityId: { $in: [...created.requests, ...created.tasks] } });
    await Task.deleteMany({ _id: { $in: created.tasks } });
    await User.deleteMany({ _id: { $in: created.users } });
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
