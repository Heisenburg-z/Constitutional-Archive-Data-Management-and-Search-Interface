const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Create a transporter (you'll need to install nodemailer: npm install nodemailer)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email Transporter Error:', error);
  } else {
    console.log('Email service ready');
  }
});

// Password hashing configuration
const SALT_ROUNDS = 10;

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash -__v');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(req.params.id).select('-passwordHash -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new user (admin only)
router.post('/', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'user' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
      email,
      passwordHash: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true
    });

    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user (admin or self)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, SALT_ROUNDS);
      delete updates.password;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select('-passwordHash -__v');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route POST /api/users/request-reset
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = crypto.randomBytes(20).toString('hex');
    const expiry = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Replace console.log with actual email sending
    try {
      const resetUrl = `http://localhost:3000/reset-password/${token}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset - Constitutional Archive',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your Constitutional Archive account.</p>
          <p>Please click the link below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}" style="padding: 10px 15px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `
      };

      await transporter.sendMail(mailOptions);
      res.json({ message: 'Password reset link has been sent to your email' });
    } catch (emailErr) {
      console.error("Email sending error:", emailErr);
      // If email fails, still provide the token (for development or fallback)
      console.log(`Reset link for development: http://localhost:3000/reset-password/${token}`);
      res.json({ message: 'Password reset prepared, but email delivery failed. Please contact support.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/reset-password/:token
router.put('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() } // Token not expired
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.passwordHash = hashed;

    // Clear the reset token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();
    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;