const mongoose = require('mongoose');

const cancelBookingSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  userFirstName: { type: String, required: true },
  userLastName: { type: String, required: true },
  userEmail: { type: String, required: true },
  slotNumber: { type: Number, required: true },
  cancellationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CancelBooking', cancelBookingSchema);
