const mongoose = require("mongoose");

const revenueSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  dailyRevenue: { type: Number, required: true },
  weeklyRevenue: { type: Number, required: true },
  monthlyRevenue: { type: Number, required: true },
});

module.exports = mongoose.model("Revenue", revenueSchema);
