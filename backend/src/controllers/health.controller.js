const redisService = require('../services/redis.service');
const questionService = require('../services/question.service');

class HealthController {
  /**
   * GET /api/health
   * Health check endpoint
   */
  async checkHealth(req, res) {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      redis: redisService.getConnectionStatus() ? 'connected' : 'disconnected',
      questions: questionService.getTotalQuestions()
    };

    const statusCode = health.redis === 'connected' ? 200 : 503;
    res.status(statusCode).json(health);
  }
}

module.exports = new HealthController();

// Made with Bob
