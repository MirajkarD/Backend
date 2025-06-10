const express = require("express");
const { getBookingLogs } = require("../controllers/completebookingLogController");


const router = express.Router();

// Get all booking logs
// Define the route
router.get("/completebooking-logs/all", getBookingLogs); 




module.exports = router;
