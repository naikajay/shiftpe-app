const User = require("../models/User");
const { getFirebaseAdmin } = require("../config/firebase");
const { generateToken } = require("../utils/jwt");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const AppError = require("../utils/AppError");
const {
  normalizeRole,
  validateUserProfileInput,
} = require("../validators/authValidators");

const toUserResponse = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  phone: user.phone,
  role: user.role,
  profileImage: user.profileImage,
  bio: user.bio,
  hourlyRate: user.hourlyRate,
  expoPushToken: user.expoPushToken,
  skills: user.skills,
  location: user.location,
  isWorking: user.isWorking,
  isAvailable: user.isAvailable,
  isOnline: user.isOnline,
  activeTaskId: user.activeTaskId,
  currentTask: user.currentTask,
  lastActive: user.lastActive,
  verified: user.verified,
  reliabilityScore: user.reliabilityScore,
  ratingAverage: user.ratingAverage,
  totalRatings: user.totalRatings,
  completedTasksCount: user.completedTasksCount,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const ensureAdminSignupAllowed = (role, adminSecret) => {
  if (role !== "admin") {
    return null;
  }

  if (!process.env.ADMIN_SIGNUP_SECRET) {
    return "Admin signup is disabled";
  }

  if (adminSecret !== process.env.ADMIN_SIGNUP_SECRET) {
    return "Invalid admin signup secret";
  }

  return null;
};

const buildUserPatch = (body, role) => {
  const patch = {
    role,
    verified: true,
  };

  [
    "fullName",
    "profileImage",
    "bio",
    "hourlyRate",
    "skills",
    "location",
  ].forEach((field) => {
    if (body[field] !== undefined) {
      patch[field] = body[field];
    }
  });

  return patch;
};

const verifyOtp = asyncHandler(async (req, res) => {
  try {
    const { idToken, adminSecret } = req.body;

  if (!idToken) {
    throw new AppError("Firebase ID token is required", 400);
  }

  const firebaseAdmin = getFirebaseAdmin();
  const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
  const firebaseUser = await firebaseAdmin.auth().getUser(decodedToken.uid);
  const phone = decodedToken.phone_number || firebaseUser.phoneNumber;

  if (!phone) {
    throw new AppError("Firebase token must contain a verified phone number", 400);
  }

  const { errors, role } = validateUserProfileInput(
    { ...req.body, phone },
    { requireFullName: false }
  );

  const adminError = ensureAdminSignupAllowed(role, adminSecret);
  if (adminError) {
    errors.push(adminError);
  }

  if (errors.length) {
    throw new AppError("Validation failed", 400, errors);
  }

  const existingUser = await User.findOne({
    $or: [{ firebaseUid: decodedToken.uid }, { phone }],
  });

  const userPatch = buildUserPatch(req.body, role);
  userPatch.firebaseUid = decodedToken.uid;
  userPatch.phone = phone;

  if (!userPatch.fullName) {
    userPatch.fullName =
      existingUser?.fullName ||
      firebaseUser.displayName ||
      `ShiftPe User ${phone.slice(-4)}`;
  }

  const user = existingUser
    ? await User.findByIdAndUpdate(existingUser._id, userPatch, {
        returnDocument: "after",
        runValidators: true,
      })
    : await User.create(userPatch);

  const token = generateToken(user);

  return successResponse(
    res,
    existingUser ? 200 : 201,
    existingUser ? "OTP verified successfully" : "User registered successfully",
    { token, user: toUserResponse(user) }
  );
  } catch (error) {
    if (error.isOperational) {
      throw error;
    }

    throw new AppError("OTP verification failed", 401, error.message);
  }
});

const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, 200, "User fetched successfully", {
    user: toUserResponse(req.user),
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = generateToken(req.user);

  return successResponse(res, 200, "Token generated successfully", {
    token,
    user: toUserResponse(req.user),
  });
});

const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ["fullName", "profileImage", "bio", "hourlyRate", "skills", "location", "isAvailable"];
  const patch = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      patch[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, patch, {
    returnDocument: "after",
    runValidators: true,
  });

  return successResponse(res, 200, "Profile updated successfully", {
    user: toUserResponse(user),
  });
});

const updatePushToken = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { expoPushToken: req.body.expoPushToken || "" } },
    { returnDocument: "after", runValidators: true }
  );

  return successResponse(res, 200, "Push token updated successfully", {
    user: toUserResponse(user),
  });
});

module.exports = {
  verifyOtp,
  getMe,
  refreshToken,
  updateMe,
  updatePushToken,
};
