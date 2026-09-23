const express = require("express");
const mongoose = require("mongoose");
const slugify = require("slugify"); 
const { body, validationResult } = require("express-validator");
const Hotel = require("../models/Hotel");
const Place = require("../models/Place");
const {
  authenticateToken,
  requireAdmin,
  requireAdminOrManager,
  sanitizeInput,
} = require("../middleware/auth");
const logger = require("../utils/logger");
const AuditLog = require("../models/AuditLog");
const {
  uploadMultiple,
} = require("../utils/cloudinary");
const ImageService = require("../services/imageService");

const router = express.Router();

// Apply sanitization middleware to all routes
router.use(sanitizeInput);

// Validation rules
const hotelValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Hotel name must be between 2 and 200 characters"),
  body("placeId").isMongoId().withMessage("Valid place ID is required"),
  body("description")
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage("Description must be between 3 and 2000 characters"),
  body("image")
    .optional()
    .custom((value) => {
      return typeof value === "string"; // Allow string, empty or url
    }),
  body("cardImage")
    .optional()
    .custom((value) => {
      return typeof value === "string";
    }),
  body("images").optional().isArray().withMessage("Images must be an array"),
  body("images.*")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (typeof value === "string") {
        return (
          value.startsWith("http://") ||
          value.startsWith("https://") ||
          value.startsWith("/uploads/") ||
          value.startsWith("/api/upload/gridfs/")
        );
      }
      if (typeof value === "object" && value !== null) {
        return value.url && value.public_id;
      }
      return false;
    })
    .withMessage(
      "Each image must be a valid URL, uploaded path, or Cloudinary object",
    ),
  body("address")
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage("Address must be between 3 and 500 characters"),
  body("rating")
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("amenities")
    .optional()
    .isArray()
    .withMessage("Amenities must be an array"),
  body("priceRange")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Price range is required"),
  body("roomTypes")
    .optional()
    .isArray()
    .withMessage("Room types must be an array"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// @route   GET /api/hotels
// @desc    Get all hotels (public)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let hotels = await Hotel.find({ isActive: true })
      .populate("placeId", "name")
      .select(
        "name slug placeId description image cardImage images address rating reviews amenities priceRange createdAt",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // 🔴 SUPER-HEAL: Forces all hotel slugs to be perfectly clean and removes old random letters
    let dataFixed = false;
    for (let hotel of hotels) {
      const cleanSlug = slugify(hotel.name, { lower: true, strict: true });
      if (hotel.slug !== cleanSlug) {
        hotel.slug = cleanSlug; 
        await hotel.save();
        dataFixed = true;
      }
    }

    // If we scrubbed any random letters, re-fetch the clean data
    if (dataFixed) {
      hotels = await Hotel.find({ isActive: true })
        .populate("placeId", "name")
        .select(
          "name slug placeId description image cardImage images address rating reviews amenities priceRange createdAt",
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const total = await Hotel.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        hotels: hotels.map((hotel) => {
          const h = hotel.getPublicProfile ? hotel.getPublicProfile() : hotel;
          if (!h.cardImage) {
            h.cardImage =
              h.image ||
              (h.images && h.images.length > 0 ? h.images[0].url : "");
          }
          return h;
        }),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error("Get hotels error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to get hotels",
    });
  }
});

// @route   GET /api/hotels/:idOrSlug
// @desc    Get hotel by ID or SEO slug
// @access  Public
router.get("/:idOrSlug", async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    let hotel;

    if (mongoose.Types.ObjectId.isValid(param)) {
      hotel = await Hotel.findById(param).populate("placeId", "name");
    } else {
      hotel = await Hotel.findOne({ slug: param, isActive: true }).populate("placeId", "name");
    }

    if (!hotel || !hotel.isActive) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    res.json({
      success: true,
      data: {
        hotel: hotel.getPublicProfile ? hotel.getPublicProfile() : hotel,
      },
    });
  } catch (error) {
    logger.error("Get hotel error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to get hotel",
    });
  }
});

// @route   GET /api/hotels/place/:placeIdOrSlug
// @desc    Get hotels for a specific place
// @access  Public
router.get("/place/:placeIdOrSlug", async (req, res) => {
  try {
    const param = req.params.placeIdOrSlug;
    let place;

    if (mongoose.Types.ObjectId.isValid(param)) {
      place = await Place.findById(param);
    } else {
      place = await Place.findOne({ slug: param, isActive: true });
    }

    if (!place || !place.isActive) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    let hotels = await Hotel.findByPlaceId(place._id);

    // 🔴 SUPER-HEAL: Ensure hotels inside a place also get perfectly clean slugs
    let dataFixed = false;
    for (let hotel of hotels) {
      const cleanSlug = slugify(hotel.name, { lower: true, strict: true });
      if (hotel.slug !== cleanSlug) {
        hotel.slug = cleanSlug;
        await hotel.save();
        dataFixed = true;
      }
    }

    if (dataFixed) {
      hotels = await Hotel.findByPlaceId(place._id);
    }

    res.json({
      success: true,
      data: {
        place: place.getPublicProfile ? place.getPublicProfile() : place,
        hotels: hotels.map((hotel) => hotel.getPublicProfile ? hotel.getPublicProfile() : hotel),
      },
    });
  } catch (error) {
    logger.error("Get place hotels error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to get place hotels",
    });
  }
});

