const User = require("../models/User");

// Get all users with role "User"
const getUserDetails = async (req, res) => {
  try {
    const users = await User.find({ role: "User" })
      .select('-password')
      .sort({ firstName: 1 }); // Sort by firstName in ascending order
    
    // Transform the data to include only necessary fields
    const transformedUsers = users.map(user => ({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      numberPlates: user.numberPlates || [],
      isTemporary: user.isTemporary || false,
      totalPlates: user.numberPlates ? user.numberPlates.length : 0
    }));

    res.status(200).json({
      success: true,
      count: transformedUsers.length,
      data: transformedUsers
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// Get user details by userId
const getUserDetailsById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId, role: "User" }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      numberPlates: user.numberPlates || [],
      isTemporary: user.isTemporary || false,
      totalPlates: user.numberPlates ? user.numberPlates.length : 0
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error fetching user details by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// Get summary statistics of users
const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "User" });
    const temporaryUsers = await User.countDocuments({ role: "User", isTemporary: true });
    const permanentUsers = await User.countDocuments({ role: "User", isTemporary: { $ne: true } });
    
    // Debug logs
    console.log('Statistics:', {
      totalUsers,
      temporaryUsers,
      permanentUsers,
    });

    // Get all users for debugging
    const allUsers = await User.find({ role: "User" }).select('isTemporary');
    console.log('All users:', allUsers.map(u => ({ id: u._id, isTemporary: u.isTemporary })));
    
    // Get total number of number plates across all users
    const users = await User.find({ role: "User" });
    const totalNumberPlates = users.reduce((sum, user) => 
      sum + (user.numberPlates ? user.numberPlates.length : 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        temporaryUsers,
        permanentUsers,
        totalNumberPlates,
        averagePlatesPerUser: totalUsers > 0 ? (totalNumberPlates / totalUsers).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};

module.exports = {
  getUserDetails,
  getUserDetailsById,
  getUserStatistics
};
