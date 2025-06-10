const express = require("express");

const {
  createUser,
  getUsers,
  updateUser,
  getAllBookings,
  getUserByUserId,
  loginUser,
  getUserBookings,
  getUserPayments,
  getAllPayments,
  deleteUserBooking,
  getUserRoleDetails,
  createUserAdmin
} = require("../controllers/userController");

const auth = require("../middleware/auth"); // Authentication middleware (optional, for other routes)
const router = express.Router();

// Route to register a user
router.post("/api/users", createUser);

// Route to get all users
router.get("/users", getUsers);

// Route to update user details
router.put("/users/:userId", updateUser);

// Route to get specific user by ID (protected)
router.get("/users/:userId", auth, getUserByUserId);

// Admin routes to get all bookings and payments
router.get("/admin/bookings", getAllBookings); // Get all bookings (protected)
router.get("/admin/payments", getAllPayments); // Get all payments (protected)

// Route for user login
router.post("/users/login", loginUser);

router.get("/users/:userId/bookings", auth, getUserBookings);
router.get("/users/:userId/payments", auth, getUserPayments);
router.delete('/users/:userId/bookings/:bookingId', deleteUserBooking);

// Route to get all users with role "User"
router.get("/api/user-role-details", getUserRoleDetails);

module.exports = router;
