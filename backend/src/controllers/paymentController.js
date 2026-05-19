const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const paymentService = require("../services/paymentService");

const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentService.getMyPayments(req.user._id, req.query);
  return successResponse(res, 200, "Payments fetched successfully", {
    count: payments.length,
    payments,
  });
});

const markPaymentPaid = asyncHandler(async (req, res) => {
  const payment = await paymentService.markPaymentPaid(
    req.params.paymentId,
    req.user._id,
    req.body.transactionRef || ""
  );

  return successResponse(res, 200, "Payment marked as paid", { payment });
});

const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyRazorpayPayment(
    req.params.paymentId,
    req.user._id,
    req.body
  );

  return successResponse(res, 200, "Razorpay payment verified", { payment });
});

module.exports = {
  getMyPayments,
  markPaymentPaid,
  verifyRazorpayPayment,
};
