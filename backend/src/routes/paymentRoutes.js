const express = require("express");
const {
  getMyPayments,
  markPaymentPaid,
  verifyRazorpayPayment,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/errorHandler");
const {
  markPaymentPaidValidation,
  verifyRazorpayPaymentValidation,
} = require("../validators/paymentValidators");

const router = express.Router();

router.get("/", protect, getMyPayments);

router.patch(
  "/:paymentId/paid",
  protect,
  authorizeRoles("taskProvider"),
  markPaymentPaidValidation,
  validateRequest,
  markPaymentPaid
);

router.post(
  "/:paymentId/razorpay/verify",
  protect,
  authorizeRoles("taskProvider"),
  verifyRazorpayPaymentValidation,
  validateRequest,
  verifyRazorpayPayment
);

module.exports = router;
