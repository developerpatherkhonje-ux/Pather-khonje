const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const { protect, authorize } = require("../middleware/auth");
const logger = require("../utils/logger");

// @desc    Submit a new enquiry
// @route   POST /api/enquiries
// @access  Public
router.post("/", async (req, res) => {
  try {
    const enquiry = await Enquiry.create(req.body);

    logger.info(`New enquiry received from ${enquiry.email}`);

    res.status(201).json({
      success: true,
      data: enquiry,
      message: "Thank you for your enquiry. We will contact you soon.",
    });
  } catch (error) {
    logger.error("Error submitting enquiry", { error: error.message });
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get all enquiries
// @route   GET /api/enquiries
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    logger.error("Error fetching enquiries", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// @desc    Update enquiry status
// @route   PATCH /api/enquiries/:id
// @access  Private/Admin
router.patch("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true },
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    logger.error("Error updating enquiry status", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = router;
