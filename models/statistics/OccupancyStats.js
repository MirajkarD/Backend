const mongoose = require("mongoose");

const occupancyStatsSchema = new mongoose.Schema({
  currentOccupancy: { type: Number, required: true },
  peakOccupancy: { type: Number, required: true },
  historicalTrends: [
    {
      month: { type: String, required: true },
      occupancy: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("OccupancyStats", occupancyStatsSchema);
