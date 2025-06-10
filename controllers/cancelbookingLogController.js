const cancelBooking = require("../models/cancelBooking"); // Replace with the correct path

// Get all booking logs
const getAllBookingLogs = async (req, res) => {
  try {
    const logs = await cancelBooking.find().sort({ archivedAt: -1 }); // Fetch logs sorted by archived time
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching booking logs:", error);
    res.status(500).json({ error: "Failed to fetch booking logs" });
  }
};


module.exports = {
  getAllBookingLogs,

};
