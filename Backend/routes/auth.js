//Backend/routes/archives.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login
router.post('/login', async (req, res) => {
  try {

    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    // if (user.role !== 'admin') {
    //     return res.status(403).json({ error: 'Access denied. Admin privileges  required' }); 
    //   }
      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});



// Google Authentication 
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { given_name, family_name, email, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Existing user - generate token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      return res.json({ token });
    }

    // New user - require additional info
    const tempToken = jwt.sign(
      { email, googleId, firstName: given_name, lastName: family_name },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.status(202).json({
      requiresAdditionalInfo: true,
      tempToken
    });

  } catch (error) {
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

router.post('/google/complete', async (req, res) => {
  try {
    const { firstName, lastName, accessCode } = req.body;
    
    // Verify temp token
    const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
    
    if (accessCode !== "testing") {
      return res.status(400).json({ error: "Invalid access code" });
    }

    const newUser = new User({
      firstName: firstName || decoded.firstName,
      lastName: lastName || decoded.lastName,
      email: decoded.email,
      googleId: decoded.googleId,
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.post('/signup', async (req, res) => {
    try {
      const { firstName, lastName, email, password, accessCode } = req.body;
  
      // Access code verification
      if (accessCode !== "testing") {
        return res.status(403).json({ error: "Invalid access code" });
      }
  
      // Existing user check
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      // Password hashing
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
  
      // Create new user with additional fields
      const newUser = new User({
        firstName,
        lastName,
        email,
        passwordHash,
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      });
  
      const savedUser = await newUser.save();
  
      // Create JWT token
      const token = jwt.sign(
        { userId: savedUser._id, role: savedUser.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
  
      res.status(201).json({
        token,
        user: {
          id: savedUser._id,
          email: savedUser.email,
          role: savedUser.role,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          isActive: savedUser.isActive,
          createdAt: savedUser.createdAt
        }
      });
  
    } catch (error) {
      console.error('SIGNUP ERROR:', error);
      
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;