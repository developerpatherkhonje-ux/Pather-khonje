const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('../utils/logger');

const backup = async () => {
  try {
    logger.info('Starting database backup...');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, config.MONGODB_OPTIONS);
    logger.info('Connected to MongoDB');
    
    // Create backup directory
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(config.PATHS.backups, `backup-${timestamp}`);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Backup collections
    await backupCollection('users', backupDir);
    await backupCollection('refreshtokens', backupDir);
    await backupCollection('auditlogs', backupDir);
    
    // Create backup info file
    const backupInfo = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      collections: ['users', 'refreshtokens', 'auditlogs'],
      size: await calculateBackupSize(backupDir)
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    );
    
    logger.info('Database backup completed', { 
      backupDir,
      size: backupInfo.size 
    });
    
    console.log(`✅ Backup completed: ${backupDir}`);
    console.log(`📊 Backup size: ${backupInfo.size}`);
    
    // Cleanup old backups
    await cleanupOldBackups();
    
  } catch (error) {
    logger.error('Database backup failed', { error: error.message });
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

const backupCollection = async (collectionName, backupDir) => {
  try {
    const collection = mongoose.connection.db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    
    const backupFile = path.join(backupDir, `${collectionName}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(documents, null, 2));
    
    logger.info(`Collection ${collectionName} backed up`, { 
      count: documents.length,
      file: backupFile 
    });
    
    console.log(`📁 ${collectionName}: ${documents.length} documents`);
  } catch (error) {
    logger.error(`Failed to backup collection ${collectionName}`, { error: error.message });
    throw error;
  }
};

const calculateBackupSize = async (backupDir) => {
  try {
    const files = fs.readdirSync(backupDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }
    
    return formatBytes(totalSize);
  } catch (error) {
    logger.error('Failed to calculate backup size', { error: error.message });
    return 'Unknown';
  }
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const cleanupOldBackups = async () => {
  try {
    const backupDir = config.PATHS.backups;
    const retentionDays = config.BACKUP.retentionDays;
    
    if (!fs.existsSync(backupDir)) {
      return;
    }
    
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const backupFolders = fs.readdirSync(backupDir);
    
    let deletedCount = 0;
    
    for (const folder of backupFolders) {
      const folderPath = path.join(backupDir, folder);
      const stats = fs.statSync(folderPath);
      
      if (stats.isDirectory() && stats.mtime < cutoffDate) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        deletedCount++;
        logger.info('Old backup deleted', { folder, mtime: stats.mtime });
      }
    }
    
    if (deletedCount > 0) {
      logger.info('Old backups cleaned up', { count: deletedCount });
      console.log(`🗑️  Cleaned up ${deletedCount} old backups`);
    }
  } catch (error) {
    logger.error('Failed to cleanup old backups', { error: error.message });
  }
};

const restore = async (backupPath) => {
  try {
    logger.info('Starting database restore...', { backupPath });
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, config.MONGODB_OPTIONS);
    logger.info('Connected to MongoDB');
    
    // Check if backup exists
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }
    
    // Read backup info
    const backupInfoPath = path.join(backupPath, 'backup-info.json');
    if (!fs.existsSync(backupInfoPath)) {
      throw new Error('Backup info file not found');
    }
    
    const backupInfo = JSON.parse(fs.readFileSync(backupInfoPath, 'utf8'));
    logger.info('Backup info loaded', backupInfo);
    
    // Restore collections
    for (const collectionName of backupInfo.collections) {
      await restoreCollection(collectionName, backupPath);
    }
    
    logger.info('Database restore completed');
    console.log('✅ Database restore completed');
    
  } catch (error) {
    logger.error('Database restore failed', { error: error.message });
    console.error('❌ Restore failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

const restoreCollection = async (collectionName, backupPath) => {
  try {
    const backupFile = path.join(backupPath, `${collectionName}.json`);
    
    if (!fs.existsSync(backupFile)) {
      logger.warn(`Backup file not found for collection ${collectionName}`);
      return;
    }
    
    const documents = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const collection = mongoose.connection.db.collection(collectionName);
    
    // Clear existing data
    await collection.deleteMany({});
    
    // Insert backup data
    if (documents.length > 0) {
      await collection.insertMany(documents);
    }
    
    logger.info(`Collection ${collectionName} restored`, { count: documents.length });
    console.log(`📁 ${collectionName}: ${documents.length} documents restored`);
  } catch (error) {
    logger.error(`Failed to restore collection ${collectionName}`, { error: error.message });
    throw error;
  }
};

const listBackups = async () => {
  try {
    const backupDir = config.PATHS.backups;
    
    if (!fs.existsSync(backupDir)) {
      console.log('No backups found');
      return;
    }
    
    const backupFolders = fs.readdirSync(backupDir);
    const backups = [];
    
    for (const folder of backupFolders) {
      const folderPath = path.join(backupDir, folder);
      const stats = fs.statSync(folderPath);
      
      if (stats.isDirectory()) {
        const backupInfoPath = path.join(folderPath, 'backup-info.json');
        let backupInfo = null;
        
        if (fs.existsSync(backupInfoPath)) {
          backupInfo = JSON.parse(fs.readFileSync(backupInfoPath, 'utf8'));
        }
        
        backups.push({
          folder,
          created: stats.mtime,
          size: await calculateBackupSize(folderPath),
          info: backupInfo
        });
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => b.created - a.created);
    
    console.log('\n📦 Available Backups:');
    console.log('─'.repeat(80));
    
    for (const backup of backups) {
      console.log(`📁 ${backup.folder}`);
      console.log(`   📅 Created: ${backup.created.toLocaleString()}`);
      console.log(`   📊 Size: ${backup.size}`);
      if (backup.info) {
        console.log(`   📋 Collections: ${backup.info.collections.join(', ')}`);
      }
      console.log('');
    }
    
  } catch (error) {
    logger.error('Failed to list backups', { error: error.message });
    console.error('❌ Failed to list backups:', error.message);
  }
};

// Command line interface
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'backup':
    backup();
    break;
  case 'restore':
    if (!arg) {
      console.log('Usage: node backup.js restore <backup-path>');
      process.exit(1);
    }
    restore(arg);
    break;
  case 'list':
    listBackups();
    break;
  default:
    console.log('Usage: node backup.js [command]');
    console.log('Commands:');
    console.log('  backup           - Create a new backup');
    console.log('  restore <path>   - Restore from backup');
    console.log('  list             - List available backups');
    break;
}




