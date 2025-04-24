const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  passwordHash: { type: String, required: false },
  googleId: { type: String, unique: true, sparse: true },
  authMethod: {
    type: String,
    enum: ['email-password', 'google'],
    required: true,
    default: 'email-password',
    resetToken: { type: String },
    resetTokenExpiry: { type: Date }
  },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
  firstName: String,
  lastName: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

// // Add validation for email/password users
// userSchema.pre('save', function(next) {
//   if (this.authMethod === 'email-password' && !this.passwordHash) {
//     next(new Error('Password is required for email/password users'));
//   } else {
//     next();
//   }
// });

module.exports = mongoose.model('User', userSchema);