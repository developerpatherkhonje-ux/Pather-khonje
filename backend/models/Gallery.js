const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Gallery description is required'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['destinations', 'hotels', 'activities', 'food'],
      message: 'Category must be one of: destinations, hotels, activities, food'
    }
  },
  image: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    width: Number,
    height: Number,
    format: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0,
    min: [0, 'Display order cannot be negative']
  },
  metadata: {
    source: {
      type: String,
      enum: ['admin', 'system'],
      default: 'admin'
    },
    ipAddress: String,
    userAgent: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
gallerySchema.index({ category: 1, isActive: 1 });
gallerySchema.index({ displayOrder: 1 });
gallerySchema.index({ createdAt: -1 });

// Virtual for category display name
gallerySchema.virtual('categoryName').get(function() {
  const categoryMap = {
    'destinations': 'Destinations',
    'hotels': 'Hotels', 
    'activities': 'Activities',
    'food': 'Cuisine'
  };
  return categoryMap[this.category] || this.category;
});

// Pre-save middleware to update lastModifiedBy
gallerySchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.metadata.lastModifiedBy = this.metadata.createdBy;
  }
  next();
});

module.exports = mongoose.model('Gallery', gallerySchema);
