const mongoose = require("mongoose");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const Booking = require("../models/Booking"); 
const Slot = require("../models/Slot"); 
const User = require("../models/User");

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to decrypt password
const decryptPassword = (encryptedPassword) => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(process.env.ENCRYPTION_IV, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Error decrypting password:', error);
    return null;
  }
};

// Function to send email with password
const sendPasswordEmail = async (userEmail, decryptedPassword, firstName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Your Parking Account Password",
      html: `
        <h2>Hello ${firstName}!</h2>
        <p>As requested, here is your account password for the parking system:</p>
        <p><strong>${decryptedPassword}</strong></p>
        <p>Please keep this password secure and do not share it with anyone.</p>
        <p>Best regards,<br>Parking Management Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending password email:', error);
  }
};

async function handleExpiredBookings() {
  try {
    const currentTime = new Date(); 
    const utcCurrentTime = new Date(currentTime.toISOString()); 

    console.log({
      currentTime: utcCurrentTime,
    });

    const expiredBookings = await Booking.find({
      exitTime: { $lte: utcCurrentTime },
      status: { $ne: 'COMPLETED' } // Only process bookings that aren't already completed
    });

    console.log("Expired Bookings Found:", expiredBookings.length);
    console.log("Expired Bookings Details:", expiredBookings);

    for (const booking of expiredBookings) {
      try {
        let slot = await Slot.findOne({ slotNumber: booking.slotNumber });
        
        if (!slot) {
          console.log(`Creating new slot ${booking.slotNumber}`);
          slot = await Slot.create({
            slotNumber: booking.slotNumber,
            isAvailable: true
          });
        } else {
          slot = await Slot.findOneAndUpdate(
            { slotNumber: booking.slotNumber },
            { $set: { isAvailable: true } },
            { new: true }
          );
        }

        console.log(`Successfully updated slot ${booking.slotNumber} availability to true`);

        const user = await User.findById(booking.userId);

        if (!user) {
          console.error(`User not found for booking: ${booking._id}`);
          continue;
        }

        // Send password email to user
        if (user.password) {
          const decryptedPassword = decryptPassword(user.password);
          if (decryptedPassword) {
            await sendPasswordEmail(user.email, decryptedPassword, user.firstName);
          }
        }

        // Update booking status to completed instead of creating a log
        await Booking.findByIdAndUpdate(booking._id, {
          status: 'COMPLETED',
          completedAt: new Date()
        });
        
        console.log(`Successfully processed booking ${booking._id} for slot ${booking.slotNumber}`);
      } catch (error) {
        console.error(`Error processing booking ${booking._id}:`, error);
      }
    }

    console.log(`Processed ${expiredBookings.length} expired bookings.`);
  } catch (error) {
    console.error("Error processing expired bookings:", error);
  }
}

// Schedule the function to run every minute
cron.schedule("* * * * *", handleExpiredBookings);
