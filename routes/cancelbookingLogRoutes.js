const express = require("express");
const { getAllBookingLogs } = require("../controllers/cancelbookingLogController");


const router = express.Router();

// Get all booking logs
// Define the route
router.get("/cancelbooking-logs/all", getAllBookingLogs); 



module.exports = router;
