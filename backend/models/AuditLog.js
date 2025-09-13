const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ROLE_CHANGE', 'ACCOUNT_LOCK', 'ACCOUNT_UNLOCK']
  },
  resource: {
    type: String,
    required: true,
    enum: ['USER', 'ADMIN', 'AUTH', 'SYSTEM', 'PLACE', 'HOTEL', 'IMAGE', 'IMAGES', 'UPLOAD']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  success: {
    type: Boolean,
    default: true,
    index: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance and querying
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, timestamp: -1 });

// Static method to log audit event
auditLogSchema.statics.logEvent = async function(data) {
  try {
    const auditLog = new this(data);
    await auditLog.save();
    
    logger.audit[data.action.toLowerCase()]?.(data.userId, data.targetUserId, data.details);
  } catch (error) {
    logger.error('Failed to log audit event', { error: error.message, data });
  }
};

// Static method to get user audit trail
auditLogSchema.statics.getUserAuditTrail = async function(userId, limit = 50) {
  return this.find({ userId })
    .populate('targetUserId', 'name email')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get system audit trail
auditLogSchema.statics.getSystemAuditTrail = async function(limit = 100) {
  return this.find({ resource: 'SYSTEM' })
    .populate('userId', 'name email role')
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get failed login attempts
auditLogSchema.statics.getFailedLogins = async function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    action: 'LOGIN',
    success: false,
    timestamp: { $gte: since }
  }).populate('userId', 'name email').sort({ timestamp: -1 });
};

// Static method to get suspicious activities
auditLogSchema.statics.getSuspiciousActivities = async function(hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    timestamp: { $gte: since },
    $or: [
      { action: 'ACCOUNT_LOCK' },
      { action: 'PASSWORD_CHANGE' },
      { action: 'ROLE_CHANGE' },
      { success: false }
    ]
  }).populate('userId', 'name email role').sort({ timestamp: -1 });
};

// Static method to get audit statistics
auditLogSchema.statics.getAuditStats = async function(days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const stats = await this.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        successfulEvents: { $sum: { $cond: ['$success', 1, 0] } },
        failedEvents: { $sum: { $cond: ['$success', 0, 1] } },
        uniqueUsers: { $addToSet: '$userId' },
        uniqueIPs: { $addToSet: '$ipAddress' }
      }
    },
    {
      $project: {
        totalEvents: 1,
        successfulEvents: 1,
        failedEvents: 1,
        uniqueUserCount: { $size: '$uniqueUsers' },
        uniqueIPCount: { $size: '$uniqueIPs' },
        successRate: {
          $multiply: [
            { $divide: ['$successfulEvents', '$totalEvents'] },
            100
          ]
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    uniqueUserCount: 0,
    uniqueIPCount: 0,
    successRate: 0
  };
};

// Static method to cleanup old audit logs
auditLogSchema.statics.cleanupOldLogs = async function(daysToKeep = 365) {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    timestamp: { $lt: cutoffDate }
  });
  
  logger.info('Old audit logs cleaned up', { 
    deletedCount: result.deletedCount, 
    cutoffDate 
  });
  
  return result.deletedCount;
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
