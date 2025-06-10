const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const { sendQRCodeEmail } = require("../utils/qrCodeUtils");

// Process QR code payment
const processQRPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, transactionId } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Create payment record
    const payment = new Payment({
      bookingId: booking._id,
      userId: booking.userId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      amount: booking.amount,
      status: "success",
      paymentMethod,
      transactionId
    });

    await payment.save();

    // Update booking status
    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    res.status(200).json({
      message: "Payment processed successfully",
      payment,
      booking
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      message: "Error processing payment",
      error: error.message
    });
  }
};

// Get payment details by booking
const getPaymentByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const payment = await Payment.findOne({ bookingId });
    
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({
      message: "Error fetching payment",
      error: error.message
    });
  }
};

// Create a new payment
const createPayment = async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res
      .status(201)
      .json({ message: "Payment created successfully", payment: newPayment });
  } catch (error) {
    console.error("Error creating payment:", error);
    res
      .status(500)
      .json({ message: "Error creating payment", error: error.message });
  }
};

// Fetch all payments
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res
      .status(500)
      .json({ message: "Error fetching payments", error: error.message });
  }
};

// Fetch payments for a specific user
const getPaymentsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const payments = await Payment.find({ userId });
    res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments for user:", error);
    res
      .status(500)
      .json({
        message: "Error fetching payments for user",
        error: error.message,
      });
  }
};

// Fetch payment issues (failed or pending payments)
const getPaymentIssues = async (req, res) => {
  try {
    const issues = await Payment.find({ status: "failed" });
    res.status(200).json(issues);
  } catch (error) {
    console.error("Error fetching payment issues:", error);
    res
      .status(500)
      .json({ message: "Error fetching payment issues", error: error.message });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentsByUserId,
  getPaymentIssues,
  processQRPayment,
  getPaymentByBooking
};
