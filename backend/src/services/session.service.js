const { v4: uuidv4 } = require('uuid');
const redisService = require('./redis.service');
const questionService = require('./question.service');
const heightService = require('./height.service');
const { formatHeight } = require('../utils/heightConverter');
const logger = require('../utils/logger');
const config = require('../config');

class SessionService {
  /**
   * Create a new quiz session
   * @returns {object} Session data with first question
   */
  async createSession() {
    try {
      const sessionId = uuidv4();
      const questionIds = questionService.selectQuestionsForSession();
      
      const sessionData = {
        sessionId,
        questionIds,
        currentQuestionIndex: 0,
        answers: [],
        createdAt: new Date().toISOString(),
        completed: false
      };

      await redisService.set(`session:${sessionId}`, sessionData);
      
      logger.info('Session created', { sessionId, totalQuestions: questionIds.length });

      // Get first question
      const firstQuestion = questionService.getQuestionById(questionIds[0]);
      
      return {
        session_id: sessionId,
        question: questionService.formatQuestionForResponse(firstQuestion),
        progress: {
          current: 1,
          total: questionIds.length
        }
      };
    } catch (error) {
      logger.error('Error creating session', { error: error.message });
      throw error;
    }
  }

  /**
   * Submit an answer and get next question
   * @param {string} sessionId - Session ID
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {object} Next question or completion status
   */
  async submitAnswer(sessionId, questionId, answerId) {
    try {
      // Get session data
      const sessionData = await redisService.get(`session:${sessionId}`);
      
      if (!sessionData) {
        throw new Error('Session not found or expired');
      }

      if (sessionData.completed) {
        throw new Error('Session already completed');
      }

      // Validate question is current
      const currentQuestionId = sessionData.questionIds[sessionData.currentQuestionIndex];
      if (currentQuestionId !== questionId) {
        throw new Error('Invalid question for current session state');
      }

      // Get answer details with score
      const answerDetails = questionService.getAnswerDetails(questionId, answerId);
      
      // Store answer
      sessionData.answers.push(answerDetails);
      sessionData.currentQuestionIndex++;

      logger.info('Answer submitted', { 
        sessionId, 
        questionId, 
        answerId,
        questionIndex: sessionData.currentQuestionIndex 
      });

      // Check if quiz is complete
      if (sessionData.currentQuestionIndex >= sessionData.questionIds.length) {
        sessionData.completed = true;
        sessionData.completedAt = new Date().toISOString();
        
        await redisService.set(`session:${sessionId}`, sessionData);
        
        logger.info('Session completed', { sessionId });
        
        return {
          completed: true,
          message: 'Quiz completed! Check your result.'
        };
      }

      // Get next question
      const nextQuestionId = sessionData.questionIds[sessionData.currentQuestionIndex];
      const nextQuestion = questionService.getQuestionById(nextQuestionId);
      
      // Update session
      await redisService.set(`session:${sessionId}`, sessionData);

      return {
        completed: false,
        next_question: questionService.formatQuestionForResponse(nextQuestion),
        progress: {
          current: sessionData.currentQuestionIndex + 1,
          total: sessionData.questionIds.length
        }
      };
    } catch (error) {
      logger.error('Error submitting answer', { 
        sessionId, 
        questionId, 
        answerId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get quiz result
   * @param {string} sessionId - Session ID
   * @returns {object} Height prediction result
   */
  async getResult(sessionId) {
    try {
      const sessionData = await redisService.get(`session:${sessionId}`);
      
      if (!sessionData) {
        throw new Error('Session not found or expired');
      }

      if (!sessionData.completed) {
        throw new Error('Session not completed yet');
      }

      // Calculate height
      const heightCm = heightService.calculateHeight(sessionData.answers);
      const formattedHeight = formatHeight(heightCm);
      const message = heightService.generateMessage(heightCm);

      logger.info('Result generated', { sessionId, height: heightCm });

      return {
        height: formattedHeight,
        message,
        share_text: `I'm ${formattedHeight.display} according to this height quiz! Can you guess yours? 📏`
      };
    } catch (error) {
      logger.error('Error getting result', { sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Check if session exists
   * @param {string} sessionId - Session ID
   * @returns {boolean} True if session exists
   */
  async sessionExists(sessionId) {
    try {
      return await redisService.exists(`session:${sessionId}`);
    } catch (error) {
      logger.error('Error checking session existence', { sessionId, error: error.message });
      return false;
    }
  }
}

module.exports = new SessionService();

// Made with Bob
