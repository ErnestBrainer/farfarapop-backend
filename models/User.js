const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, unique: true, sparse: true }, // optional, unique if provided
  phone:    { type: String, unique: true, sparse: true }, // optional, unique if provided
  password: { type: String, required: true },

  // ✅ Fields for password reset
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date }

}, { timestamps: true });

// Ensure at least email or phone is provided
userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Either email or phone number is required');
    this.invalidate('phone', 'Either email or phone number is required');
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password compare method
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
