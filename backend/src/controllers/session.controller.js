const sessionService = require('../services/session.service');
const logger = require('../utils/logger');

class SessionController {
  /**
   * POST /api/session/start
   * Create a new quiz session
   */
  async startSession(req, res, next) {
    try {
      const result = await sessionService.createSession();
      res.status(201).json(result);
    } catch (error) {
      logger.error('Start session error', { error: error.message });
      next(error);
    }
  }

  /**
   * POST /api/session/:sessionId/answer
   * Submit an answer
   */
  async submitAnswer(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { questionId, answerId } = req.body;

      if (!questionId || !answerId) {
        return res.status(400).json({
          error: 'Missing required fields: questionId and answerId'
        });
      }

      const result = await sessionService.submitAnswer(sessionId, questionId, answerId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('expired')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('completed')) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Submit answer error', { error: error.message });
      next(error);
    }
  }

  /**
   * GET /api/session/:sessionId/result
   * Get quiz result
   */
  async getResult(req, res, next) {
    try {
      const { sessionId } = req.params;
      const result = await sessionService.getResult(sessionId);
      res.status(200).json(result);
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('expired')) {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('not completed')) {
        return res.status(400).json({ error: error.message });
      }
      logger.error('Get result error', { error: error.message });
      next(error);
    }
  }
}

module.exports = new SessionController();

// Made with Bob
