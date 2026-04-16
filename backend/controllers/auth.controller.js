const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required.' });

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) {
      const field = exists.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} already taken.` });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email: email.toLowerCase(), password: hashed, role: 'student' });
    const token = generateToken(user);

    res.status(201).json({
      success: true, message: 'Account created!', token,
      user: { _id: user._id, username: user.username, email: user.email, role: user.role, stats: user.stats },
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Username or email already exists.' });
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = generateToken(user);
    res.json({
      success: true, message: 'Login successful!', token,
      user: { _id: user._id, username: user.username, email: user.email, role: user.role, stats: user.stats },
    });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
