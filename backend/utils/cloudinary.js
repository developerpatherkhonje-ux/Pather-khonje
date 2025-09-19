const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUD_NAME || 'demo',
  api_key: process.env.CLOUD_API_KEY || 'demo',
  api_secret: process.env.CLOUD_API_SECRET || 'demo',
};

// Check if Cloudinary is properly configured
const isCloudinaryConfigured = () => {
  // Check for CLOUDINARY_URL first (preferred method)
  if (process.env.CLOUDINARY_URL) {
    return true;
  }
  
  // Fallback to individual variables
  return cloudinaryConfig.cloud_name !== 'demo' && 
         cloudinaryConfig.api_key !== 'demo' && 
         cloudinaryConfig.api_secret !== 'demo';
};

// Configure Cloudinary with both individual variables and CLOUDINARY_URL
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else {
  cloudinary.config(cloudinaryConfig);
}

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Temporary upload directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Upload single image
const uploadSingle = upload.single('image');

// Upload multiple images
const uploadMultiple = upload.array('images', 10); // Max 10 images

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'pather-khonje') => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured. Please set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET in your .env file');
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      use_filename: true,
      unique_filename: true,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured. Please set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET in your .env file');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Delete multiple images from Cloudinary
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured. Please set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET in your .env file');
    }

    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Error deleting multiple images from Cloudinary:', error);
    throw error;
  }
};

// Get image URL with transformations
const getImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
};

// Upload image directly from buffer (for API uploads)
const uploadFromBuffer = async (buffer, folder = 'pather-khonje') => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured. Please set CLOUD_NAME, CLOUD_API_KEY, and CLOUD_API_SECRET in your .env file');
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    ).end(buffer);
    return result;
  } catch (error) {
    console.error('Error uploading image from buffer to Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  uploadFromBuffer,
  deleteImage,
  deleteMultipleImages,
  getImageUrl,
  isCloudinaryConfigured,
};
