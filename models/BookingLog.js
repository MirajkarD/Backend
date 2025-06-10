const mongoose = require("mongoose");

const bookingLogSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  zone: {
    type: String,
    required: true
  },
  slotNumber: {
    type: String,
    required: true
  },
  numberPlate: {
    type: String,
    required: true
  },
  entryTime: {
    type: Date,
    required: true
  },
  exitTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  status: {
    type: String,
    enum: ['COMPLETED', 'CANCELLED'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
bookingLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if model is already compiled, and use it if so
const BookingLog = mongoose.models.BookingLog || mongoose.model("BookingLog", bookingLogSchema);

// Export the BookingLog model
module.exports = BookingLog;
