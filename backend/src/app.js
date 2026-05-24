const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sessionRateLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Apply rate limiter to session creation
app.use('/api/session/start', sessionRateLimiter);

// Mount API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Height Quiz API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      startSession: 'POST /api/session/start',
      submitAnswer: 'POST /api/session/:sessionId/answer',
      getResult: 'GET /api/session/:sessionId/result'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

// Made with Bob
