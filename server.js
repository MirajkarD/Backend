// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const slotRoutes = require("./routes/slotRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingExpRoutes = require("./routes/bookingExpRoutes");
const alertRoutes = require("./routes/alertRoutes");
const userDetailsRoutes = require("./routes/userDetailsRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const layoutRoutes = require("./routes/layoutRoutes");
const revenueRoutes = require("./routes/revenueRoutes");
const parkingRoutes = require("./routes/parkingRoutes");

require("./controllers/bookingExpController");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use("/api/auth", authRoutes);

app.use("/api", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api", paymentRoutes);
app.use("/api", slotRoutes);
app.use("/api/layout", layoutRoutes);
app.use("/api", revenueRoutes);
app.use("/api", alertRoutes);
app.use("/api", userDetailsRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/booking-exp", bookingExpRoutes);

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
