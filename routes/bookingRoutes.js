// bookingRoutes.js
const express = require("express");
const {
  createBooking,
  getActiveReservations,
  getUpcomingReservations,
  getBookingCancellations,
  getActiveBookingsByUser,
  getUpcomingBookingsByUser,
  getAllBookings,
  checkUserByVehicle,
  getBookingPaymentDetails,
  processBookingPayment
} = require("../controllers/bookingControllers");
const auth = require("../middleware/auth"); // Middleware for JWT-based authentication
const Booking = require("../models/Booking"); // Assuming Booking model is defined in this file
const BookingLog = require("../models/BookingLog"); // Assuming BookingLog model is defined in this file

const router = express.Router();

// Public routes for payment
router.get("/bookings/payment/:bookingId", getBookingPaymentDetails);
router.post("/bookings/:bookingId/pay", processBookingPayment);

// Updated booking routes
router.post("/bookings", auth, createBooking);
router.get("/bookings/active", getActiveReservations);
router.get("/bookings/upcoming", getUpcomingReservations);
router.get("/bookings/cancellations", getBookingCancellations);
router.get("/bookings/all", getAllBookings);

// Routes for a specific user's bookings
router.get("/bookings/active/:userId", getActiveBookingsByUser);
router.get("/bookings/upcoming/:userId", getUpcomingBookingsByUser);

// Add the new route for checking users by vehicle number
router.get("/bookings/check-user/:vehicleNumber", checkUserByVehicle);

// Get latest booking for a vehicle
router.get('/bookings/latest/:vehicleNumber', async (req, res) => {
  try {
    const { vehicleNumber } = req.params;

    // First, check in active bookings collection
    let booking = await Booking.findOne({ numberPlate: vehicleNumber })
      .sort({ createdAt: -1 })
      .select('createdAt entryTime exitTime paymentStatus')
      .lean();

    // If not found in active bookings, check in booking logs
    if (!booking) {
      booking = await BookingLog.findOne({ numberPlate: vehicleNumber })
        .sort({ createdAt: -1 })
        .select('createdAt entryTime exitTime paymentStatus')
        .lean();
    }

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'No booking found for this vehicle' 
      });
    }

    res.json({
      success: true,
      booking: {
        bookingDate: booking.createdAt,
        entryTime: booking.entryTime,
        exitTime: booking.exitTime,
        paymentStatus: booking.paymentStatus || 'PENDING'
      }
    });

  } catch (error) {
    console.error('Error fetching latest booking:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking details' 
    });
  }
});

module.exports = router;
