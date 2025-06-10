const express = require("express");
const router = express.Router();
const {
  getUserDetails,
  getUserDetailsById,
  getUserStatistics
} = require("../controllers/userDetailsController");

const auth = require("../middleware/auth");

// Get all users with role "User"
router.get("/user-details", auth, getUserDetails);

// Get user statistics (must come before :userId route)
router.get("/user-details/statistics", auth, getUserStatistics);

// Get specific user details by userId
router.get("/user-details/:userId", auth, getUserDetailsById);

module.exports = router;
