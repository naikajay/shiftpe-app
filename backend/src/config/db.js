const mongoose = require("mongoose");

const syncModelIndexes = async () => {
  if (process.env.DB_SYNC_INDEXES !== "true") {
    return;
  }

  const models = require("../models");
  await Promise.all(Object.values(models).map((model) => model.syncIndexes()));
  console.log("MongoDB indexes synced");
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    await syncModelIndexes();
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed", error);
    throw error;
  }
};

module.exports = connectDB;
