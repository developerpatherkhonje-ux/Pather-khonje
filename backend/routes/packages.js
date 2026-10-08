const express = require("express");
const mongoose = require("mongoose"); // ADDED THIS
const { body, validationResult } = require("express-validator");
const Package = require("../models/Package");
const {
  authenticateToken,
  requireAdmin,
  sanitizeInput,
} = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

router.use(sanitizeInput);

const pkgValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Name must be 2-200 characters"),
  body("image").optional().isString(),
  body("images")
    .optional()
    .isArray()
    .withMessage("Images must be an array of strings"),
  body("images.*").optional().isString(),
  body("hotels")
    .optional()
    .isArray()
    .withMessage("Hotels must be an array of IDs"),
  body("description")
    .trim()
    .isLength({ min: 3, max: 2000 })
    .withMessage("Description 3-2000 chars"),
  body("duration")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Duration is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("rating")
    .optional({ nullable: true })
    .isFloat()
    .withMessage("Rating must be a number"),
  body("highlights")
    .optional()
    .isArray()
    .withMessage("Highlights must be array"),
  body("itinerary")
    .optional()
    .isArray()
    .withMessage("Itinerary must be an array"),
  body("itinerary.*.day").optional().isString(),
  body("itinerary.*.title").optional().isString(),
  body("itinerary.*.description").optional().isString(),
  body("inclusions")
    .optional()
    .isArray()
    .withMessage("Inclusions must be an array"),
  body("inclusions.*").optional().isString(),
  body("exclusions")
    .optional()
    .isArray()
    .withMessage("Exclusions must be an array"),
  body("exclusions.*").optional().isString(),
  body("category").optional().isString(),
  body("route").optional().isString(),
  body("bestTime").optional().isString(),
  body("groupSize").optional().isString(),
  body("isActive").optional().isBoolean().withMessage("Active status must be true or false"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors
        .array()
        .map((err) => ({ field: err.path, message: err.msg })),
    });
  }
  next();
};

const normalizePackagePayload = (body) => {
  const payload = { ...body };
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (
    payload.rating !== undefined &&
    payload.rating !== null &&
    payload.rating !== ""
  ) {
    payload.rating = Number(payload.rating);
    if (!Number.isNaN(payload.rating)) {
      if (payload.rating > 5) payload.rating = 5;
      if (payload.rating < 1) payload.rating = 1;
    } else {
      delete payload.rating;
    }
  }

  ["highlights", "inclusions", "exclusions", "images"].forEach((field) => {
    if (Array.isArray(payload[field])) {
      payload[field] = payload[field].filter((item) => String(item || "").trim() !== "");
    }
  });

  if (Array.isArray(payload.itinerary)) {
    payload.itinerary = payload.itinerary
      .map((item, index) => ({
        day: String(item.day || `Day ${index + 1}`).trim(),
        title: String(item.title || "").trim(),
        description: String(item.description || "").trim(),
      }))
      .filter((item) => item.title || item.description);
  }

  return payload;
};

// Public: list packages
router.get("/", async (req, res) => {
  try {
    const list = await Package.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { packages: list.map((p) => p.getPublicProfile()) },
    });
  } catch (e) {
    logger.error("Get packages error", { error: e.message });
    res.status(500).json({ success: false, message: "Failed to get packages" });
  }
});

// Admin: list all packages, including inactive records
router.get("/admin/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const list = await Package.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: { packages: list.map((p) => p.getPublicProfile()) },
    });
  } catch (e) {
    logger.error("Get admin packages error", { error: e.message });
    res.status(500).json({ success: false, message: "Failed to get packages" });
  }
});

// Public: get package by id or slug
router.get("/:idOrSlug", async (req, res) => {
  try {
    const param = req.params.idOrSlug;
    let pkg;

    // Checks if the string is a valid MongoDB ID, otherwise assumes it's a slug
    if (mongoose.Types.ObjectId.isValid(param)) {
      pkg = await Package.findOne({ _id: param, isActive: true });
    } else {
      pkg = await Package.findOne({ slug: param, isActive: true });
    }

    if (!pkg) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }
    res.json({ success: true, data: { package: pkg.getPublicProfile() } });
  } catch (e) {
    logger.error("Get package by id or slug error", { error: e.message });
    res.status(500).json({ success: false, message: "Failed to get package" });
  }
});

// Admin: create package
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  pkgValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const payload = normalizePackagePayload(req.body);

      const pkg = new Package(payload);
      await pkg.save();
      res
        .status(201)
        .json({
          success: true,
          message: "Package created",
          data: { package: pkg.getPublicProfile() },
        });
    } catch (e) {
      if (e.name === "ValidationError") {
        const errors = Object.values(e.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res
          .status(400)
          .json({ success: false, message: "Validation failed", errors });
      }
      logger.error("Create package error", { error: e.message });
      res
        .status(500)
        .json({ success: false, message: "Failed to create package" });
    }
  },
);

// Admin: update package
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  pkgValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const payload = normalizePackagePayload(req.body);
      const pkg = await Package.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
      });
      if (!pkg)
        return res
          .status(404)
          .json({ success: false, message: "Package not found" });
      res.json({
        success: true,
        message: "Package updated",
        data: { package: pkg.getPublicProfile() },
      });
    } catch (e) {
      if (e.name === "ValidationError") {
        const errors = Object.values(e.errors).map((err) => ({
          field: err.path,
          message: err.message,
        }));
        return res
          .status(400)
          .json({ success: false, message: "Validation failed", errors });
      }
      logger.error("Update package error", { error: e.message });
      res
        .status(500)
        .json({ success: false, message: "Failed to update package" });
    }
  },
);

// Admin: delete package
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg)
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    res.json({ success: true, message: "Package deleted" });
  } catch (e) {
    logger.error("Delete package error", { error: e.message });
    res
      .status(500)
      .json({ success: false, message: "Failed to delete package" });
  }
});

module.exports = router;
