const Payment = require("../models/Payment");
const Task = require("../models/Task");
const AppError = require("../utils/AppError");
const { createNotification } = require("./notificationService");
const crypto = require("crypto");

const getMyPayments = async (userId, query = {}) => {
  const filter = {
    $or: [{ payerId: userId }, { receiverId: userId }],
  };

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  return Payment.find(filter)
    .populate("taskId", "title status payAmount")
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(query.limit) || 50, 100));
};

const markPaymentPaid = async (paymentId, providerId, transactionRef = "") => {
  const payment = await Payment.findOne({
    _id: paymentId,
    payerId: providerId,
    paymentStatus: "pending",
  });

  if (!payment) {
    throw new AppError("Pending payment not found", 404);
  }

  const task = await Task.findOne({
    _id: payment.taskId,
    taskProviderId: providerId,
    status: "completed",
  });

  if (!task) {
    throw new AppError("Task must be completed before payment", 409);
  }

  payment.paymentStatus = "paid";
  payment.transactionRef = transactionRef;
  payment.paidAt = new Date();
  await payment.save();

  await createNotification({
    userId: payment.receiverId,
    title: "Payment received",
    message: `Payment of ${payment.amount} has been marked paid.`,
    type: "payment",
    entityType: "Payment",
    entityId: payment._id,
  });

  return payment;
};

const verifyRazorpayPayment = async (paymentId, providerId, payload) => {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    throw new AppError("Razorpay is not configured", 503);
  }

  const signedPayload = `${payload.razorpay_order_id}|${payload.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(signedPayload)
    .digest("hex");

  if (expectedSignature !== payload.razorpay_signature) {
    throw new AppError("Invalid Razorpay signature", 400);
  }

  return markPaymentPaid(paymentId, providerId, payload.razorpay_payment_id);
};

module.exports = {
  getMyPayments,
  markPaymentPaid,
  verifyRazorpayPayment,
};
