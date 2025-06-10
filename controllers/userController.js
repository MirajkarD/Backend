// userController.js
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Alert = require("../models/Alert");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Layout = require("../models/Layout");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "e7002e7894d98c7d8c5a6c9e8dd960ddedde617f0d56eeb79144704838f14c363d0449ad39b82b8bdecd87213ea764c2e39c24ad4464ad563914b508b66b5e02";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to encrypt password
const encryptPassword = (password) => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    console.log('Password encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('Error encrypting password:', error);
    return null;
  }
};

// Function to decrypt password
const decryptPassword = (encryptedPassword) => {
  try {
    console.log('Attempting to decrypt password:', { encryptedPassword });
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log('Password decrypted successfully');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return null;
  }
};

// Function to send password email
const sendPasswordEmail = async (userEmail, password, firstName) => {
  try {
    console.log('Attempting to send password email to:', userEmail);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Your Parking Account Password",
      html: `
        <h2>Hello ${firstName}!</h2>
        <p>Thank you for registering with our parking system. Here is your account password:</p>
        <p><strong>${password}</strong></p>
        <p>Please keep this password secure and do not share it with anyone.</p>
        <p>Best regards,<br>Parking Management Team</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending password email:', error);
    throw error; // Re-throw to handle in the calling function
  }
};

const createUser = async (req, res) => {
  try {
    console.log('Creating new user with data:', { ...req.body, password: '[REDACTED]' });
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Encrypt the original password for storage
    const encryptedPassword = encryptPassword(password);
    if (!encryptedPassword) {
      throw new Error('Failed to encrypt password');
    }
    
    const userData = {
      ...rest,
      password: hashedPassword,
      encryptedPassword: encryptedPassword,
      userId: req.body.userId || faker.string.alphanumeric(8),
    };

    const user = new User(userData);
    await user.save();
    console.log('User saved successfully:', { userId: user._id, email: user.email });

    // Send password email
    try {
      await sendPasswordEmail(user.email, password, user.firstName);
      console.log('Password email sent successfully');
    } catch (emailError) {
      console.error('Failed to send password email:', emailError);
      // Continue with user creation even if email fails
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    // Find all users with role 'User'
    const users = await User.find({ role: 'User' })
      .select('firstName lastName email role'); // Select relevant fields for the user

    // Check if any users were found 
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found with role 'User'" });
    }

    // Create an empty array to store the flattened results
    const flattenedUsers = [];

    // Iterate over each user and their bookings
    for (const user of users) {
      // Fetch bookings for each user
      const bookings = await Booking.find({ userId: user._id })
        .select('numberPlate location date entryTime exitTime status slotNumber parkingLevel'); // Select relevant fields for the booking

      // Add each booking as a separate object in the result
      bookings.forEach(booking => {
        flattenedUsers.push({
          userId: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          bookingId: booking._id,
          numberPlate: booking.numberPlate,
          location: booking.location,
          date: booking.date,
          entryTime: booking.entryTime,
          exitTime: booking.exitTime,
          slotNumber: booking.slotNumber,
          parkingLevel:booking.parkingLevel,
          status: booking.status,
        });
      }); 
    }

    // Return the flattened user data with bookings
    return res.status(200).json(flattenedUsers);
  } catch (error) {
    console.error("Error fetching users and bookings:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params; // Get the userId from the request parameters
  const updateData = req.body;  // Get the updated data from the request body

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Update the user in the User collection
    const updatedUser = await User.findByIdAndUpdate(
      userId, // Use MongoDB's default _id
      updateData, // Update fields provided in the request
      { new: true, runValidators: true } // Return the updated document and validate input
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Identify fields to update in the Booking collection
    const bookingUpdateFields = {};

    // If 'location' or any other field related to Booking is updated, set it
    if (updateData.location) {
      bookingUpdateFields.location = updateData.location;
    }
    if (updateData.slotNumber) {
      bookingUpdateFields.slotNumber = updateData.slotNumber;
    }

    // If there are fields to update in Booking, proceed with the update
    if (Object.keys(bookingUpdateFields).length > 0) {
      const bookingUpdateResult = await Booking.updateMany(
        { userId: updatedUser._id }, // Match bookings by userId
        { $set: bookingUpdateFields } // Update only relevant fields
      );

      if (bookingUpdateResult.nModified > 0) {
        console.log(`Bookings updated successfully for user: ${userId}`);
      } else {
        console.log(`No bookings were updated for user: ${userId}`);
      }
    }

    res.status(200).json({
      message: "User and associated bookings updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Error updating user and bookings:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if passwords match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET, // Ensure the environment variable is used here
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id", 
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $sort: { date: -1 } },
    ]);

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

const createUserAdmin = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: "User added to admin dashboard", user });
  } catch (error) {
    console.error("Error adding user to admin dashboard:", error.message);
    res
      .status(500)
      .json({ message: "Error adding user", error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "userId", // Match userId as a string in both collections
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $sort: { paymentDate: -1 } },
    ]);

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};

// Get user by specific userId
const getUserByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Get user's bookings
const getUserBookings = async (req, res) => {
  const userId = req.params.userId;
  try {
    const bookings = await Booking.find({ userId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

// Get user's payments
const getUserPayments = async (req, res) => {
  const userId = req.params.userId;
  try {
    const payments = await Payment.find({ userId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};

// Delete user by userId
const deleteUserBooking = async (req, res) => {
  const { userId, bookingId } = req.params;

  if (!userId || !bookingId) {
    return res.status(400).json({ message: "User ID and Booking ID are required" });
  }

  try {
    // 1. Find the booking first to get slot details
    const booking = await Booking.findOne({ 
      _id: bookingId,
      userId 
    });

    if (!booking) {
      return res.status(404).json({ 
        message: "Booking not found or unauthorized" 
      });
    }

    // 2. Convert slot number to string to match layout format
    const slotNumber = booking.slotNumber.toString();

    // 3. Free the slot in Layout collection
    const layoutUpdate = await Layout.findOneAndUpdate(
      {
        name: "l1",
        "slots.id": slotNumber
      },
      { $set: { "slots.$.status": "Empty" } },
      { new: true }
    );

    if (!layoutUpdate) {
      console.error("Slot not found in layout:", slotNumber);
      return res.status(500).json({ 
        message: "Failed to update parking slot status" 
      });
    }

    // 4. Delete the booking
    await Booking.deleteOne({ _id: bookingId });

    res.status(200).json({ 
      message: "Booking deleted and slot freed successfully",
      freedSlot: slotNumber,
      bookingId: bookingId
    });

  } catch (error) {
    console.error("Deletion error:", error);
    res.status(500).json({ 
      message: "Failed to complete deletion process",
      error: error.message 
    });
  }
};

// Get users by role
const getUserRoleDetails = async (req, res) => {
  try {
    const users = await User.find({ role: "User" }).select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching user role details:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

module.exports = {
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
};