const { uploadToCloudinary, deleteImage } = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { GridFSBucket } = mongoose.mongo;

/**
 * Reusable Image Service for handling Cloudinary uploads
 * Used by both Place and Hotel models for consistent image handling
 */
class ImageService {
  static getLocalFolderFromCloudinaryFolder(folder = 'pather-khonje') {
    if (folder.includes('/hotels')) return 'hotels';
    if (folder.includes('/packages')) return 'packages';
    if (folder.includes('/gallery')) return 'gallery';
    return 'places';
  }

  static moveToLocalStorage(file, folder = 'pather-khonje') {
    const localFolder = this.getLocalFolderFromCloudinaryFolder(folder);
    const uploadDir = path.join(__dirname, '..', 'uploads', localFolder);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalPath = path.join(uploadDir, file.filename);
    if (path.resolve(file.path) !== path.resolve(finalPath)) {
      fs.renameSync(file.path, finalPath);
    }

    return {
      public_id: `local-${localFolder}-${file.filename}`,
      url: `/uploads/${localFolder}/${file.filename}`,
      relativeUrl: `/uploads/${localFolder}/${file.filename}`,
      width: null,
      height: null,
      format: path.extname(file.originalname).slice(1),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date()
    };
  }

  static uploadToGridFS(file) {
    return new Promise((resolve, reject) => {
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
        reject(new Error('MongoDB is not connected'));
        return;
      }

      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
      });
      const uploadStream = bucket.openUploadStream(file.filename, {
        contentType: file.mimetype || 'application/octet-stream',
      });
      const readStream = fs.createReadStream(file.path);

      const cleanup = () => this.cleanupTempFile(file.path);

      readStream.on('error', (error) => {
        cleanup();
        reject(error);
      });

      uploadStream.on('error', (error) => {
        cleanup();
        reject(error);
      });

      uploadStream.on('finish', (savedFile) => {
        cleanup();
        const url = `/api/upload/gridfs/${savedFile._id}`;
        resolve({
          public_id: `gridfs-${savedFile._id}`,
          url,
          relativeUrl: url,
          width: null,
          height: null,
          format: path.extname(file.originalname).slice(1),
          originalName: file.originalname,
          size: savedFile.length || file.size,
          uploadedAt: new Date()
        });
      });

