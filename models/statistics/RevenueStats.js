const mongoose = require("mongoose");

const revenueStatsSchema = new mongoose.Schema({
  dailyRevenue: { type: Number, required: true },
  weeklyRevenue: { type: Number, required: true },
  monthlyRevenue: { type: Number, required: true },
});

module.exports = mongoose.model("RevenueStats", revenueStatsSchema);
