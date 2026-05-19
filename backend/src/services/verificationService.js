const Verification = require("../models/Verification");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { createNotification } = require("./notificationService");

const submitVerification = async (userId, payload) => {
  return Verification.findOneAndUpdate(
    { userId, documentType: payload.documentType },
    {
      $set: {
        documentUrl: payload.documentUrl,
        notes: payload.notes || "",
        status: "pending",
        reviewNote: "",
        reviewedAt: null,
        reviewedBy: null,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    }
  );
};

const getMyVerifications = async (userId) => {
  return Verification.find({ userId }).sort({ createdAt: -1 });
};

const listVerifications = async (query = {}) => {
  const filter = {};
  if (query.status) {
    filter.status = query.status;
  }

  return Verification.find(filter)
    .populate("userId", "fullName phone role verified")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(query.limit) || 50, 100));
};

const updateVerificationStatus = async (adminId, verificationId, payload) => {
  const verification = await Verification.findByIdAndUpdate(
    verificationId,
    {
      $set: {
        status: payload.status,
        reviewNote: payload.reviewNote || "",
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    },
    { returnDocument: "after", runValidators: true }
  );

  if (!verification) {
    throw new AppError("Verification not found", 404);
  }

  if (payload.status === "approved") {
    const pendingCount = await Verification.countDocuments({
      userId: verification.userId,
      status: { $ne: "approved" },
    });

    if (pendingCount === 0) {
      await User.findByIdAndUpdate(verification.userId, { $set: { verified: true } });
    }
  } else if (payload.status === "rejected") {
    await User.findByIdAndUpdate(verification.userId, { $set: { verified: false } });
  }

  await createNotification({
    userId: verification.userId,
    title: "Verification updated",
    message: `Your ${verification.documentType} verification was ${verification.status}.`,
    type: "system",
    entityType: "Verification",
    entityId: verification._id,
  });

  return verification;
};

module.exports = {
  submitVerification,
  getMyVerifications,
  listVerifications,
  updateVerificationStatus,
};
