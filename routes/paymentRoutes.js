const express = require("express");
const {
  createPayment,
  getPayments,
  getPaymentIssues,
  getPaymentsByUserId, // Make sure to import this if you plan to use it
} = require("../controllers/paymentController"); // Remove the .default.default part

const router = express.Router();

// Create a new payment
router.post("/payments", createPayment);

// Get all payments
router.get("/payments", getPayments);

// Get payment issues
router.get("/payments/issues", getPaymentIssues);

// Get payments for a specific user (add this route)
router.get("/payments/user/:userId", getPaymentsByUserId);

module.exports = router;
