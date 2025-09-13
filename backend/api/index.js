// Vercel Serverless Function Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Serverless-optimized configuration
const config = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/pather-khonje',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-key-here',
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-key-here',
  NODE_ENV: process.env.NODE_ENV || 'production',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://patherkhonje.vercel.app',
  ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://patherkhonje.vercel.app',
    'https://pather-khonjes-projects.vercel.app'
  ]
};

// Import routes
const authRoutes = require('../routes/auth');
const adminRoutes = require('../routes/admin');
const placesRoutes = require('../routes/places');
const hotelsRoutes = require('../routes/hotels');
const uploadRoutes = require('../routes/upload');
const packageRoutes = require('../routes/packages');

const app = express();

// Database connection with serverless optimization
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected) {
    return mongoose.connection;
  }
  
  if (connectionPromise) {
    return connectionPromise;
  }
  
  connectionPromise = mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 1, // Maintain only one connection in serverless
    bufferCommands: false, // Disable mongoose buffering
    bufferMaxEntries: 0 // Disable mongoose buffering
  }).then(() => {
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    return mongoose.connection;
  }).catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    connectionPromise = null;
    throw error;
  });
  
  return connectionPromise;
};

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow Vercel domains
    if (origin.includes('vercel.app') || config.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-filename', 'X-CSRF-Token', 'X-API-Key', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// Connect to database before handling requests (serverless optimized)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/packages', packageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value'
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export for Vercel
module.exports = app;
