const User = require('../../models/User');
const mongoose = require('mongoose');
const {
  hashPassword,
  verifyPassword,
  signAuthToken
} = require('../utils/auth');

const AUTH_SECRET = process.env.AUTH_SECRET || 'nesthub-dev-secret-change-me';

const sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    is_verified: user.is_verified,
    created_at: user.created_at
  };
};

const register = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          'Database is not connected. Please start MongoDB and verify MONGO_URI in backend/.env'
      });
    }

    const {
      name,
      email,
      phone,
      password,
      password_hash,
      role,
      is_verified
    } = req.body;

    const plainPassword = password || password_hash;
    if (!name || !email || !phone || !plainPassword || !role) {
      return res.status(400).json({
        message: 'name, email, phone, password and role are required'
      });
    }

    if (plainPassword.length < 6) {
      return res.status(400).json({
        message: 'password must be at least 6 characters long'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    if (!['tenant', 'owner'].includes(role)) {
      return res.status(400).json({
        message: "role must be either 'tenant' or 'owner'"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists with this email or phone'
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      password_hash: hashPassword(plainPassword),
      role,
      is_verified
    });

    const token = signAuthToken(
      { userId: user._id.toString(), role: user.role, email: user.email },
      AUTH_SECRET
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'User already exists with this email or phone' });
    }
    if (error?.code === 13 || /requires authentication|authentication failed/i.test(error.message)) {
      return res.status(500).json({
        message:
          'MongoDB authentication failed. Update MONGO_URI with username/password in backend/.env'
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message:
          'Database is not connected. Please start MongoDB and verify MONGO_URI in backend/.env'
      });
    }

    const { email, password, password_hash } = req.body;
    const plainPassword = password || password_hash;

    if (!email || !plainPassword) {
      return res.status(400).json({
        message: 'email and password are required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let passwordOk = false;
    const looksHashed = typeof user.password_hash === 'string' && user.password_hash.includes(':');

    if (looksHashed) {
      passwordOk = verifyPassword(plainPassword, user.password_hash);
    } else {
      // Backward compatibility for old plain-text entries; migrate after successful login.
      passwordOk = user.password_hash === plainPassword;
      if (passwordOk) {
        user.password_hash = hashPassword(plainPassword);
        await user.save();
      }
    }

    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signAuthToken(
      { userId: user._id.toString(), role: user.role, email: user.email },
      AUTH_SECRET
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error?.code === 13 || /requires authentication|authentication failed/i.test(error.message)) {
      return res.status(500).json({
        message:
          'MongoDB authentication failed. Update MONGO_URI with username/password in backend/.env'
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  me
};
