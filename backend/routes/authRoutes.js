// /backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Login route
router.post('/login', authController.login);

// Get current user info route (protected)
router.get('/me', authenticateToken, authController.getMe);

// Register route
router.post('/register', authController.register);

module.exports = router;