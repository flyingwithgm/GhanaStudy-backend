const PastPaper = require('../models/PastPaper');
const { cloudinary } = require('../middleware/upload');
const { logger } = require('../utils/logger');

const getPapers = async (req, res) => {
  try {
    const { subject, year, limit = 20, page = 1 } = req.query;
    
    // Build query
    let query = {};
    if (subject) query.subject = subject;
    if (year) query.year = parseInt(year);
    
    const papers = await PastPaper.find(query)
      .sort({ year: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await PastPaper.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: papers.length,
      total: total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
       papers
    });
  } catch (error) {
    logger.error('Get papers error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const getPaper = async (req, res) => {
  try {
    const paper = await PastPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ 
        success: false,
        message: 'Paper not found' 
      });
    }
    res.status(200).json({
      success: true,
       paper
    });
  } catch (error) {
    logger.error('Get paper error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const uploadPaper = async (req, res) => {
  try {
    const { subject, year } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }
    
    const paper = await PastPaper.create({
      subject,
      year: parseInt(year),
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.user._id,
      storageType: 'cloudinary'
    });
    
    res.status(201).json({
      success: true,
       paper
    });
  } catch (error) {
    logger.error('Upload paper error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const downloadPaper = async (req, res) => {
  try {
    const paper = await PastPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ 
        success: false,
        message: 'Paper not found' 
      });
    }
    
    // Increment download count
    paper.downloads += 1;
    await paper.save();
    
    res.status(200).json({
      success: true,
       {
        url: paper.filePath,
        fileName: paper.fileName
      }
    });
  } catch (error) {
    logger.error('Download paper error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const deletePaper = async (req, res) => {
  try {
    const paper = await PastPaper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ 
        success: false,
        message: 'Paper not found' 
      });
    }
    
    // Check permissions
    if (paper.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to delete this paper' 
      });
    }
    
    // Delete from Cloudinary if stored there
    if (paper.storageType === 'cloudinary') {
      try {
        const publicId = paper.filePath.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`ghanastudy/${publicId}`);
      } catch (deleteError) {
        logger.error('Error deleting from Cloudinary:', deleteError);
      }
    }
    
    // Delete from database
    await paper.remove();
    
    res.status(200).json({ 
      success: true,
      message: 'Paper deleted successfully' 
    });
  } catch (error) {
    logger.error('Delete paper error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const searchPapers = async (req, res) => {
  try {
    const { q, subject, year, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ 
        success: false,
        message: 'Search query is required' 
      });
    }
    
    const query = {
      $or: [
        { subject: { $regex: q, $options: 'i' } },
        { fileName: { $regex: q, $options: 'i' } }
      ]
    };
    
    if (subject) query.subject = subject;
    if (year) query.year = parseInt(year);
    
    const papers = await PastPaper.find(query)
      .sort({ year: -1, downloads: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: papers.length,
       papers
    });
  } catch (error) {
    logger.error('Search papers error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { 
  getPapers, 
  getPaper, 
  uploadPaper, 
  downloadPaper, 
  deletePaper,
  searchPapers
};
