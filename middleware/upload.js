const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dummy_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'dummy_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'dummy_api_secret'
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.originalname.split('.')[0] + '-' + uniqueSuffix;
    
    return {
      folder: 'ghanastudy',
      public_id: filename,
      allowed_formats: ['jpg', 'png', 'pdf', 'jpeg', 'gif', 'doc', 'docx']
    };
  }
});

// File filter for specific types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, GIF, PDF, and DOC files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Single file upload
const uploadSingle = upload.single('file');

// Multiple files upload
const uploadMultiple = upload.array('files', 5);

module.exports = { uploadSingle, uploadMultiple, cloudinary };
