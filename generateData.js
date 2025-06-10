const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

// Replace with your MongoDB connection string
const mongoURI = "mongodb://localhost:27017/parkingSystemDB";

// Connect to MongoDB
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import your models
const User = require("./models/User");
const Booking = require("./models/Booking");
const Payment = require("./models/Payment");
const Alert = require("./models/Alert");
const Revenue = require("./models/Revenue");
const Slot = require("./models/Slot");
const OccupancyStats = require("./models/statistics/OccupancyStats");
const RevenueStats = require("./models/statistics/RevenueStats");
const UsagePatterns = require("./models/statistics/UsagePatterns");
const ViolationStats = require("./models/statistics/ViolationStats");

// Helper function to get a random date within the past 10 days to the next 10 days
const randomDateWithinRange = () => {
  const from = new Date();
  from.setDate(from.getDate() - 10); // 10 days in the past
  const to = new Date();
  to.setDate(to.getDate() + 10); // 10 days in the future
  return faker.date.between({ from, to });
};

async function generateDummyData() {
  const users = [];
  const bookings = [];
  const payments = [];
  const alerts = [];
  const revenues = [];
  const slots = [];

  // Create dummy users
  for (let i = 0; i < 10; i++) {
    const user = {
      userId: faker.string.alphanumeric(8),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number("###-###-####"),
      email: faker.internet.email(),
      password: faker.internet.password(),
      numberPlates: [faker.vehicle.vrm()],
      role: faker.helpers.arrayElement(["Admin", "Operator", "User"]), // Add random role
    };
    users.push(user);
  }

  const savedUsers = await User.insertMany(users);
  console.log("Dummy users with unique user IDs generated");

  // Create dummy bookings
  for (const user of savedUsers) {
    const booking = {
      bookingId: faker.string.alphanumeric(8),
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      numberPlate: user.numberPlates[0],
      date: randomDateWithinRange(),
      entryTime: randomDateWithinRange().toISOString(),
      exitTime: randomDateWithinRange().toISOString(),
      slotNumber: faker.number.int({ min: 1, max: 100 }),
    };
    bookings.push(booking);
  }
  await Booking.insertMany(bookings);
  console.log("Dummy bookings with matching user IDs generated");

  // Create dummy payments
  for (const user of savedUsers) {
    const payment = {
      paymentId: faker.string.alphanumeric(8),
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      amount: faker.number.float({ min: 100, max: 1000 }),
      paymentDate: randomDateWithinRange(),
      status: faker.datatype.boolean() ? "success" : "failed",
    };
    payments.push(payment);
  }
  await Payment.insertMany(payments);
  console.log("Dummy payments with matching user IDs generated");

  // Create dummy alerts
  for (const user of savedUsers) {
    const alert = {
      alertId: faker.string.alphanumeric(8),
      userId: user.userId,
      message: faker.lorem.sentence(),
      createdAt: randomDateWithinRange(),
      type: faker.helpers.arrayElement(["Warning", "Error", "Info"]), // Add random type
    };
    alerts.push(alert);
  }
  await Alert.insertMany(alerts);
  console.log("Dummy alerts with matching user IDs generated");

  // Create dummy revenue data
  for (let i = 0; i < 10; i++) {
    const revenue = {
      date: randomDateWithinRange(),
      dailyRevenue: faker.number.float({ min: 100, max: 5000 }),
      weeklyRevenue: faker.number.float({ min: 700, max: 35000 }),
      monthlyRevenue: faker.number.float({ min: 3000, max: 150000 }),
    };
    revenues.push(revenue);
  }
  await Revenue.insertMany(revenues);
  console.log("Dummy revenue data generated");

  // Create dummy slots
  for (let i = 1; i <= 100; i++) {
    const slot = {
      slotNumber: i,
      isAvailable: faker.datatype.boolean(),
    };
    slots.push(slot);
  }
  await Slot.insertMany(slots);
  console.log("Dummy slots generated");

  // Create dummy occupancy stats
  const occupancyStat = {
    currentOccupancy: faker.number.int({ min: 0, max: 100 }),
    peakOccupancy: faker.number.int({ min: 0, max: 100 }),
    historicalTrends: Array.from({ length: 12 }, () => ({
      month: faker.date.month(),
      occupancy: faker.number.int({ min: 0, max: 100 }),
    })),
  };
  await OccupancyStats.create(occupancyStat);
  console.log("Dummy occupancy stats generated");

  // Create dummy revenue stats
  const revenueStat = {
    dailyRevenue: faker.number.float({ min: 100, max: 5000 }),
    weeklyRevenue: faker.number.float({ min: 700, max: 35000 }),
    monthlyRevenue: faker.number.float({ min: 3000, max: 150000 }),
  };
  await RevenueStats.create(revenueStat);
  console.log("Dummy revenue stats generated");

  // Create dummy usage patterns
  const usagePattern = {
    averageDuration: faker.number.int({ min: 1, max: 120 }),
    mostPopularSlots: Array.from({ length: 5 }, () =>
      faker.number.int({ min: 1, max: 100 }).toString()
    ),
  };
  await UsagePatterns.create(usagePattern);
  console.log("Dummy usage patterns generated");

  // Create dummy violation stats
  const violationStats = {
    dailyViolations: faker.number.int({ min: 0, max: 50 }),
    monthlyViolations: faker.number.int({ min: 50, max: 500 }),
    mostCommonViolations: [
      {
        type: "Improper Parking",
        count: faker.number.int({ min: 1, max: 20 }),
      },
      { type: "Overstay", count: faker.number.int({ min: 1, max: 20 }) },
      { type: "Improper Exit", count: faker.number.int({ min: 1, max: 20 }) },
      { type: "No Payment", count: faker.number.int({ min: 1, max: 20 }) },
    ],
  };
  await ViolationStats.create(violationStats);
  console.log("Dummy violation stats generated");
}

// Run the dummy data generation
generateDummyData().then(() => {
  mongoose.connection.close();
});
