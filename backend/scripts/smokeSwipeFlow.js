require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");
const app = require("../src/app");
const connectDB = require("../src/config/db");
const { generateToken } = require("../src/utils/jwt");
const User = require("../src/models/User");
const Task = require("../src/models/Task");
const TaskRequest = require("../src/models/TaskRequest");
const Notification = require("../src/models/Notification");

const run = async () => {
  const marker = `swipe-${Date.now()}`;
  const created = {
    users: [],
    tasks: [],
    requests: [],
  };

  await connectDB();
  const server = http.createServer(app);

  try {
    await new Promise((resolve) => server.listen(0, resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`;

    const provider = await User.create({
      firebaseUid: `${marker}-provider`,
      phone: `+1777${String(Date.now()).slice(-10)}`,
      fullName: "Swipe Provider",
      role: "taskProvider",
      verified: true,
    });
    const worker = await User.create({
      firebaseUid: `${marker}-worker`,
      phone: `+1888${String(Date.now()).slice(-10)}`,
      fullName: "Swipe Worker",
      role: "worker",
      verified: true,
      isWorking: false,
      location: { type: "Point", coordinates: [77.5946, 12.9716] },
    });
    created.users.push(provider._id, worker._id);

    const task = await Task.create({
      taskProviderId: provider._id,
      title: "Swipe Test Task",
      description: "Temporary swipe feature test task.",
      category: "testing",
      payAmount: 250,
      payType: "fixed",
      workersNeeded: 2,
      startTime: new Date(Date.now() + 60 * 60 * 1000),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      location: { type: "Point", coordinates: [77.5947, 12.9717] },
      address: "Swipe smoke address",
    });
    created.tasks.push(task._id);

    const token = generateToken(worker);
    const request = async (path, options = {}) => {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      const body = await response.json();
      if (!response.ok || body.success === false) {
        throw new Error(
          `${options.method || "GET"} ${path} failed: ${response.status} ${body.message}`
        );
      }
      return body.data;
    };

    const feed = await request(
      "/tasks/swipe-feed?longitude=77.5946&latitude=12.9716&radiusKm=5&limit=20"
    );
    if (!feed.tasks.some((item) => String(item.taskId) === String(task._id))) {
      throw new Error("Swipe feed did not include the open nearby task");
    }

    const right = await request(`/tasks/${task._id}/swipe-right`, { method: "POST" });
    created.requests.push(right.request._id);

    const afterSwipe = await Task.findById(task._id);
    if (afterSwipe.workersJoined !== 0) {
      throw new Error("Swipe-right incremented workersJoined before provider acceptance");
    }

    const feedAfterRequest = await request(
      "/tasks/swipe-feed?longitude=77.5946&latitude=12.9716&radiusKm=5&limit=20"
    );
    if (feedAfterRequest.tasks.some((item) => String(item.taskId) === String(task._id))) {
      throw new Error("Requested task still appeared in swipe feed");
    }

    await request(`/tasks/${task._id}/swipe-left`, { method: "POST" });
    console.log("swipe flow ok");
  } finally {
    await Notification.deleteMany({ entityId: { $in: created.requests } });
    await TaskRequest.deleteMany({ _id: { $in: created.requests } });
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
