const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { 
    type: String, 
    required: true, 
    enum: ['Mathematics', 'Chemistry', 'Physics', 'Biology', 'English', 'Geography'] 
  },
  content: { type: String, required: true, trim: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', questionSchema);
