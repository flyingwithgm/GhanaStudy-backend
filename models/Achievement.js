const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  unlockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Achievement', achievementSchema);
