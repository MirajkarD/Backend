// controllers/alertController.js
const Alert = require("../models/Alert"); // Assuming you have an Alert model to store alerts

exports.getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find(); // Retrieve all alerts from the database
    res.status(200).json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve alerts." });
  }
};
// Alert for user creation
exports.userCreatedAlert = async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const alertMessage = `New user created: ${userName} (ID: ${userId}).`;
    await Alert.create({ message: alertMessage, type: "User Creation" });
    res
      .status(200)
      .json({ message: "User creation alert sent.", alert: alertMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alert for new booking
exports.bookingCreatedAlert = async (req, res) => {
  try {
    const { bookingId, userId, slotId } = req.body;
    const alertMessage = `New booking created: Booking ID ${bookingId}, User ID ${userId}, Slot ID ${slotId}.`;
    await Alert.create({
      message: alertMessage,
      type: "Booking Creation",
    });
    res
      .status(200)
      .json({ message: "Booking creation alert sent.", alert: alertMessage });
  } catch (error) {
    console.error("Error creating booking alert:", error);
    res.status(500).json({ error: error.message });
  }
};

// Alert for slot occupation
exports.slotOccupiedAlert = async (req, res) => {
  try {
    const { slotId, userId } = req.body;
    const alertMessage = `Slot ${slotId} is now occupied by User ID: ${userId}.`;
    await Alert.create({ message: alertMessage, type: "Slot Occupation" });
    res
      .status(200)
      .json({ message: "Slot occupation alert sent.", alert: alertMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alert for parking violations
exports.parkingViolationAlert = async (req, res) => {
  try {
    const { slotId, issue } = req.body;
    const alertMessage = `Parking violation detected in Slot ${slotId}: ${issue}.`;
    await Alert.create({ message: alertMessage, type: "Parking Violation" });
    res
      .status(200)
      .json({ message: "Parking violation alert sent.", alert: alertMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alert for payment issues
exports.paymentIssueAlert = async (req, res) => {
  try {
    const { slotId, userId, issue } = req.body;
    const alertMessage = `Payment issue for Slot ${slotId} (User ID: ${userId}): ${issue}.`;
    await Alert.create({ message: alertMessage, type: "Payment Issue" });
    res
      .status(200)
      .json({ message: "Payment issue alert sent.", alert: alertMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alert for gate issues
exports.gateIssueAlert = async (req, res) => {
  try {
    const { gateId, issue } = req.body;
    const alertMessage = `Gate issue detected at Gate ${gateId}: ${issue}.`;
    await Alert.create({ message: alertMessage, type: "Gate Issue" });
    res
      .status(200)
      .json({ message: "Gate issue alert sent.", alert: alertMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alert for sensor malfunctions
exports.sensorMalfunctionAlert = async (req, res) => {
  try {
    const { sensorId, issue } = req.body;
    const alertMessage = `Sensor malfunction detected at Sensor ${sensorId}: ${issue}.`;
    await Alert.create({ message: alertMessage, type: "Sensor Malfunction" });
    res
      .status(200)
      .json({ message: "Sensor malfunction alert sent.", alert: alertMessage });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alert for slot out-of-service
exports.slotOutOfServiceAlert = async (req, res) => {
  try {
    const { slotId, reason } = req.body;
    const alertMessage = `Slot ${slotId} is out of service: ${reason}.`;
    await Alert.create({ message: alertMessage, type: "Slot Out of Service" });
    res.status(200).json({
      message: "Slot out-of-service alert sent.",
      alert: alertMessage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
