const mongoose = require("mongoose");

const bookingLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  location: { type: String, required: true },
  numberPlate: { type: String, required: true },
  date: { type: Date, required: true },
  entryTime: { type: String, required: true },
  exitTime: { type: String, required: true },
  slotNumber: { type: Number, required: true },
  status: { type: String, required: true },
  archivedAt: { type: Date, required: true }, // Timestamp for when the booking was archived
});

// Check if model is already compiled, and use it if so
const BookingLog = mongoose.models.BookingLog || mongoose.model("BookingLog", bookingLogSchema);

// Export the BookingLog model
module.exports = BookingLog;
