const redisService = require('../services/redis.service');
const questionService = require('../services/question.service');

class HealthController {
  /**
   * GET /api/health
   * Health check endpoint
   */
  async checkHealth(req, res) {
    const redisStatus = redisService.getConnectionStatus();
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      storage: {
        type: redisStatus.usingMemoryFallback ? 'memory' : 'redis',
        redis: {
          enabled: redisStatus.redisEnabled,
          connected: redisStatus.connected
        }
      },
      questions: questionService.getTotalQuestions()
    };

    // Always return 200 if app is running (even with memory fallback)
    res.status(200).json(health);
  }
}

module.exports = new HealthController();

// Made with Bob
