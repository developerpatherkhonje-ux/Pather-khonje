const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true,
    unique: true,
    minlength: [2, 'Place name must be at least 2 characters'],
    maxlength: [100, 'Place name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Place description is required'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    required: [true, 'Place image is required'],
    trim: true
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  hotelsCount: {
    type: Number,
    default: 0,
    min: [0, 'Hotels count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    source: {
      type: String,
      enum: ['api', 'system'],
      default: 'api'
    },
    ipAddress: String,
    userAgent: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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

// Virtual for hotels relationship
placeSchema.virtual('hotels', {
  ref: 'Hotel',
  localField: '_id',
  foreignField: 'placeId'
});

// Indexes
placeSchema.index({ name: 1 });
placeSchema.index({ isActive: 1 });
placeSchema.index({ rating: -1 });
placeSchema.index({ createdAt: -1 });

// Static methods
placeSchema.statics.getPlaceStats = async function() {
  const totalPlaces = await this.countDocuments();
  const activePlaces = await this.countDocuments({ isActive: true });
  const inactivePlaces = totalPlaces - activePlaces;
  
  const avgRating = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  
  return {
    totalPlaces,
    activePlaces,
    inactivePlaces,
    averageRating: avgRating[0]?.avgRating || 0
  };
};

placeSchema.statics.findByPlaceId = async function(placeId) {
  return this.findById(placeId).populate('hotels');
};

// Instance methods
placeSchema.methods.updateHotelsCount = async function() {
  const Hotel = mongoose.model('Hotel');
  const count = await Hotel.countDocuments({ placeId: this._id, isActive: true });
  this.hotelsCount = count;
  await this.save();
  return count;
};

placeSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    image: this.image,
    rating: this.rating,
    hotelsCount: this.hotelsCount,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Place', placeSchema);

