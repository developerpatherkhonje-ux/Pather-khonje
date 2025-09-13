// Serverless-compatible upload middleware for Vercel deployment
// Note: File uploads in serverless environments are limited by Vercel's constraints
// This middleware provides basic validation but file storage should be handled differently

const multer = require('multer');

// Memory storage for serverless (files are stored in memory, not disk)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for serverless
    files: 5 // Maximum 5 files per request
  }
});

// Upload middleware for different types
const uploadPlaces = upload.array('images', 5);
const uploadHotels = upload.array('images', 5);
const uploadPackages = upload.array('images', 5);
const uploadSingle = upload.single('image');

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload.'
      });
    }
  }
  
  if (error.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Helper function to process uploaded files
const processUploadedFiles = (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  return files.map(file => ({
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    buffer: file.buffer,
    // In a real serverless environment, you would upload to cloud storage here
    // For now, we'll return a placeholder URL
    url: `https://placeholder.com/${file.originalname}`,
    uploadedAt: new Date().toISOString()
  }));
};

// Helper function to process single uploaded file
const processSingleFile = (file) => {
  if (!file) {
    return null;
  }

  return {
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    buffer: file.buffer,
    url: `https://placeholder.com/${file.originalname}`,
    uploadedAt: new Date().toISOString()
  };
};

module.exports = {
  uploadPlaces,
  uploadHotels,
  uploadPackages,
  uploadSingle,
  handleUploadError,
  processUploadedFiles,
  processSingleFile
};

