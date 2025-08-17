const mongoose = require('mongoose');

const pastPaperSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  year: { type: Number, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  downloads: { type: Number, default: 0 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storageType: { type: String, enum: ['cloudinary', 'local'], default: 'cloudinary' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PastPaper', pastPaperSchema);
