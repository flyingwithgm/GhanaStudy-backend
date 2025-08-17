const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true, trim: true },
  timestamp: { type: Date, default: Date.now }
});

groupMessageSchema.index({ group: 1, timestamp: -1 });

module.exports = mongoose.model('GroupMessage', groupMessageSchema);
