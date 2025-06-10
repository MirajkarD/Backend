const mongoose = require('mongoose');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/parking_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const createAdminUser = async () => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ role: 'Admin' });
        
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const adminUser = await User.create({
            userId: uuidv4(),
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '1234567890',
            email: 'admin@parking.com',
            password: 'Admin@123',
            role: 'Admin',
            isTemporary: false
        });

        console.log('Admin user created successfully:', adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

createAdminUser();
