// adminController.js
const Booking = require("../models/Booking"); 
const User = require("../models/User");

// Get all bookings (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    console.log("Fetching bookings...");
    const bookings = await Booking.find().populate("userId", "firstName lastName");
    console.log("Bookings fetched:", bookings);
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error in getAllBookings:", error);
    res.status(500).json({ error: error.message });
  }
};


