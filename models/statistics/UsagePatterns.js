const mongoose = require("mongoose");

const usagePatternsSchema = new mongoose.Schema({
  averageDuration: { type: Number, required: true },
  mostPopularSlots: [{ type: String, required: true }],
});

module.exports = mongoose.model("UsagePatterns", usagePatternsSchema);
