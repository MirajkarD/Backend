const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true }, // Required field for the slot number
  isAvailable: { type: Boolean, default: true }, // Indicates if the slot is available
});

// Exporting the Slot model based on the schema
module.exports = mongoose.model("Slot", slotSchema);
