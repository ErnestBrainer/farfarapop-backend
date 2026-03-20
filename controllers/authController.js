const User = require('../models/User');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');

// Signup - create new user with email or phone
exports.signup = async (req, res) => {
  let { username, email, phone, password } = req.body;

  try {
    console.log('Signup request:', req.body);

    // Normalize inputs
    username = username?.trim().toLowerCase();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();
    password = password?.trim();

    // Validate
    if (!username || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'Username, password, and email or phone are required' });
    }

    // Check uniqueness
    if (await User.findOne({ username })) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    if (email && (await User.findOne({ email }))) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    if (phone && (await User.findOne({ phone }))) {
      return res.status(400).json({ error: 'Phone already registered' });
    }

    // Create user (password hashed in schema pre-save)
    const user = await User.create({ username, email, phone, password });
    console.log('User created:', user);

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
};

// Login - accept username, email, or phone
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password required' });
    }

    const id = identifier.trim().toLowerCase();
    const pwd = password.trim();

    // Find user by username, email, or phone
    const user = await User.findOne({
      $or: [
        { username: { $regex: `^${id}$`, $options: 'i' } },
        { email: { $regex: `^${id}$`, $options: 'i' } },
        { phone: id },
      ],
    });

    if (!user) {
      console.log('Login failed: User not found');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Compare password using schema method
    const isMatch = await user.matchPassword(pwd);
    if (!isMatch) {
      console.log('Login failed: Incorrect password');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful:', user.username);
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Forgot password - generate reset token
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log('Forgot password request for:', email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    console.log('Password reset link:', resetUrl);

    res.json({ message: `Password reset link: ${resetUrl}` });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Reset password - verify token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = password.trim(); // pre-save hook will hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    console.log('Password reset successful for user:', user.username);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
