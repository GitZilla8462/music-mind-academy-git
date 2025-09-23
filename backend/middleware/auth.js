// /backend/middleware/auth.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Authenticates a user by checking for a valid JWT token
exports.authenticateToken = function(req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Checks if the authenticated user has an 'admin' role
exports.requireAdmin = function(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ msg: 'Access denied: Requires admin privileges' });
    }
};

// ✅ ADDED: Checks if the authenticated user has a 'teacher' role
exports.requireTeacher = function(req, res, next) {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        return res.status(403).json({ msg: 'Access denied: Requires teacher privileges' });
    }
};

// ✅ ADDED: Checks if the authenticated user has a 'student' role
exports.requireStudent = function(req, res, next) {
    if (req.user && req.user.role === 'student') {
        next();
    } else {
        return res.status(403).json({ msg: 'Access denied: Requires student privileges' });
    }
};