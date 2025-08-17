const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  completedTasks: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  points: { type: Number, default: 0 },
  studyTime: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
