// Serverless-compatible logger for Vercel deployment
// This replaces the file-based Winston logger for serverless environments

class ServerlessLogger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      http: 3,
      debug: 4
    };
  }

  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;
    
    const formattedMessage = this.formatMessage(level, message, meta);
    
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
      case 'http':
        console.log(formattedMessage);
        break;
      case 'debug':
        if (this.level === 'debug') {
          console.log(formattedMessage);
        }
        break;
    }
  }

  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  http(message, meta = {}) {
    this.log('http', message, meta);
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  // Security logging methods
  security = {
    loginAttempt: (email, success, ip, userAgent) => {
      this.log('info', 'Login attempt', {
        email,
        success,
        ip,
        userAgent,
        type: 'security'
      });
    },
    
    loginFailure: (email, reason, ip, userAgent) => {
      this.log('warn', 'Login failure', {
        email,
        reason,
        ip,
        userAgent,
        type: 'security'
      });
    },
    
    suspiciousActivity: (activity, ip, userAgent) => {
      this.log('warn', 'Suspicious activity detected', {
        activity,
        ip,
        userAgent,
        type: 'security'
      });
    }
  };

  // Database logging methods
  database = {
    connection: (status, meta = {}) => {
      this.log('info', `Database connection ${status}`, {
        ...meta,
        type: 'database'
      });
    },
    
    query: (operation, collection, duration) => {
      this.log('debug', 'Database query', {
        operation,
        collection,
        duration,
        type: 'database'
      });
    }
  };

  // Audit logging methods
  audit = {
    userAction: (userId, action, resource, meta = {}) => {
      this.log('info', 'User action', {
        userId,
        action,
        resource,
        ...meta,
        type: 'audit'
      });
    },
    
    adminAction: (adminId, action, target, meta = {}) => {
      this.log('info', 'Admin action', {
        adminId,
        action,
        target,
        ...meta,
        type: 'audit'
      });
    }
  };
}

// Create singleton instance
const logger = new ServerlessLogger();

module.exports = logger;

