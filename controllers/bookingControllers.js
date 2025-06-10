const Booking = require("../models/Booking");
const User = require("../models/User");
const Layout = require("../models/Layout");
const Payment = require("../models/Payment");
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { generateQRCode, sendQRCodeEmail } = require('../utils/qrCodeUtils');

const createBooking = async (req, res) => {
  try {
    const {
      numberPlate,
      location,
      date,
      entryTime,
      exitTime,
      slotNumber,
      parkingLevel,
      amount,
      userId,
      name,
      email,
      phoneNumber
    } = req.body;

    console.log('Received booking request:', { 
      numberPlate, location, slotNumber, parkingLevel, 
      entryTime, exitTime, date,
      userId: userId || 'Not provided',
      hasUserDetails: Boolean(name && email)
    });

    let user;
    if (userId) {
      console.log('Finding existing user by ID:', userId);
      user = await User.findById(userId);
      if (!user) {
        console.log('User not found with ID:', userId);
        return res.status(404).json({ message: 'User not found with provided ID' });
      }
    } else if (email && name) {
      console.log('Creating new temporary user with provided details');
      
      // Split name into firstName and lastName, ensuring lastName is not empty
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;
      
      user = new User({
        userId: uuidv4(),
        firstName,
        lastName,
        email,
        phoneNumber: phoneNumber || '0000000000', // Default phone if not provided
        role: 'User', // This will automatically set password to 'N/A'
        numberPlates: [numberPlate],
        isTemporary: true
      });

      try {
        await user.save();
        console.log('New temporary user created successfully');
      } catch (error) {
        console.error('Error creating new temporary user:', error);
        throw new Error('Failed to create new temporary user: ' + error.message);
      }
    } else {
      console.log('Missing required user details');
      return res.status(400).json({ 
        message: 'Either userId or user details (name, email) must be provided' 
      });
    }
    
    // Update user's number plates if needed
    if (user && !user.numberPlates.includes(numberPlate)) {
      user.numberPlates.push(numberPlate);
      try {
        await user.save();
        console.log('Updated user numberplates:', user.numberPlates);
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    }

    // Calculate amount based on duration if not provided
    const duration = Math.ceil((new Date(exitTime) - new Date(entryTime)) / (1000 * 60 * 60)); // Duration in hours
    const calculatedAmount = amount || duration * (parkingLevel === 'PREMIUM' ? 100 : 50); // 100 per hour for premium, 50 for regular

    const newBooking = new Booking({
      userId: user._id,
      numberPlate,
      location,
      date: new Date(date),
      entryTime: new Date(entryTime),
      exitTime: new Date(exitTime),
      slotNumber,
      parkingLevel,
      amount: calculatedAmount,
      status: 'pending'
    });

    const savedBooking = await newBooking.save();
    console.log('Booking saved successfully:', savedBooking._id);

    // Generate QR code and send email
    try {
      await sendQRCodeEmail(savedBooking, user.email);
      console.log('QR code email sent successfully');
    } catch (emailError) {
      console.error('Error sending QR code email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking,
      user: {
        id: user._id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      }
    });

  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ 
      message: 'Error creating booking',
      error: error.message 
    });
  }
};

// Fetch active bookings
const getActiveReservations = async (req, res) => {
  try {
    const activeBookings = await Booking.find({ status: "active" });
    res.status(200).json(activeBookings);
  } catch (error) {
    console.error("Error fetching active reservations:", error);
    res
      .status(500)
      .json({
        message: "Error fetching active reservations",
        error: error.message,
      });
  }
};

// Fetch upcoming bookings
const getUpcomingReservations = async (req, res) => {
  try {
    const upcomingBookings = await Booking.find({
      startTime: { $gte: new Date() },
    });
    res.status(200).json(upcomingBookings);
  } catch (error) {
    console.error("Error fetching upcoming reservations:", error);
    res
      .status(500)
      .json({
        message: "Error fetching upcoming reservations",
        error: error.message,
      });
  }
};

// Fetch cancelled bookings
const getBookingCancellations = async (req, res) => {
  try {
    const cancellations = await Booking.find({ status: "cancelled" });
    res.status(200).json(cancellations);
  } catch (error) {
    console.error("Error fetching booking cancellations:", error);
    res
      .status(500)
      .json({ message: "Error fetching cancellations", error: error.message });
  }
};

// Fetch active bookings for a specific user
const getActiveBookingsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const activeBookings = await Booking.find({
      userId,
      status: "active",
    });
    res.status(200).json(activeBookings);
  } catch (error) {
    console.error("Error fetching active bookings by user:", error);
    res
      .status(500)
      .json({
        message: "Error fetching active bookings by user",
        error: error.message,
      });
  }
};

// Fetch upcoming bookings for a specific user
const getUpcomingBookingsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const upcomingBookings = await Booking.find({
      userId,
      startTime: { $gte: new Date() },
    });
    res.status(200).json(upcomingBookings);
  } catch (error) {
    console.error("Error fetching upcoming bookings by user:", error);
    res
      .status(500)
      .json({
        message: "Error fetching upcoming bookings by user",
        error: error.message,
      });
  }
};

// Get all bookings with user details
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate(
      "userId",
      "firstName lastName email"
    );
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res
      .status(500)
      .json({ message: "Error fetching all bookings", error: error.message });
  }
};

const checkUserByVehicle = async (req, res) => {
  try {
    const { vehicleNumber } = req.params;
    
    // Find user with this vehicle number
    const user = await User.findOne({ numberPlates: vehicleNumber });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        isRegistered: false 
      });
    }

    return res.status(200).json({
      message: 'User found',
      isRegistered: true,
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userId: user._id
      }
    });
  } catch (error) {
    console.error('Error checking user by vehicle:', error);
    return res.status(500).json({ 
      message: 'Server error while checking user',
      error: error.message 
    });
  }
};

// Get booking payment details
const getBookingPaymentDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .select('numberPlate amount status userId')
            .populate('userId', 'firstName lastName email');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json({
            bookingId: booking._id,
            numberPlate: booking.numberPlate,
            amount: booking.amount,
            status: booking.status,
            firstName: booking.userId.firstName,
            lastName: booking.userId.lastName,
            email: booking.userId.email
        });
    } catch (error) {
        console.error('Error fetching booking payment details:', error);
        res.status(500).json({ message: 'Error fetching booking details' });
    }
};

// Process payment for a booking
const processBookingPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .populate('userId', 'firstName lastName');
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Create a new payment record
        const payment = new Payment({
            bookingId: booking._id,
            userId: booking.userId._id,
            firstName: booking.userId.firstName,
            lastName: booking.userId.lastName,
            amount: booking.amount,
            status: 'success',
            paymentMethod: 'dummy',
            transactionId: `DUMMY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        // Save the payment record
        await payment.save();

        // Update booking status and payment status
        booking.status = 'confirmed';
        booking.paymentStatus = 'paid';
        booking.paymentTimestamp = new Date();
        await booking.save();

        res.json({ 
            message: 'Payment processed successfully',
            paymentId: payment._id,
            transactionId: payment.transactionId
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Error processing payment' });
    }
};

module.exports = {
    createBooking,
    getActiveReservations,
    getUpcomingReservations,
    getBookingCancellations,
    getActiveBookingsByUser,
    getUpcomingBookingsByUser,
    getAllBookings,
    checkUserByVehicle,
    getBookingPaymentDetails,
    processBookingPayment
};
