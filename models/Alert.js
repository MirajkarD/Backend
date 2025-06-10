// models/Alert.js
const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, required: true }, // New field to categorize the alert
  createdAt: { type: Date, default: Date.now },
});

// Customize JSON output
alertSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret._id = `{ ${ret._id} }`; // Format _id with brackets
    return ret;
  },
});

module.exports = mongoose.model("Alert", alertSchema);
