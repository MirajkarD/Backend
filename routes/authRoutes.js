// routes/authRoutesjs
const express = require('express');
const { register, login, refreshToken, getUserInfo  } = require('../controllers/authController');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Test database connection
router.get('/test-db', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  res.json({
    status: 'success',
    message: `Database is ${states[dbState]}`,
    state: dbState
  });
});

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/user', auth, getUserInfo);

module.exports = router;
