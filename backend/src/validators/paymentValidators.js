const { body, param } = require("express-validator");

const markPaymentPaidValidation = [
  param("paymentId").isMongoId().withMessage("paymentId must be valid"),
  body("transactionRef").optional().trim().isLength({ max: 120 }),
];

const verifyRazorpayPaymentValidation = [
  param("paymentId").isMongoId().withMessage("paymentId must be valid"),
  body("razorpay_order_id").trim().notEmpty(),
  body("razorpay_payment_id").trim().notEmpty(),
  body("razorpay_signature").trim().notEmpty(),
];

module.exports = {
  markPaymentPaidValidation,
  verifyRazorpayPaymentValidation,
};
