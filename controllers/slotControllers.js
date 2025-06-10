const Slot = require("../models/Slot"); // Use require instead of import

// Create a new slot
const createSlot = async (req, res) => {
  try {
    const newSlot = new Slot(req.body);
    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (error) {
    res.status(500).json({ message: "Error creating slot", error });
  }
};

// Get all slots
const getSlots = async (req, res) => {
  try {
    const slots = await Slot.find();
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ message: "Error fetching slots", error });
  }
};

// Get available slots
const getAvailableSlots = async (req, res) => {
  try {
    const availableSlots = await Slot.find({ isAvailable: true });
    res.status(200).json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available slots", error });
  }
};

// Update slot availability
const updateSlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    const updatedSlot = await Slot.findByIdAndUpdate(slotId, req.body, {
      new: true,
    });
    res.status(200).json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: "Error updating slot", error });
  }
};

// Delete a slot
const deleteSlot = async (req, res) => {
  const { slotId } = req.params;
  try {
    await Slot.findByIdAndDelete(slotId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting slot", error });
  }
};

const getBookedSlots = async (req, res) => {
  try {
    // Find slots where isAvailable is false, indicating they are booked
    const bookedSlots = await Slot.find({ isAvailable: false });
    res.status(200).json(bookedSlots);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving booked slots", error });
  }
};

// Export the functions
module.exports = {
  createSlot,
  getSlots,
  getAvailableSlots, // Include getAvailableSlots in the exports
  updateSlot,
  deleteSlot,
  getBookedSlots,
};
