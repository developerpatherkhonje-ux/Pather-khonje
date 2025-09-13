const crypto = require('crypto');
const config = require('../config/config');

class SecurityUtils {
  /**
   * Generate a secure random token
   * @param {number} length - Token length in bytes
   * @returns {string} - Hex encoded token
   */
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a secure random string
   * @param {number} length - String length
   * @returns {string} - Random string
   */
  static generateRandomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Encrypt sensitive data
   * @param {string} text - Text to encrypt
   * @returns {string} - Encrypted text
   */
  static encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const encryptionKey = config.ENCRYPTION_KEY || config.SESSION_SECRET;
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedText - Encrypted text
   * @returns {string} - Decrypted text
   */
  static decrypt(encryptedText) {
    const algorithm = 'aes-256-cbc';
    const encryptionKey = config.ENCRYPTION_KEY || config.SESSION_SECRET;
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encrypted = textParts.join(':');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash data using SHA-256
   * @param {string} data - Data to hash
   * @returns {string} - Hashed data
   */
  static hash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - Validation result
   */
  static validatePasswordStrength(password) {
    const errors = [];
    const warnings = [];

    if (password.length < config.SECURITY.passwordMinLength) {
      errors.push(`Password must be at least ${config.SECURITY.passwordMinLength} characters long`);
    }

    if (config.SECURITY.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (config.SECURITY.passwordRequireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (config.SECURITY.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (config.SECURITY.passwordRequireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak patterns
    if (/(.)\1{2,}/.test(password)) {
      warnings.push('Password contains repeated characters');
    }

    if (/123|abc|qwe/i.test(password)) {
      warnings.push('Password contains common sequences');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      strength: this.calculatePasswordStrength(password)
    };
  }

  /**
   * Calculate password strength score
   * @param {string} password - Password to analyze
   * @returns {number} - Strength score (0-100)
   */
  static calculatePasswordStrength(password) {
    let score = 0;
    
    // Length score
    score += Math.min(password.length * 4, 25);
    
    // Character variety score
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    
    // Complexity score
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 20);
    
    // Pattern penalties
    if (/(.)\1{2,}/.test(password)) score -= 10;
    if (/123|abc|qwe/i.test(password)) score -= 15;
    if (/password|admin|user/i.test(password)) score -= 20;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Sanitize input to prevent XSS
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Is valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - Is valid phone
   */
  static isValidPhone(phone) {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Generate secure session ID
   * @returns {string} - Session ID
   */
  static generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check if IP is in allowed range
   * @param {string} ip - IP address
   * @param {string[]} allowedRanges - Allowed IP ranges
   * @returns {boolean} - Is IP allowed
   */
  static isIPAllowed(ip, allowedRanges = []) {
    if (allowedRanges.length === 0) return true;
    
    // Simple implementation - can be enhanced with CIDR support
    return allowedRanges.includes(ip);
  }

  /**
   * Rate limit key generator
   * @param {string} identifier - User identifier (IP, user ID, etc.)
   * @param {string} action - Action being rate limited
   * @returns {string} - Rate limit key
   */
  static generateRateLimitKey(identifier, action) {
    return `rate_limit:${action}:${identifier}`;
  }

  /**
   * Generate CSRF token
   * @returns {string} - CSRF token
   */
  static generateCSRFToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify CSRF token
   * @param {string} token - Token to verify
   * @param {string} sessionToken - Session token
   * @returns {boolean} - Is token valid
   */
  static verifyCSRFToken(token, sessionToken) {
    return token === sessionToken;
  }

  /**
   * Generate secure filename
   * @param {string} originalName - Original filename
   * @returns {string} - Secure filename
   */
  static generateSecureFilename(originalName) {
    const ext = originalName.split('.').pop();
    const timestamp = Date.now();
    const random = this.generateRandomString(8);
    return `${timestamp}_${random}.${ext}`;
  }

  /**
   * Check file type security
   * @param {string} mimeType - File MIME type
   * @param {string[]} allowedTypes - Allowed MIME types
   * @returns {boolean} - Is file type allowed
   */
  static isFileTypeAllowed(mimeType, allowedTypes) {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Generate API key
   * @returns {string} - API key
   */
  static generateAPIKey() {
    const prefix = 'pk_';
    const key = this.generateSecureToken(32);
    return `${prefix}${key}`;
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} - Is valid API key format
   */
  static isValidAPIKeyFormat(apiKey) {
    return /^pk_[a-f0-9]{64}$/.test(apiKey);
  }
}

module.exports = SecurityUtils;
