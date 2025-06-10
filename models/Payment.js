const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  userId: { type: String, ref: "User", required: true }, // Alphanumeric userId
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["success", "failed"], required: true },
  paymentMethod: { type: String, required: true },
  transactionId: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);
