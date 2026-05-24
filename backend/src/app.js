const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Trust proxy - required for Vercel and other reverse proxies
// This allows Express to correctly identify client IPs from X-Forwarded-For header
app.set('trust proxy', 1);

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
