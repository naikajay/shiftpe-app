const Rating = require("../models/Rating");
const TaskRequest = require("../models/TaskRequest");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { createNotification } = require("./notificationService");

const createRating = async (fromUserId, payload) => {
  try {
    const completedWork = await TaskRequest.findOne({
      taskId: payload.taskId,
      workerId: payload.toUserId,
      status: "completed",
    });

    if (!completedWork) {
      throw new AppError("Ratings are allowed only after completed work", 409);
    }

    if (String(completedWork.taskProviderId) !== String(fromUserId)) {
      throw new AppError("Only the task provider can rate this worker", 403);
    }

    const rating = await Rating.create({
      taskId: payload.taskId,
      fromUserId,
      toUserId: payload.toUserId,
      score: payload.score,
      review: payload.review || "",
    });

    const ratings = await Rating.find({ toUserId: payload.toUserId });
    const totalScore = ratings.reduce((sum, item) => sum + item.score, 0);
    const ratingAverage = Number((totalScore / ratings.length).toFixed(2));
    const reliabilityScore = Math.round(Math.min(100, ratingAverage * 20));

    const worker = await User.findByIdAndUpdate(
      payload.toUserId,
      {
        $set: {
          ratingAverage,
          reliabilityScore,
          totalRatings: ratings.length,
        },
      },
      { returnDocument: "after", runValidators: true }
    );

    await createNotification({
      userId: payload.toUserId,
      title: "New rating received",
      message: `You received a ${payload.score}-star rating.`,
      type: "rating",
      entityType: "Rating",
      entityId: rating._id,
    });

    return { rating, worker };
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("This worker has already been rated for this task", 409);
    }

    throw error;
  }
};

module.exports = {
  createRating,
};
