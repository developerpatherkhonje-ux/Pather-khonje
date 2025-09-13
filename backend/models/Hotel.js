const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    minlength: [2, 'Hotel name must be at least 2 characters'],
    maxlength: [200, 'Hotel name cannot exceed 200 characters']
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: [true, 'Place ID is required']
  },
  description: {
    type: String,
    required: [true, 'Hotel description is required'],
    trim: true,
    minlength: [5, 'Description must be at least 5 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    trim: true,
    default: undefined
  }],
  address: {
    type: String,
    required: [true, 'Hotel address is required'],
    trim: true,
    minlength: [3, 'Address must be at least 3 characters'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    default: 4.0,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviews: {
    type: Number,
    default: 0,
    min: [0, 'Reviews count cannot be negative']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  checkIn: {
    type: String,
    default: '2:00 PM',
    trim: true
  },
  checkOut: {
    type: String,
    default: '11:00 AM',
    trim: true
  },
  priceRange: {
    type: String,
    required: [true, 'Price range is required'],
    trim: true
  },
  roomTypes: [{
    type: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    features: [{
      type: String,
      trim: true
    }]
  }],
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

// Indexes
hotelSchema.index({ placeId: 1 });
hotelSchema.index({ name: 1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ createdAt: -1 });

// Static methods
hotelSchema.statics.getHotelStats = async function() {
  const totalHotels = await this.countDocuments();
  const activeHotels = await this.countDocuments({ isActive: true });
  const inactiveHotels = totalHotels - activeHotels;
  
  const avgRating = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } }
  ]);
  
  return {
    totalHotels,
    activeHotels,
    inactiveHotels,
    averageRating: avgRating[0]?.avgRating || 0
  };
};

hotelSchema.statics.findByPlaceId = async function(placeId) {
  return this.find({ placeId, isActive: true }).populate('placeId', 'name');
};

hotelSchema.statics.findByHotelId = async function(hotelId) {
  return this.findById(hotelId).populate('placeId', 'name');
};

// Instance methods
hotelSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    name: this.name,
    placeId: this.placeId,
    description: this.description,
    images: this.images,
    address: this.address,
    rating: this.rating,
    reviews: this.reviews,
    amenities: this.amenities,
    checkIn: this.checkIn,
    checkOut: this.checkOut,
    priceRange: this.priceRange,
    roomTypes: this.roomTypes,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Hotel', hotelSchema);

