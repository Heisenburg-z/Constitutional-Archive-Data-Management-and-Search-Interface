// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) throw new Error('User not found');

    req.user = user; // Attach full user document
    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = authenticate;