// @route   POST /api/hotels
// @desc    Create new hotel (admin only)
// @access  Admin only
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  hotelValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        name,
        placeId,
        description,
        images,
        cardImage,
        address,
        rating,
        amenities,
        priceRange,
        roomTypes,
      } = req.body;
      const adminId = req.user._id;

      const place = await Place.findById(placeId);
      if (!place || !place.isActive) {
        return res.status(404).json({
          success: false,
          message: "Place not found",
        });
      }

      const existingHotel = await Hotel.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        placeId,
      });
      if (existingHotel) {
        return res.status(400).json({
          success: false,
          message: "Hotel with this name already exists in this place",
        });
      }

      const normalizedImageObjects = ImageService.normalizeImages(
        images,
      ).filter((img) => img && img.url && img.public_id);

      const primaryImageUrl =
        typeof req.body.image === "string" && req.body.image.trim()
          ? req.body.image.trim()
          : ImageService.getPrimaryImageUrl(normalizedImageObjects);

      const finalCardImage =
        typeof cardImage === "string" && cardImage.trim()
          ? cardImage.trim()
          : primaryImageUrl;

      const hotel = new Hotel({
        name,
        placeId,
        description:
          description && String(description).trim().length > 0
            ? description
            : "A beautiful hotel offering excellent accommodation and services",
        image: primaryImageUrl || "",
        cardImage: finalCardImage || "",
        images: normalizedImageObjects,
        address,
        rating: rating || 4.0,
        amenities: amenities || [],
        priceRange,
        roomTypes: roomTypes || [],
        metadata: {
          source: "api",
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          createdBy: adminId,
        },
      });

      try {
        await hotel.save();
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
          }));
          return res
            .status(400)
            .json({ success: false, message: "Validation failed", errors });
        }
        throw err;
      }

      await place.updateHotelsCount();

      await AuditLog.logEvent({
        action: "CREATE",
        resource: "HOTEL",
        userId: adminId,
        details: {
          hotelName: name,
          hotelId: hotel._id,
          placeId,
          placeName: place.name,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        success: true,
      });

      res.status(201).json({
        success: true,
        message: "Hotel created successfully",
        data: {
          hotel: hotel.getPublicProfile(),
        },
      });
    } catch (error) {
      logger.error("Create hotel error", {
        error: error.message,
        userId: req.user?._id,
      });

      res.status(500).json({
        success: false,
        message: "Failed to create hotel",
      });
    }
  }
);

