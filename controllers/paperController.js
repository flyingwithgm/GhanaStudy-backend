const PastPaper = require('../models/PastPaper');
const { uploadSingle, cloudinary } = require('../middleware/upload');

const getPapers = async (req, res) => {
  try {
    const papers = await PastPaper.find().sort({ year: -1 });
    res.status(200).json({
      success: true,
      count: papers.length,
       papers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

const uploadPaper = async (req, res) => {
  try {
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ 
          success: false,
          message: err.message 
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'No file uploaded' 
        });
      }
      
      const { subject, year } = req.body;
      
      let filePath = req.file.path;
      let storageType = 'cloudinary';
      
      if (!filePath.startsWith('http')) {
        storageType = 'local';
        filePath = `${req.protocol}://${req.get('host')}/${filePath}`;
      }
      
      const paper = await PastPaper.create({
        subject,
        year: parseInt(year),
        fileName: req.file.originalname,
        filePath: filePath,
        storageType: storageType,
        uploadedBy: req.user._id
      });
      
      res.status(201).json({
        success: true,
         paper
      });
    });
  } catch (error) {
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
    
    if (paper.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized to delete this paper' 
      });
    }
    
    if (paper.storageType === 'cloudinary') {
      try {
        const publicId = paper.filePath.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`ghanastudy/${publicId}`);
      } catch (deleteError) {
        console.log('Error deleting from Cloudinary:', deleteError.message);
      }
    }
    
    await paper.remove();
    
    res.status(200).json({ 
      success: true,
      message: 'Paper deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = { getPapers, uploadPaper, downloadPaper, deletePaper };
