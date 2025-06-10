// routes/authRoutesjs
const express = require('express');
const { register, login, refreshToken, getUserInfo  } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/user', auth, getUserInfo);

module.exports = router;