// @route   PUT /api/hotels/:id
// @desc    Update hotel (admin only)
// @access  Admin only
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  hotelValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const hotelId = req.params.id;
      const updates = req.body;
      const adminId = req.user._id;

      const existingHotel = await Hotel.findById(hotelId);
      if (!existingHotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      if (
        updates.placeId &&
        updates.placeId !== existingHotel.placeId.toString()
      ) {
        const place = await Place.findById(updates.placeId);
        if (!place || !place.isActive) {
          return res.status(404).json({
            success: false,
            message: "Place not found",
          });
        }
      }

      if (updates.name && updates.name !== existingHotel.name) {
        const nameExists = await Hotel.findOne({
          name: { $regex: new RegExp(`^${updates.name}$`, "i") },
          placeId: updates.placeId || existingHotel.placeId,
          _id: { $ne: hotelId },
        });
        if (nameExists) {
          return res.status(400).json({
            success: false,
            message: "Hotel with this name already exists in this place",
          });
        }
        updates.slug = slugify(updates.name, { lower: true, strict: true });
      } else if (!existingHotel.slug) {
        updates.slug = slugify(existingHotel.name, { lower: true, strict: true });
      }

      const hotel = await Hotel.findByIdAndUpdate(
        hotelId,
        {
          ...updates,
          "metadata.lastModifiedBy": adminId,
        },
        { new: true, runValidators: true },
      );

      if (
        updates.placeId &&
        updates.placeId !== existingHotel.placeId.toString()
      ) {
        const oldPlace = await Place.findById(existingHotel.placeId);
        const newPlace = await Place.findById(updates.placeId);

        if (oldPlace) await oldPlace.updateHotelsCount();
        if (newPlace) await newPlace.updateHotelsCount();
      }

      await AuditLog.logEvent({
        action: "UPDATE",
        resource: "HOTEL",
        userId: adminId,
        targetHotelId: hotelId,
        details: {
          updatedFields: Object.keys(updates),
          changes: updates,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        success: true,
      });

      res.json({
        success: true,
        message: "Hotel updated successfully",
        data: {
          hotel: hotel.getPublicProfile(),
        },
      });
    } catch (error) {
      logger.error("Update hotel error", {
        error: error.message,
        userId: req.user._id,
      });

      res.status(500).json({
        success: false,
        message: "Failed to update hotel",
      });
    }
  }
);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel (admin only)
// @access  Admin only
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const hotelId = req.params.id;
    const adminId = req.user._id;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    const place = await Place.findById(hotel.placeId);
    await Hotel.findByIdAndDelete(hotelId);

    if (place) {
      await place.updateHotelsCount();
    }

    await AuditLog.logEvent({
      action: "DELETE",
      resource: "HOTEL",
      userId: adminId,
      targetHotelId: hotelId,
      details: {
        deletedHotel: {
          name: hotel.name,
          placeId: hotel.placeId,
        },
      },
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
      success: true,
    });

    res.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    logger.error("Delete hotel error", {
      error: error.message,
      userId: req.user._id,
    });

    res.status(500).json({
      success: false,
      message: "Failed to delete hotel",
    });
  }
});

// @route   GET /api/hotels/admin/stats
// @desc    Get hotels statistics (admin only)
// @access  Admin only
router.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const stats = await Hotel.getHotelStats();

      await AuditLog.logEvent({
        action: "READ",
        resource: "HOTEL",
        userId: req.user._id,
        details: { action: "get_hotel_stats" },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        success: true,
      });

      res.json({
        success: true,
        data: {
          stats,
        },
      });
    } catch (error) {
      logger.error("Get hotel stats error", {
        error: error.message,
        userId: req.user._id,
      });

      res.status(500).json({
        success: false,
        message: "Failed to get hotel statistics",
      });
    }
  }
);

// @route   POST /api/hotels/:id/images
// @desc    Upload images for a hotel (admin only)
// @access  Admin only
router.post(
  "/:id/images",
  authenticateToken,
  requireAdmin,
  (req, res, next) => {
    uploadMultiple(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        return res
          .status(400)
          .json({
            success: false,
            message: "File upload error: " + err.message,
          });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const hotelId = req.params.id;
      const adminId = req.user._id;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No images provided",
        });
      }

      const { uploadedImages, errors } =
        await ImageService.processMultipleImages(
          req.files,
          "pather-khonje/hotels",
        );

      if (uploadedImages.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload any images",
          errors,
        });
      }

      hotel.images = [...(hotel.images || []), ...uploadedImages];
      if (!hotel.image && hotel.images.length > 0) {
        hotel.image = hotel.images[0].url;
      }
      await hotel.save();

      res.json({
        success: true,
        message: `${uploadedImages.length} image(s) uploaded successfully`,
        data: {
          uploadedImages,
          errors: errors.length > 0 ? errors : undefined,
        },
      });
    } catch (error) {
      console.error("Upload hotel images error:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to upload images: " + error.message,
      });
    }
  }
);

// @route   DELETE /api/hotels/:id/images/:imageId
// @desc    Delete a specific image from a hotel (admin only)
// @access  Admin only
router.delete(
  "/:id/images/:imageId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const hotelId = req.params.id;
      const imageId = req.params.imageId;
      const adminId = req.user._id;

      const hotel = await Hotel.findById(hotelId);
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: "Hotel not found",
        });
      }

      const imageIndex = hotel.images.findIndex(
        (img) => img.public_id === imageId,
      );
      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      try {
        await ImageService.deleteImage(imageId);
      } catch (deleteError) {
        console.error("Error deleting image file:", deleteError);
      }

      hotel.images.splice(imageIndex, 1);
      await hotel.save();

      await AuditLog.logEvent({
        action: "UPDATE",
        resource: "HOTEL",
        userId: adminId,
        targetHotelId: hotelId,
        details: {
          action: "delete_image",
          deletedImageId: imageId,
        },
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        success: true,
      });

      res.json({
        success: true,
        message: "Image deleted successfully",
      });
    } catch (error) {
      logger.error("Delete hotel image error", {
        error: error.message,
        userId: req.user._id,
      });

      res.status(500).json({
        success: false,
        message: "Failed to delete image",
      });
    }
  }
);

module.exports = router;
