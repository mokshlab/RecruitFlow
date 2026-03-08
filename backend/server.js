// Import required dependencies
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const logger = require('./config/logger');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const constants = require('./config/constants');
const { initializeSocket } = require('./config/socket');
const { initGridFS } = require('./config/gridfs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const server = http.createServer(app);

connectDB();

const seedAdmin = require('./config/seed');
seedAdmin();

app.set('trust proxy', 1);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL?.replace(/\/+$/, '') 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false
}));

const limiter = rateLimit({
  windowMs: constants.RATE_LIMIT_WINDOW_MS,
  max: constants.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: constants.RATE_LIMIT_WINDOW_MS,
  max: constants.AUTH_RATE_LIMIT_MAX,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(mongoSanitize());
app.use(xss());

app.use(express.json({ limit: constants.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: constants.JSON_BODY_LIMIT }));

app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Recruit Flow API',
    version: '1.2.0',
    status: 'running',
    endpoints: {
      docs: '/api/docs',
      health: '/api/health',
      auth: '/api/auth',
      jobs: '/api/jobs',
      users: '/api/users',
      admin: '/api/admin'
    },
    documentation: 'Visit /api/docs for complete API documentation'
  });
});

app.get('/api/health', async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    services: {
      database: 'unknown',
      socketio: 'unknown',
      gridfs: 'unknown'
    },
    memory: {
      usage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
    }
  };

  let hasErrors = false;

  try {
    // Check MongoDB connection
    const dbState = mongoose.connection.readyState;
    if (dbState === 1) {
      // Perform a simple ping to verify active connection
      await mongoose.connection.db.admin().ping();
      healthCheck.services.database = 'connected';
      healthCheck.database = {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        state: 'connected'
      };
    } else {
      healthCheck.services.database = 'disconnected';
      healthCheck.database = {
        state: dbState === 0 ? 'disconnected' : dbState === 2 ? 'connecting' : 'error'
      };
      hasErrors = true;
    }
  } catch (error) {
    healthCheck.services.database = 'error';
    healthCheck.database = { error: error.message };
    hasErrors = true;
  }

  try {
    // Check Socket.io server
    const { getIO } = require('./config/socket');
    const io = getIO();
    if (io && io.engine) {
      const clientsCount = io.engine.clientsCount || 0;
      healthCheck.services.socketio = 'running';
      healthCheck.socketio = {
        status: 'running',
        connectedClients: clientsCount
      };
    } else {
      healthCheck.services.socketio = 'not initialized';
      hasErrors = true;
    }
  } catch (error) {
    healthCheck.services.socketio = 'error';
    healthCheck.socketio = { error: error.message };
    hasErrors = true;
  }

  try {
    // Check GridFS availability
    const { getGridFSBucket } = require('./config/gridfs');
    const bucket = getGridFSBucket();
    if (bucket) {
      healthCheck.services.gridfs = 'available';
      healthCheck.gridfs = {
        status: 'available',
        bucketName: bucket.bucketName
      };
    } else {
      healthCheck.services.gridfs = 'not initialized';
      hasErrors = true;
    }
  } catch (error) {
    healthCheck.services.gridfs = 'error';
    healthCheck.gridfs = { error: error.message };
    hasErrors = true;
  }

  // Set overall status based on critical services
  if (hasErrors) {
    healthCheck.status = 'DEGRADED';
    return res.status(503).json(healthCheck);
  }

  res.status(200).json(healthCheck);
});

// API Routes
app.use('/api/docs', require('./routes/api/docs'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/admin', require('./routes/api/admin'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/jobs', require('./routes/api/jobs'));
app.use('/api/contact', require('./routes/api/contact'));
app.use('/api/news', require('./routes/api/news'));
app.use('/api/resume', require('./routes/api/resume'));
app.use('/api/files', require('./routes/api/files'));

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use(notFound);
app.use(errorHandler);

initializeSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info('Socket.io server ready for connections');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});