      readStream.pipe(uploadStream);
    });
  }

  static async processImage(file, folder = 'pather-khonje') {
    try {
      const result = await uploadToCloudinary(file.path, folder);
      this.cleanupTempFile(file.path);

      return {
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        originalName: file.originalname,
        size: file.size,
        uploadedAt: new Date()
      };
    } catch (error) {
      console.warn('Cloudinary upload failed, using persistent GridFS storage:', error.message);
      try {
        return await this.uploadToGridFS(file);
      } catch (gridFsError) {
        console.warn('GridFS upload failed, using local storage:', gridFsError.message);
        return this.moveToLocalStorage(file, folder);
      }
    }
  }

  static async deleteImage(publicId) {
    if (!publicId) return;
    if (publicId.startsWith('gridfs-')) {
      if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) return;
      const id = publicId.replace('gridfs-', '');
      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
      });
      await bucket.delete(new mongoose.Types.ObjectId(id));
      return;
    }
    if (publicId.startsWith('local-')) {
      const [, localFolder, ...fileParts] = publicId.split('-');
      const fileName = fileParts.join('-');
      const localPath = path.join(__dirname, '..', 'uploads', localFolder, fileName);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      return;
    }

    await deleteImage(publicId);
  }

  /**
   * Process and upload multiple images to Cloudinary
   * @param {Array} files - Array of multer file objects
   * @param {string} folder - Cloudinary folder path
   * @returns {Object} - Result object with uploaded images and errors
   */
  static async processMultipleImages(files, folder = 'pather-khonje') {
    const uploadedImages = [];
    const errors = [];

    if (!files || files.length === 0) {
      return { uploadedImages, errors: [{ error: 'No files provided' }] };
    }

    // Process each uploaded file
    for (const file of files) {
      try {
        console.log('Processing file:', file.originalname, 'Size:', file.size, 'Path:', file.path);
        
        const imageData = await this.processImage(file, folder);
        console.log('Image upload successful:', imageData.public_id);
        uploadedImages.push(imageData);
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', file.originalname, error.message);
        errors.push({ file: file.originalname, error: error.message });
        
        this.cleanupTempFile(file.path);
      }
    }

    return { uploadedImages, errors };
  }

  /**
   * Process a single image upload to Cloudinary
   * @param {Object} file - Multer file object
   * @param {string} folder - Cloudinary folder path
   * @returns {Object} - Cloudinary upload result
   */
  static async processSingleImage(file, folder = 'pather-khonje') {
    try {
      console.log('Processing single file:', file.originalname, 'Size:', file.size, 'Path:', file.path);
      
      const imageData = await this.processImage(file, folder);
      console.log('Image upload successful:', imageData.public_id);
      return imageData;
    } catch (error) {
      console.error('Error uploading single file to Cloudinary:', file.originalname, error.message);
      
      // Clean up temporary file even on error
      this.cleanupTempFile(file.path);
      
      throw error;
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Object} - Deletion result
   */
  static async deleteCloudinaryImage(publicId) {
    try {
      const result = await this.deleteImage(publicId);
      console.log('Image deleted:', publicId);
      return result;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', publicId, error.message);
      throw error;
    }
  }

  /**
   * Normalize image data from various formats to Cloudinary object
   * @param {Array|string|Object} images - Images in various formats
   * @returns {Array} - Normalized array of image objects
   */
  static normalizeImages(images) {
    if (!images) return [];
    
    // Convert to array if not already
    const imageArray = Array.isArray(images) ? images : [images];
    
    return imageArray
      .map((img) => {
        // If it's already a proper Cloudinary object
        if (img && typeof img === 'object' && img.public_id && img.url) {
          return img;
        }
        
        // If it's a string URL, convert to basic object
        if (typeof img === 'string' && img.trim()) {
          const url = img.trim();
          const publicId = this.extractCloudinaryPublicId(url);
          if (publicId || url.startsWith('/uploads/') || url.startsWith('/api/upload/gridfs/')) {
            return {
              url,
              public_id: publicId || `local-${path.basename(url)}`,
              uploadedAt: new Date()
            };
          }
          return null;
        }
        
        // If it's an object with url property
        if (img && typeof img === 'object' && (img.url || img.secure_url)) {
          return {
            url: img.url || img.secure_url,
            public_id: img.public_id || null,
            width: img.width,
            height: img.height,
            format: img.format,
            uploadedAt: img.uploadedAt || new Date()
          };
        }
        
        return null;
      })
      .filter(Boolean); // Remove null values
  }

  /**
   * Get the primary image URL from images array
   * @param {Array} images - Array of image objects
   * @returns {string} - Primary image URL or empty string
   */
  static getPrimaryImageUrl(images) {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return '';
    }
    
    return images[0].url || '';
  }

  /**
   * Clean up temporary file
   * @param {string} filePath - Path to temporary file
   */
  static cleanupTempFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Temporary file cleaned up:', filePath);
      }
    } catch (unlinkError) {
      console.error('Error cleaning up temporary file:', filePath, unlinkError.message);
    }
  }

  /**
   * Validate image format and size
   * @param {Object} file - Multer file object
   * @returns {Object} - Validation result
   */
  static validateImage(file) {
    const errors = [];
    
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      errors.push('File must be an image');
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('File size must be less than 5MB');
    }
    
    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!supportedFormats.includes(file.mimetype)) {
      errors.push('Supported formats: JPEG, PNG, GIF, WebP');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Extract Cloudinary public_id from a Cloudinary delivery URL
   * Example: https://res.cloudinary.com/demo/image/upload/v1699999999/folder/name.jpg
   * Returns: folder/name
   */
  static extractCloudinaryPublicId(urlStr) {
    try {
      const url = new URL(urlStr);
      if (!url.hostname.includes('res.cloudinary.com')) return null;

      // Pathname example: /<cloud_name>/image/upload/v1699999999/folder/name.jpg
      const parts = url.pathname.split('/').filter(Boolean);
      // Find the 'upload' segment
      const uploadIdx = parts.findIndex(p => p === 'upload');
      if (uploadIdx === -1 || uploadIdx + 1 >= parts.length) return null;

      // The segments after 'upload' may include a version (v123456)
      let afterUpload = parts.slice(uploadIdx + 1);
      if (afterUpload[0] && /^v\d+/.test(afterUpload[0])) {
        afterUpload = afterUpload.slice(1);
      }
      if (afterUpload.length === 0) return null;

      // Remove file extension from last segment
      const last = afterUpload[afterUpload.length - 1];
      const withoutExt = last.replace(/\.[^/.]+$/, '');
      afterUpload[afterUpload.length - 1] = withoutExt;

      return afterUpload.join('/');
    } catch (_) {
      return null;
    }
  }
}

module.exports = ImageService;
