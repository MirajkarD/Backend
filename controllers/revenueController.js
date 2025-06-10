const Booking = require("../models/Booking");
const Revenue = require("../models/Revenue"); // Make sure to import the Revenue model

const getRevenueStatistics = async (req, res) => {
  try {
    const now = new Date();
    const dayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const monthStart = new Date(now.setDate(1));

    const dailyRevenue = await calculateRevenue(dayStart);
    const weeklyRevenue = await calculateRevenue(weekStart);
    const monthlyRevenue = await calculateRevenue(monthStart);

    // Optional: Store calculated revenue in the database
    await Revenue.create({
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
    });

    res.status(200).json({
      daily: dailyRevenue,
      weekly: weeklyRevenue,
      monthly: monthlyRevenue,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching revenue statistics", error });
  }
};

const calculateRevenue = async (startDate) => {
  const bookings = await Booking.find({
    startTime: { $gte: startDate },
    status: "completed",
  });
  return bookings.reduce((total, booking) => total + booking.price, 0);
};

module.exports = { getRevenueStatistics };
