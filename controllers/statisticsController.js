const Payment = require("../models/Payment");

// Get daily, weekly, and monthly collection totals
const getCollectionOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    console.log('Date ranges for queries:', {
      today: today.toISOString(),
      startOfWeek: startOfWeek.toISOString(),
      startOfMonth: startOfMonth.toISOString()
    });

    // Daily collection query
    const dailyQuery = [
      {
        $match: {
          $or: [
            { status: "success" },
            { status: "completed" }
          ],
          $or: [
            { paymentDate: { $gte: today } },
            { timestamp: { $gte: today } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ];

    // Weekly collection query
    const weeklyQuery = [
      {
        $match: {
          $or: [
            { status: "success" },
            { status: "completed" }
          ],
          $or: [
            { paymentDate: { $gte: startOfWeek } },
            { timestamp: { $gte: startOfWeek } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ];

    // Monthly collection query
    const monthlyQuery = [
      {
        $match: {
          $or: [
            { status: "success" },
            { status: "completed" }
          ],
          $or: [
            { paymentDate: { $gte: startOfMonth } },
            { timestamp: { $gte: startOfMonth } }
          ]
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ];

    // Execute queries
    const [dailyCollection, weeklyCollection, monthlyCollection] = await Promise.all([
      Payment.aggregate(dailyQuery),
      Payment.aggregate(weeklyQuery),
      Payment.aggregate(monthlyQuery)
    ]);

    console.log('Query results:', {
      daily: dailyCollection,
      weekly: weeklyCollection,
      monthly: monthlyCollection
    });

    const result = {
      dailyCollection: dailyCollection[0]?.total || 0,
      weeklyCollection: weeklyCollection[0]?.total || 0,
      monthlyCollection: monthlyCollection[0]?.total || 0
    };

    console.log('Final result:', result);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getCollectionOverview:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching collection overview",
      error: error.message
    });
  }
};

module.exports = {
  getCollectionOverview
};
