// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate user using JWT
// This middleware checks for a valid JWT in the request headers
// and attaches the user information to the request object if valid
// If the token is invalid or expired, it sends a 401 Unauthorized response
// and does not proceed to the next middleware or route handler
// This is typically used to protect routes that require authentication
// It verifies the token, retrieves the user ID from it, and fetches the user from the database
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error('User not found');
    // Check if the user is active
    req.user = user; // Attach full user document
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authenticate;