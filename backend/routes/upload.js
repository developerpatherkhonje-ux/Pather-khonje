const express = require("express");
const {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
} = require("../middleware/upload");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const logger = require("../utils/logger");
const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = mongoose.mongo;
const ImageService = require("../services/imageService");

const router = express.Router();

const logUpload = async (req, resource, details) => {
  try {
    await AuditLog.logEvent({
      action: "UPLOAD",
      resource,
      userId: req.user._id,
      details,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      success: true,
    });
  } catch (error) {
    logger.warn("Upload audit log skipped", { error: error.message });
  }
};

const uploadSingleImage = async (req, res, folder, label) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const image = await ImageService.processImage(req.file, folder);
    await logUpload(req, "IMAGE", {
      public_id: image.public_id,
      url: image.url,
      originalName: req.file.originalname,
      size: req.file.size,
    });

    return res.json({
      success: true,
      message: `${label} image uploaded successfully`,
      data: image,
    });
  } catch (error) {
    logger.error(`${label} image upload error`, {
      error: error.message,
      userId: req.user._id,
    });
    if (req.file?.path) ImageService.cleanupTempFile(req.file.path);

    return res.status(500).json({
      success: false,
      message: `Failed to upload ${label.toLowerCase()} image`,
    });
  }
};

const uploadMultipleImages = async (req, res, folder, label) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      });
    }

    const { uploadedImages, errors } = await ImageService.processMultipleImages(req.files, folder);
    await logUpload(req, "IMAGES", {
      fileCount: req.files.length,
      uploadedCount: uploadedImages.length,
      errors: errors.length > 0 ? errors : undefined,
    });

    return res.json({
      success: uploadedImages.length > 0,
      message: `${uploadedImages.length} ${label.toLowerCase()} image(s) uploaded successfully`,
      data: {
        files: uploadedImages,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    logger.error(`Multiple ${label.toLowerCase()} images upload error`, {
      error: error.message,
      userId: req.user._id,
    });
    (req.files || []).forEach((file) => ImageService.cleanupTempFile(file.path));

    return res.status(500).json({
      success: false,
      message: `Failed to upload ${label.toLowerCase()} images`,
    });
  }
};

// @route   POST /api/upload/image
// @desc    Upload single image (admin only)
// @access  Admin only
router.post("/image", authenticateToken, requireAdmin, uploadSingle, async (req, res) => {
  return uploadSingleImage(req, res, "pather-khonje/places", "Place");
});

// @route   POST /api/upload/images
// @desc    Upload multiple images (admin only)
// @access  Admin only
router.post("/images", authenticateToken, requireAdmin, uploadMultiple, async (req, res) => {
  return uploadMultipleImages(req, res, "pather-khonje/places", "Place");
});

// ===== Hotels specific disk uploads (stored under uploads/hotels) =====

// @route   POST /api/upload/hotels/image
// @desc    Upload single hotel image (admin only)
// @access  Admin only
router.post("/hotels/image", authenticateToken, requireAdmin, uploadSingle, async (req, res) => {
  return uploadSingleImage(req, res, "pather-khonje/hotels", "Hotel");
});

// @route   POST /api/upload/hotels/images
// @desc    Upload multiple hotel images (admin only)
// @access  Admin only
router.post(
  "/hotels/images",
  authenticateToken,
  requireAdmin,
  uploadMultiple,
  async (req, res) => {
    return uploadMultipleImages(req, res, "pather-khonje/hotels", "Hotel");
  },
);

// ===== Packages specific disk uploads (stored under uploads/packages) =====

// @route   POST /api/upload/packages/image
// @desc    Upload single package image (admin only)
// @access  Admin only
router.post("/packages/image", authenticateToken, requireAdmin, uploadSingle, async (req, res) => {
  return uploadSingleImage(req, res, "pather-khonje/packages", "Package");
});

// @route   POST /api/upload/packages/images
// @desc    Upload multiple package images (admin only)
// @access  Admin only
router.post(
  "/packages/images",
  authenticateToken,
  requireAdmin,
  uploadMultiple,
  async (req, res) => {
    return uploadMultipleImages(req, res, "pather-khonje/packages", "Package");
  },
);
// ===== GridFS-based storage (MongoDB) =====

// @route   POST /api/upload/gridfs
// @desc    Upload single file to Mongo GridFS (admin only)
// @access  Admin only
router.post("/gridfs", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Expect a raw binary body with header 'x-filename' OR multipart already handled
    const filename = req.headers["x-filename"] || "upload_" + Date.now();
    const contentType =
      req.headers["content-type"] || "application/octet-stream";

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    uploadStream.on("error", (err) => {
      logger.error("GridFS upload error", { error: err.message });
      return res
        .status(500)
        .json({ success: false, message: "Failed to upload file" });
    });

    uploadStream.on("finish", async (file) => {
      try {
        await AuditLog.logEvent({
          action: "UPLOAD",
          resource: "IMAGE",
          userId: req.user._id,
          details: {
            gridfsId: file._id,
            filename: file.filename,
            size: file.length,
          },
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          success: true,
        });

        return res.json({
          success: true,
          message: "File uploaded to GridFS successfully",
          data: {
            id: file._id,
            filename: file.filename,
            contentType: file.contentType,
            size: file.length,
            url: `/api/upload/gridfs/${file._id}`,
          },
        });
      } catch (e) {
        logger.error("Audit log error after GridFS upload", {
          error: e.message,
        });
        return res.json({
          success: true,
          message: "File uploaded to GridFS successfully",
          data: {
            id: file._id,
            filename: file.filename,
            url: `/api/upload/gridfs/${file._id}`,
          },
        });
      }
    });

    // Pipe request body into GridFS
    req.pipe(uploadStream);
  } catch (error) {
    logger.error("GridFS upload handler error", { error: error.message });
    return res
      .status(500)
      .json({ success: false, message: "Server error during GridFS upload" });
  }
});

// @route   GET /api/upload/gridfs/:id
// @desc    Stream file from GridFS by id
// @access  Public (consider protecting if needed)
router.get("/gridfs/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    let objectId;
    try {
      objectId = new ObjectId(fileId);
    } catch (_) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file id" });
    }

    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    // Find file to set headers
    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }
    const file = files[0];
    // Allow cross-origin image loads
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (file.contentType) {
      res.setHeader("Content-Type", file.contentType);
    }
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.on("error", (err) => {
      logger.error("GridFS stream error", { error: err.message });
      res.status(500).end();
    });
    downloadStream.pipe(res);
  } catch (error) {
    logger.error("GridFS fetch handler error", { error: error.message });
    return res
      .status(500)
      .json({ success: false, message: "Server error retrieving file" });
  }
});

// Error handling middleware for upload routes
router.use(handleUploadError);

module.exports = router;
