const express = require("express");
const { getAllBookings } = require("../controllers/adminController");
const auth = require("../middleware/auth");

const router = express.Router();
router.get("/bookings", auth, getAllBookings);

module.exports = router;
