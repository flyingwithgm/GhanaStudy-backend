const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isBestAnswer: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Answer', answerSchema);
