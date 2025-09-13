const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config/config');

// Create logs directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync(config.PATHS.logs)) {
  fs.mkdirSync(config.PATHS.logs, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Create the logger
const logger = winston.createLogger({
  level: config.LOGGING.level,
  format: logFormat,
  defaultMeta: { service: 'pather-khonje-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: config.NODE_ENV === 'development' ? consoleFormat : logFormat,
      silent: config.NODE_ENV === 'test'
    }),

    // Combined log file
    new DailyRotateFile({
      filename: path.join(config.PATHS.logs, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: config.LOGGING.maxSize,
      maxFiles: config.LOGGING.maxFiles,
      format: logFormat
    }),

    // Error log file
    new DailyRotateFile({
      filename: path.join(config.PATHS.logs, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: config.LOGGING.maxSize,
      maxFiles: config.LOGGING.maxFiles,
      format: logFormat
    }),

    // Security log file
    new DailyRotateFile({
      filename: path.join(config.PATHS.logs, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: config.LOGGING.maxSize,
      maxFiles: config.LOGGING.maxFiles,
      format: logFormat
    })
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(config.PATHS.logs, 'exceptions.log'),
      format: logFormat
    })
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(config.PATHS.logs, 'rejections.log'),
      format: logFormat
    })
  ]
});

// Security logger for authentication events
const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'pather-khonje-security' },
  transports: [
    new DailyRotateFile({
      filename: path.join(config.PATHS.logs, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: config.LOGGING.maxSize,
      maxFiles: config.LOGGING.maxFiles,
      format: logFormat
    })
  ]
});

// Audit logger for admin actions
const auditLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'pather-khonje-audit' },
  transports: [
    new DailyRotateFile({
      filename: path.join(config.PATHS.logs, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: config.LOGGING.maxSize,
      maxFiles: config.LOGGING.maxFiles,
      format: logFormat
    })
  ]
});

// Helper functions for structured logging
const loggers = {
  // General application logger
  info: (message, meta = {}) => logger.info(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  error: (message, meta = {}) => logger.error(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),

  // Security events
  security: {
    loginAttempt: (email, success, ip, userAgent) => {
      securityLogger.info('Login attempt', {
        email,
        success,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      });
    },
    loginFailure: (email, reason, ip, userAgent) => {
      securityLogger.warn('Login failure', {
        email,
        reason,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      });
    },
    accountLocked: (email, ip) => {
      securityLogger.error('Account locked', {
        email,
        ip,
        timestamp: new Date().toISOString()
      });
    },
    suspiciousActivity: (userId, activity, ip, details) => {
      securityLogger.warn('Suspicious activity', {
        userId,
        activity,
        ip,
        details,
        timestamp: new Date().toISOString()
      });
    },
    passwordChange: (userId, email) => {
      securityLogger.info('Password changed', {
        userId,
        email,
        timestamp: new Date().toISOString()
      });
    },
    tokenRefresh: (userId, email) => {
      securityLogger.info('Token refreshed', {
        userId,
        email,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Audit events
  audit: {
    userCreated: (adminId, newUserId, newUserEmail) => {
      auditLogger.info('User created', {
        adminId,
        newUserId,
        newUserEmail,
        timestamp: new Date().toISOString()
      });
    },
    userUpdated: (adminId, targetUserId, changes) => {
      auditLogger.info('User updated', {
        adminId,
        targetUserId,
        changes,
        timestamp: new Date().toISOString()
      });
    },
    userDeleted: (adminId, targetUserId, targetUserEmail) => {
      auditLogger.info('User deleted', {
        adminId,
        targetUserId,
        targetUserEmail,
        timestamp: new Date().toISOString()
      });
    },
    roleChanged: (adminId, targetUserId, oldRole, newRole) => {
      auditLogger.info('Role changed', {
        adminId,
        targetUserId,
        oldRole,
        newRole,
        timestamp: new Date().toISOString()
      });
    }
  },

  // Database events
  database: {
    connection: (status, details) => {
      logger.info('Database connection', { status, details });
    },
    query: (operation, collection, duration, success) => {
      logger.debug('Database query', {
        operation,
        collection,
        duration,
        success
      });
    },
    error: (operation, error) => {
      logger.error('Database error', { operation, error: error.message });
    }
  },

  // API events
  api: {
    request: (method, url, ip, userAgent, userId) => {
      logger.info('API request', {
        method,
        url,
        ip,
        userAgent,
        userId,
        timestamp: new Date().toISOString()
      });
    },
    response: (method, url, statusCode, duration, userId) => {
      logger.info('API response', {
        method,
        url,
        statusCode,
        duration,
        userId,
        timestamp: new Date().toISOString()
      });
    },
    error: (method, url, error, userId) => {
      logger.error('API error', {
        method,
        url,
        error: error.message,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  }
};

module.exports = loggers;
