const mongoose = require('mongoose');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/parkingSystemDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const verifyAndCreateAdmin = async () => {
    try {
        // Check if admin exists
        const adminUser = await User.findOne({ role: 'Admin' });
        console.log('Checking for admin user...');
        
        if (adminUser) {
            console.log('Existing admin user found:', {
                email: adminUser.email,
                role: adminUser.role,
                userId: adminUser.userId
            });
            return;
        }

        // Create new admin user
        const password = 'Admin@123'; // Default password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = await User.create({
            userId: uuidv4(),
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '1234567890',
            email: 'admin@parking.com',
            password: hashedPassword,
            role: 'Admin',
            isTemporary: false
        });

        console.log('New admin user created:', {
            email: newAdmin.email,
            role: newAdmin.role,
            userId: newAdmin.userId
        });
        console.log('Default password is: Admin@123');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

verifyAndCreateAdmin();
