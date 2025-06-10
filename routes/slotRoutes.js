const express = require("express");
const {
  createSlot,
  getSlots,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getBookedSlots,
} = require("../controllers/slotControllers"); // Change to import if using ES modules

const router = express.Router();

// Create a new slot
router.post("/slots", createSlot);

// Get all slots
router.get("/slots", getSlots);

// Update a slot
router.put("/slots/:slotId", updateSlot); // slotId as a route parameter

// Delete a slot
router.delete("/slots/:slotId", deleteSlot); // slotId as a route parameter

router.get("/slots/available", getAvailableSlots);
router.get("/slots/booked", getBookedSlots);

module.exports = router; // Change to export if using ES modules
