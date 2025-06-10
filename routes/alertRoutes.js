// routes/alertRoutes.js
const express = require("express");
const {
  getAllAlerts,
  userCreatedAlert,
  bookingCreatedAlert,
  slotOccupiedAlert,
  parkingViolationAlert,
  paymentIssueAlert,
  gateIssueAlert,
  sensorMalfunctionAlert,
  slotOutOfServiceAlert,
} = require("../controllers/alertController");

const router = express.Router();

router.get("/", getAllAlerts);

// Route for notifying when a user is created
router.post("/user-created", userCreatedAlert);

// Route for notifying when a new booking is created
router.post("/new-booking", bookingCreatedAlert);

// Route for notifying when a slot is occupied
router.post("/slot-occupied", slotOccupiedAlert);

// Route for parking violations
router.post("/parking-violation", parkingViolationAlert);

// Route for payment issues
router.post("/payment-issue", paymentIssueAlert);

// Route for entry/exit gate issues
router.post("/gate-issue", gateIssueAlert);

// Route for technical/sensor malfunctions
router.post("/sensor-malfunction", sensorMalfunctionAlert);

// Route for slot out-of-service alerts
router.post("/slot-out-of-service", slotOutOfServiceAlert);

module.exports = router;
