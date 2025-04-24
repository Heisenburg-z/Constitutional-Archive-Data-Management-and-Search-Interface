const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String},
  passwordHash: { type: String, required: true },
  googleId: { type: String, unique: true, sparse: true },
  authMethod: {
    type: String,
    enum: ['email-password', 'google'],
    required: true,
    default: 'email-password',
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }
  },
  firstName: String,
  lastName: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

module.exports = mongoose.model('User', userSchema);