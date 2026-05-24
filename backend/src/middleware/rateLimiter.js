const rateLimit = require('express-rate-limit');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Rate limiter for session creation
 * Limits to 10 sessions per IP per hour
 */
const sessionRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: 'Too many sessions created from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many sessions created from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

module.exports = {
  sessionRateLimiter
};

// Made with Bob
