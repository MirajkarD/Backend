const mongoose = require("mongoose");

const ViolationStatsSchema = new mongoose.Schema({
  dailyViolations: Number,
  monthlyViolations: Number,
  mostCommonViolations: [
    {
      type: { type: String, required: true },
      count: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("ViolationStats", ViolationStatsSchema);
