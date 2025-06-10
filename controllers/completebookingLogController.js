const BookingLog = require("../models/bookingLog"); // Correct path to the model

// Get all booking logs
const getBookingLogs = async (req, res) => {
  try {
    const bookingLogs = await BookingLog.find().populate('userId', 'firstName lastName email');
    res.status(200).json(bookingLogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking logs', error });
  }
};

module.exports = { getBookingLogs }; // Correctly exporting the function
