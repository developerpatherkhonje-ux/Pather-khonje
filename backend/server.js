const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const config = require('./config/config');
const logger = require('./utils/logger');
const SecurityUtils = require('./utils/security');

// Validate critical environment variables (allow defaults in development)
const validateEnvironment = () => {
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName] && !config[varName]);
  if (missing.length > 0) {
    if (config.NODE_ENV === 'production') {
      console.error('❌ Missing required environment variables:', missing.join(', '));
      console.error('   Please check your .env file or environment configuration.');
      process.exit(1);
    } else {
      console.warn('⚠️  Missing environment variables (using safe defaults in development):', missing.join(', '));
    }
  }
};

validateEnvironment();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const placesRoutes = require('./routes/places');
const hotelsRoutes = require('./routes/hotels');
const uploadRoutes = require('./routes/upload');
const packageRoutes = require('./routes/packages');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// Trust proxy for Render deployment (fixes rate limiting issue)
app.set('trust proxy', 1);

// Create necessary directories
const createDirectories = () => {
  const dirs = [config.PATHS.logs, 'uploads', 'uploads/hotels', 'uploads/places', 'uploads/packages'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip, userAgent: req.get('User-Agent') });
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});

const loginLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.windowMs,
  max: config.RATE_LIMIT.loginMax,
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security.loginFailure(req.body?.email || 'unknown', 'Rate limit exceeded', req.ip, req.get('User-Agent'));
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again later.'
    });
  }
});

// Handle preflight OPTIONS requests before rate limiting
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-API-Key, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', loginLimiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost with any port for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow any Vercel domain (for dynamic URLs)
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Check exact matches first
    if (config.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    // Check wildcard patterns
    const isAllowed = config.ALLOWED_ORIGINS.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace(/\*/g, '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    logger.warn('CORS blocked request', { origin, allowedOrigins: config.ALLOWED_ORIGINS });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-API-Key', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent parameter pollution

// XSS protection middleware
app.use((req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
});

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.MONGODB_URI,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'pather-khonje-session'
}));

// Database connection
const connectDB = async () => {
  try {
    // Connect to MongoDB with options
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    
    console.log('Database is connected');
    
  } catch (error) {
    console.log('❌ MongoDB Connection Failed!');
    console.log(`   Error: ${error.message}`);
    logger.database.connection('failed', { error: error.message });
    logger.error('MongoDB connection error', { error: error.message });
    if (config.NODE_ENV === 'production') {
      throw error;
    } else {
      console.warn('⚠️  Continuing without database connection in development mode.');
    }
  }
};

// Create database indexes
const createIndexes = async () => {
  try {
    const User = require('./models/User');
    const RefreshToken = require('./models/RefreshToken');
    const AuditLog = require('./models/AuditLog');
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1 });
    await User.collection.createIndex({ isActive: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ lastLogin: -1 });
    
    // RefreshToken indexes
    await RefreshToken.collection.createIndex({ token: 1 }, { unique: true });
    await RefreshToken.collection.createIndex({ userId: 1 });
    
    // AuditLog indexes
    await AuditLog.collection.createIndex({ userId: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ action: 1, timestamp: -1 });
    await AuditLog.collection.createIndex({ timestamp: 1 });
    
    logger.info('Database indexes created successfully');
  } catch (error) {
    console.log('❌ Failed to create database indexes');
    console.log(`   Error: ${error.message}`);
    logger.error('Failed to create database indexes', { error: error.message });
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const User = require('./models/User');
    const existingAdmin = await User.findByEmail(config.ADMIN_EMAIL);
    
    if (!existingAdmin) {
      const adminUser = new User({
        name: 'Super Admin',
        email: config.ADMIN_EMAIL,
        password: config.ADMIN_PASSWORD,
        role: 'admin',
        designation: 'System Administrator',
        isActive: true,
        metadata: {
          source: 'api',
          ipAddress: '127.0.0.1',
          userAgent: 'System Initialization'
        }
      });
      
      await adminUser.save();
      
      logger.info('Default admin user created', { 
        email: config.ADMIN_EMAIL
      });
    } else {
      logger.info('Admin user already exists', { email: config.ADMIN_EMAIL });
    }
    
  } catch (error) {
    console.log('❌ Error creating default admin');
    console.log(`   Error: ${error.message}`);
    logger.error('Error creating default admin', { error: error.message });
    throw error; // Re-throw to be handled by startServer
  }
};

// Serve static files from uploads directory with permissive cross-origin resource policy and COEP relaxed for assets
app.use('/uploads', (req, res, next) => {
  // Allow cross-origin image loads from the frontend
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  };
  
  res.json(health);
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
  res.json({
    title: 'Pather Khonje API',
    version: '1.0.0',
    description: 'Backend API for Pather Khonje Travel Agency',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register a new user',
        'POST /api/auth/login': 'User login',
        'POST /api/auth/refresh': 'Refresh access token',
        'GET /api/auth/me': 'Get current user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/password': 'Update user password',
        'POST /api/auth/logout': 'Logout user',
        'GET /api/auth/sessions': 'Get user active sessions',
        'POST /api/auth/revoke-session': 'Revoke a session'
      },
      admin: {
        'GET /api/admin/users': 'Get all users (admin only)',
        'GET /api/admin/users/:id': 'Get user by ID (admin only)',
        'PUT /api/admin/users/:id': 'Update user (admin only)',
        'DELETE /api/admin/users/:id': 'Delete user (admin only)',
        'GET /api/admin/stats': 'Get admin dashboard statistics',
        'GET /api/admin/audit': 'Get audit logs (admin only)',
        'GET /api/admin/security': 'Get security events (admin only)'
      },
      system: {
        'GET /api/health': 'Server health check'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', { 
    method: req.method, 
    url: req.originalUrl, 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Global error handler', { 
    error: error.message, 
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id
  });
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'production' ? 'Internal server error' : error.message
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed.');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server after database connection
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Only run DB-dependent setup if connected
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      // Create database indexes
      await createIndexes();
      
      // Create default admin user
      await createDefaultAdmin();
    } else {
      logger.warn('Skipping index and admin setup: MongoDB not connected');
    }
    
    // Start the server
    const PORT = config.PORT;
    const server = app.listen(PORT, () => {
      console.log('Server is Connected');
      
      logger.info('Server started', {
        port: PORT,
        environment: config.NODE_ENV,
        frontendUrl: config.FRONTEND_URL
      });
    });
    
    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error.message);
      logger.error('Server error', { error: error.message });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    logger.error('Server startup failed', { error: error.message });
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Start the application
startServer();

module.exports = app;