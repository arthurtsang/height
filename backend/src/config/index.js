require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  redis: {
    enabled: process.env.REDIS_ENABLED === 'true',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    ttl: 7200 // 2 hours in seconds (generous for quiz completion)
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
  },
  adaptive: {
    // Phase 1: Nationality identification
    maxNationalityQuestions: 15,
    nationalityConfidenceThreshold: 0.90,
    
    // Phase 2: Height determination
    maxHeightQuestions: 12,
    heightConfidenceThreshold: 0.85,
    
    // Question selection weights
    informationGainWeight: 0.6,
    categoryDiversityWeight: 0.2,
    recencyPenaltyWeight: 0.2
  }
};

// Made with Bob
