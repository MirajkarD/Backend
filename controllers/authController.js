// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require("uuid");

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }  // Token will expire in 7 days
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '30d' }  // Refresh token expires in 30 days
    );
};

// Register
exports.register = async (req, res) => {
    console.log('Register request received with body:', JSON.stringify(req.body, null, 2));
    const { firstName, lastName, phoneNumber, email, password, role } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !email || !password) {
        console.log('Missing required fields:', {
            firstName: !firstName,
            lastName: !lastName,
            phoneNumber: !phoneNumber,
            email: !email,
            password: !password
        });
        return res.status(400).json({ 
            error: "Missing required fields",
            details: {
                firstName: !firstName,
                lastName: !lastName,
                phoneNumber: !phoneNumber,
                email: !email,
                password: !password
            }
        });
    }

    try {
        // Check if the email or phone number already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser) {
            console.log('User already exists:', { email, phoneNumber });
            return res.status(400).json({ error: "Email or phone number already in use." });
        }

        // Assign default role as 'User' (capitalized) if not provided
        const userRole = role || "User";

        // Create the user with a unique userId
        const user = await User.create({
            userId: uuidv4(), // Generate unique userId
            firstName,
            lastName,
            phoneNumber,
            email,
            password,
            role: userRole
        });

        console.log('User registered successfully:', { userId: user.userId, email: user.email });
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            error: error.message,
            details: error.errors || {}
        });
    }
};

// Login
exports.login = async (req, res) => {
    const { email, identifier, password } = req.body;
    console.log('Login attempt:', { email, identifier });
    
    try {
        // Use either email or identifier
        const loginEmail = email || identifier;
        
        if (!loginEmail || !password) {
            return res.status(400).json({ 
                error: 'Please provide both email and password' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email: loginEmail });
        console.log('User found:', user ? 'Yes' : 'No');
        
        // If no user is found, send an error
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check if the provided password matches the hashed password stored in the database
        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Calculate expiry times
        const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        // Respond with the token and user data
        const response = {
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
            tokenExpiry: tokenExpiry.getTime(),
            refreshTokenExpiry: refreshTokenExpiry.getTime(),
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        };
        console.log('Login successful, sending response');
        res.json(response);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Generate new tokens
        const newToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Calculate new expiry times
        const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const refreshTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        res.json({
            token: newToken,
            refreshToken: newRefreshToken,
            tokenExpiry: tokenExpiry.getTime(),
            refreshTokenExpiry: refreshTokenExpiry.getTime()
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

// Get User Info
exports.getUserInfo = async (req, res) => {
    const userId = req.user.id;  // Get the user ID from the token (attached to req.user)

    try {
        // Fetch the user by their ID
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user data in the response
        res.json({
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};