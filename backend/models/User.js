const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const logger = require('../utils/logger');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z\s]+$/.test(v);
      },
      message: 'Name can only contain letters and spaces'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [config.SECURITY.passwordMinLength, `Password must be at least ${config.SECURITY.passwordMinLength} characters`],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user',
    index: true
  },
  designation: {
    type: String,
    trim: true,
    default: 'Customer',
    maxlength: [50, 'Designation cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'],
    sparse: true // Allows multiple null values
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street address cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [10, 'ZIP code cannot exceed 10 characters']
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters']
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'bn']
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  security: {
    lastPasswordChange: {
      type: Date,
      default: Date.now
    }
  },
  metadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api'],
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.security.twoFactorSecret;
      delete ret.security.apiKey;
      delete ret.security.passwordHistory;
      return ret;
    }
  }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ 'address.state': 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for account age
userSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with configured rounds
    const salt = await bcrypt.genSalt(config.BCRYPT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Update last password change
    this.security.lastPasswordChange = new Date();
    
    next();
  } catch (error) {
    logger.error('Password hashing error', { error: error.message, userId: this._id });
    next(error);
  }
});

// Pre-save middleware for login attempt tracking
userSchema.pre('save', function(next) {
  // Reset login attempts if account is unlocked
  if (this.isModified('lockUntil') && !this.isLocked) {
    this.loginAttempts = 0;
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    
    if (isMatch) {
      // Reset login attempts on successful login
      if (this.loginAttempts > 0) {
        this.loginAttempts = 0;
        this.lockUntil = null;
        await this.save();
      }
    } else {
      // Increment login attempts on failed login
      await this.incLoginAttempts();
    }
    
    return isMatch;
  } catch (error) {
    logger.error('Password comparison error', { error: error.message, userId: this._id });
    throw error;
  }
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= config.SECURITY.maxLoginAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + config.SECURITY.lockoutTimeMs };
  }
  
  return this.updateOne(updates);
};

// Instance method to get user data without sensitive information
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.security;
  delete userObject.metadata;
  return userObject;
};

// Instance method to generate API key
userSchema.methods.generateAPIKey = function() {
  const SecurityUtils = require('../utils/security');
  this.security.apiKey = SecurityUtils.generateAPIKey();
  return this.security.apiKey;
};

// Instance method to check if password was used recently
userSchema.methods.isPasswordRecentlyUsed = function(newPassword) {
  return false; // Simplified - no password history tracking
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActiveUsers = function() {
  return this.find({ isActive: true });
};

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

// Static method to get user statistics
userSchema.statics.getUserStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
        adminUsers: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
        managerUsers: { $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] } },
        regularUsers: { $sum: { $cond: [{ $eq: ['$role', 'user'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    managerUsers: 0,
    regularUsers: 0
  };
};

// Static method to cleanup expired locks
userSchema.statics.cleanupExpiredLocks = function() {
  return this.updateMany(
    { lockUntil: { $lt: new Date() } },
    { $unset: { lockUntil: 1 }, $set: { loginAttempts: 0 } }
  );
};

// Post-save middleware for logging
userSchema.post('save', function(doc) {
  logger.info('User saved', { 
    userId: doc._id, 
    email: doc.email, 
    role: doc.role,
    isNew: doc.isNew 
  });
});

// Post-remove middleware for logging
userSchema.post('remove', function(doc) {
  logger.info('User deleted', { 
    userId: doc._id, 
    email: doc.email, 
    role: doc.role 
  });
});

module.exports = mongoose.model('User', userSchema);