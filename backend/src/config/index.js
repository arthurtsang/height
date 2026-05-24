require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    ttl: 3600 // 1 hour in seconds
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // 50 sessions per IP per 15 minutes
  },
  cors: {
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173'),
    credentials: true
  },
  questions: {
    totalPerSession: 10,
    minCulturalQuestions: 3 // First 3 questions should be cultural
  }
};

// Made with Bob
