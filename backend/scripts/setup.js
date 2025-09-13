const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../utils/logger');
const SecurityUtils = require('../utils/security');

const setup = async () => {
  try {
    logger.info('Starting database setup...');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    logger.info('Connected to MongoDB');
    
    // Create indexes
    await createIndexes();
    
    // Create default admin user
    await createDefaultAdmin();
    
    logger.info('Database setup completed successfully');
    
  } catch (error) {
    logger.error('Database setup failed', { error: error.message });
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

const createIndexes = async () => {
  try {
    logger.info('Creating database indexes...');
    
    const User = require('../models/User');
    const RefreshToken = require('../models/RefreshToken');
    const AuditLog = require('../models/AuditLog');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ lastLogin: -1 });
    await User.collection.createIndex({ 'address.city': 1 });
    await User.collection.createIndex({ 'address.state': 1 });
    await User.collection.createIndex({ lockUntil: 1 });
    
    // RefreshToken indexes
    await RefreshToken.collection.createIndex({ token: 1 }, { unique: true });
    await RefreshToken.collection.createIndex({ userId: 1 });
    await RefreshToken.collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await RefreshToken.collection.createIndex({ userId: 1, isRevoked: 1 });
    
    // AuditLog indexes
    await AuditLog.collection.createIndex({ userId: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ action: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ resource: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ success: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ ipAddress: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
    
    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to create database indexes', { error: error.message });
    throw error;
  }
};

const createDefaultAdmin = async () => {
  try {
    logger.info('Creating default admin users...');
    
    const User = require('../models/User');
    
    // Define all admin users
    const adminUsers = [
      {
        name: config.ADMIN_NAME,
        email: config.ADMIN_EMAIL,
        password: config.ADMIN_PASSWORD,
        designation: 'Super Administrator'
      },
      {
        name: config.MANAGER_NAME,
        email: config.MANAGER_EMAIL,
        password: config.MANAGER_PASSWORD,
        designation: 'Manager'
      },
      {
        name: config.PROPRIETOR_NAME,
        email: config.PROPRIETOR_EMAIL,
        password: config.PROPRIETOR_PASSWORD,
        designation: 'Proprietor'
      }
    ];
    
    console.log('\n🔐 Creating Admin Users:');
    
    for (const userData of adminUsers) {
      const existingUser = await User.findByEmail(userData.email);
      
      if (!existingUser) {
        const adminUser = new User({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: 'admin',
          designation: userData.designation,
          isActive: true,
          metadata: {
            source: 'system',
            ipAddress: '127.0.0.1',
            userAgent: 'System Initialization'
          }
        });
        
        await adminUser.save();
        
        logger.info('Admin user created', { 
          email: userData.email,
          name: userData.name,
          designation: userData.designation
        });
        
        console.log(`✅ ${userData.designation}:`);
        console.log(`   📧 Email: ${userData.email}`);
        console.log(`   🔑 Password: ${userData.password}`);
        console.log(`   👤 Name: ${userData.name}\n`);
        
      } else {
        logger.info('Admin user already exists', { email: userData.email });
        console.log(`✅ ${userData.designation} already exists: ${userData.email}`);
      }
    }
    
    console.log('⚠️  IMPORTANT: Change the default passwords after first login!\n');
    
  } catch (error) {
    logger.error('Failed to create default admin users', { error: error.message });
    throw error;
  }
};

const generateSecrets = () => {
  console.log('\n🔐 Generate Strong Secrets:');
  console.log('Copy these to your .env file:\n');
  
  console.log(`JWT_SECRET=${SecurityUtils.generateSecureToken(64)}`);
  console.log(`JWT_REFRESH_SECRET=${SecurityUtils.generateSecureToken(64)}`);
  console.log(`SESSION_SECRET=${SecurityUtils.generateSecureToken(64)}`);
  console.log(`COOKIE_SECRET=${SecurityUtils.generateSecureToken(64)}`);
  
  console.log('\n⚠️  IMPORTANT: Keep these secrets secure and never share them!');
};

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setup();
    break;
  case 'secrets':
    generateSecrets();
    break;
  default:
    console.log('Usage: node setup.js [command]');
    console.log('Commands:');
    console.log('  setup   - Run full database setup');
    console.log('  secrets - Generate strong secrets');
    break;
}
