const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
      index: true,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        type: String, // Gallery images
      },
    ],
    hotels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
      },
    ],

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [3, "Description must be at least 3 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
      maxlength: [100, "Duration cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      trim: true,
      lowercase: true,
      default: "general",
      index: true,
    },
    bestTime: {
      type: String,
      trim: true,
      default: "",
    },
    groupSize: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

packageSchema.index({ createdAt: -1 });

packageSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    image: this.image,
    description: this.description,
    duration: this.duration,
    price: this.price,
    rating: this.rating,
    highlights: this.highlights,
    category: this.category,
    bestTime: this.bestTime,
    groupSize: this.groupSize,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Package", packageSchema);
