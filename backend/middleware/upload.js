const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = {
  places: path.join(__dirname, '..', 'uploads', 'places'),
  hotels: path.join(__dirname, '..', 'uploads', 'hotels'),
  packages: path.join(__dirname, '..', 'uploads', 'packages'),
  gallery: path.join(__dirname, '..', 'uploads', 'gallery')
};

Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDirs.places; // default
    const routeContext = `${req.baseUrl || ''}${req.originalUrl || ''}${req.route?.path || ''}`;
    
    if (routeContext.includes('hotels')) {
      uploadPath = uploadDirs.hotels;
    } else if (routeContext.includes('packages')) {
      uploadPath = uploadDirs.packages;
    } else if (routeContext.includes('gallery')) {
      uploadPath = uploadDirs.gallery;
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const routeContext = `${req.baseUrl || ''}${req.originalUrl || ''}${req.route?.path || ''}`;
  const isGalleryUpload = routeContext.includes('gallery');
  const allowedTypes = isGalleryUpload
    ? /jpeg|jpg|png|gif|webp|mp4|mov|webm|m4v/
    : /jpeg|jpg|png|gif|webp/;
  const allowedMime = isGalleryUpload
    ? (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/'))
    : file.mimetype.startsWith('image/');
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (allowedMime && extname) {
    return cb(null, true);
  } else {
    cb(new Error(isGalleryUpload
      ? 'Only image/video files (JPEG, PNG, GIF, WebP, MP4, MOV, WebM) are allowed!'
      : 'Only image files (JPEG, JPG, PNG, GIF, WebP) are allowed!'
    ));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // allow gallery videos while keeping uploads bounded
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single image upload
const uploadSingle = upload.single('image');

// Middleware for multiple images upload
const uploadMultiple = upload.array('images', 5);

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
  
  if (error.message.includes('Only image') || error.message.includes('Only image/video')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  uploadDirs
};
