const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isRevoked: {
    type: Boolean,
    default: false,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ token: 1, isRevoked: 1 });

// Static method to create refresh token
refreshTokenSchema.statics.createToken = async function(userId, email, ipAddress, userAgent) {
  const SecurityUtils = require('../utils/security');
  const token = SecurityUtils.generateSecureToken(64);
  
  const refreshToken = new this({
    token,
    userId,
    email,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    ipAddress,
    userAgent
  });
  
  await refreshToken.save();
  
  logger.security.tokenRefresh(userId, email);
  
  return token;
};

// Static method to verify refresh token
refreshTokenSchema.statics.verifyToken = async function(token, ipAddress, userAgent) {
  const refreshToken = await this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');
  
  if (!refreshToken) {
    return null;
  }
  
  // Update last used timestamp
  refreshToken.lastUsed = new Date();
  await refreshToken.save();
  
  // Check for suspicious activity (different IP or user agent)
  if (refreshToken.ipAddress !== ipAddress || refreshToken.userAgent !== userAgent) {
    logger.security.suspiciousActivity(refreshToken.userId, 'Token used from different device', ipAddress, {
      originalIP: refreshToken.ipAddress,
      originalUserAgent: refreshToken.userAgent,
      newIP: ipAddress,
      newUserAgent: userAgent
    });
  }
  
  return refreshToken;
};

// Static method to revoke token
refreshTokenSchema.statics.revokeToken = async function(token) {
  const result = await this.updateOne(
    { token },
    { isRevoked: true }
  );
  
  if (result.modifiedCount > 0) {
    logger.info('Refresh token revoked', { token });
  }
  
  return result.modifiedCount > 0;
};

// Static method to revoke all user tokens
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId) {
  const result = await this.updateMany(
    { userId, isRevoked: false },
    { isRevoked: true }
  );
  
  logger.info('All refresh tokens revoked for user', { userId, count: result.modifiedCount });
  
  return result.modifiedCount;
};

// Static method to cleanup expired tokens
refreshTokenSchema.statics.cleanupExpiredTokens = async function() {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isRevoked: true, updatedAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } // Delete revoked tokens older than 7 days
    ]
  });
  
  logger.info('Expired refresh tokens cleaned up', { count: result.deletedCount });
  
  return result.deletedCount;
};

// Static method to get user active sessions
refreshTokenSchema.statics.getUserActiveSessions = async function(userId) {
  return this.find({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() }
  }).select('ipAddress userAgent createdAt lastUsed').sort({ lastUsed: -1 });
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
