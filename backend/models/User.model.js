const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String, required: true, unique: true, trim: true,
    minlength: 3, maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscores'],
  },
  email: {
    type: String, required: true, unique: true,
    trim: true, lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 300 },
  isActive: { type: Boolean, default: true },
  stats: {
    solved: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
  },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
