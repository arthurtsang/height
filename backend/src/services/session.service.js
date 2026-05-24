const { v4: uuidv4 } = require('uuid');
const redisService = require('./redis.service');
const questionService = require('./question.service');
const inferenceService = require('./inference.service');
const heightService = require('./height.service');
const { formatHeight } = require('../utils/heightConverter');
const logger = require('../utils/logger');
const config = require('../config');

class SessionService {
  /**
   * Create a new quiz session with adaptive two-phase system
   * @returns {object} Session data with first question
   */
  async createSession() {
    try {
      const sessionId = uuidv4();
      
      // Initialize session with Phase 1: Nationality identification
      const countryCodes = questionService.getCountryCodes();
      const initialDistribution = inferenceService.initializeUniformDistribution(countryCodes);
      
      const sessionData = {
        sessionId,
        phase: 'nationality', // Phase 1: nationality identification
        askedQuestions: [],
        recentCategories: [],
        
        // Phase 1: Nationality tracking
        nationalityDistribution: initialDistribution,
        nationalityConfidence: 1.0 / countryCodes.length,
        nationalityAnswers: [],
        
        // Phase 2: Height tracking (initialized later)
        determinedCountry: null,
        baseHeight: null,
        heightAdjustment: 0,
        heightCategoryProbs: null,
        heightAnswers: [],
        
        createdAt: new Date().toISOString(),
        completed: false
      };

      await redisService.set(`session:${sessionId}`, sessionData);
      
      logger.info('Adaptive session created', { 
        sessionId, 
        phase: 'nationality',
        countries: countryCodes.length 
      });

      // Get first question using information gain
      const firstQuestion = questionService.selectNextQuestion(
        'nationality',
        [],
        initialDistribution,
        []
      );
      
      if (!firstQuestion) {
        throw new Error('No nationality questions available');
      }

      sessionData.askedQuestions.push(firstQuestion.id);
      sessionData.recentCategories.push(firstQuestion.category);
      await redisService.set(`session:${sessionId}`, sessionData);

      return {
        session_id: sessionId,
        question: questionService.formatQuestionForResponse(firstQuestion),
        progress: {
          current: 1,
          total: 20, // Estimated total for progress bar
          questionsAsked: 1,
          estimatedRemaining: '5-15'
        }
      };
    } catch (error) {
      logger.error('Error creating session', { error: error.message });
      throw error;
    }
  }

  /**
   * Submit an answer and get next question (adaptive two-phase system)
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

      // Validate question
      const lastAskedQuestion = sessionData.askedQuestions[sessionData.askedQuestions.length - 1];
      if (lastAskedQuestion !== questionId) {
        throw new Error('Invalid question for current session state');
      }

      logger.info('Answer submitted', { 
        sessionId, 
        questionId, 
        answerId,
        phase: sessionData.phase,
        questionsAsked: sessionData.askedQuestions.length
      });

      // Process answer based on current phase
      if (sessionData.phase === 'nationality') {
        return await this.processNationalityAnswer(sessionData, questionId, answerId);
      } else if (sessionData.phase === 'height_relative') {
        return await this.processHeightAnswer(sessionData, questionId, answerId);
      } else {
        throw new Error(`Unknown phase: ${sessionData.phase}`);
      }
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
   * Process answer in nationality identification phase
   * @param {object} sessionData - Session data
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {object} Next question or phase transition
   */
  async processNationalityAnswer(sessionData, questionId, answerId) {
    // Get answer details with country weights
    const answerDetails = questionService.getAnswerDetailsNationality(questionId, answerId);
    sessionData.nationalityAnswers.push(answerDetails);

    // Update probability distribution using Bayesian inference
    sessionData.nationalityDistribution = inferenceService.bayesianUpdate(
      sessionData.nationalityDistribution,
      answerDetails.countryWeights
    );

    // Calculate confidence
    sessionData.nationalityConfidence = inferenceService.getConfidence(
      sessionData.nationalityDistribution
    );

    const topCountries = inferenceService.getTopCountries(sessionData.nationalityDistribution, 3);
    logger.info('Nationality probabilities updated', {
      sessionId: sessionData.sessionId,
      confidence: (sessionData.nationalityConfidence * 100).toFixed(1) + '%',
      topCountries
    });

    // Check if we should transition to Phase 2
    const shouldTransition = 
      sessionData.nationalityConfidence >= config.adaptive.nationalityConfidenceThreshold ||
      sessionData.nationalityAnswers.length >= config.adaptive.maxNationalityQuestions;

    if (shouldTransition) {
      return await this.transitionToHeightPhase(sessionData);
    }

    // Continue with nationality questions
    const nextQuestion = questionService.selectNextQuestion(
      'nationality',
      sessionData.askedQuestions,
      sessionData.nationalityDistribution,
      sessionData.recentCategories
    );

    if (!nextQuestion) {
      // No more nationality questions, transition anyway
      return await this.transitionToHeightPhase(sessionData);
    }

    // Update session
    sessionData.askedQuestions.push(nextQuestion.id);
    sessionData.recentCategories.push(nextQuestion.category);
    await redisService.set(`session:${sessionData.sessionId}`, sessionData);

    return {
      completed: false,
      next_question: questionService.formatQuestionForResponse(nextQuestion),
      progress: {
        current: sessionData.askedQuestions.length,
        total: 20, // Estimated total
        questionsAsked: sessionData.askedQuestions.length,
        estimatedRemaining: '3-12'
      }
    };
  }

  /**
   * Transition from nationality phase to height phase
   * @param {object} sessionData - Session data
   * @returns {object} First height question
   */
  async transitionToHeightPhase(sessionData) {
    // Determine most likely country
    const determinedCountry = inferenceService.getMostLikelyCountry(
      sessionData.nationalityDistribution
    );
    
    // Get country data and base height
    const countryData = questionService.getCountryData(determinedCountry);
    const baseHeight = countryData ? countryData.avgHeight.overall : 170;

    sessionData.phase = 'height_relative';
    sessionData.determinedCountry = determinedCountry;
    sessionData.baseHeight = baseHeight;
    sessionData.heightAdjustment = 0;
    sessionData.heightCategoryProbs = inferenceService.updateHeightCategoryProbabilities(0);
    sessionData.recentCategories = []; // Reset for new phase

    logger.info('Transitioned to height phase', {
      sessionId: sessionData.sessionId,
      determinedCountry,
      confidence: (sessionData.nationalityConfidence * 100).toFixed(1) + '%',
      baseHeight,
      nationalityQuestionsAsked: sessionData.nationalityAnswers.length
    });

    // Get first height question
    const firstHeightQuestion = questionService.selectNextQuestion(
      'height_relative',
      sessionData.askedQuestions,
      null,
      sessionData.recentCategories
    );

    if (!firstHeightQuestion) {
      // No height questions available, complete quiz
      sessionData.completed = true;
      sessionData.completedAt = new Date().toISOString();
      await redisService.set(`session:${sessionData.sessionId}`, sessionData);
      
      return {
        completed: true,
        message: 'Quiz completed! Check your result.'
      };
    }

    sessionData.askedQuestions.push(firstHeightQuestion.id);
    sessionData.recentCategories.push(firstHeightQuestion.category);
    await redisService.set(`session:${sessionData.sessionId}`, sessionData);

    return {
      completed: false,
      next_question: questionService.formatQuestionForResponse(firstHeightQuestion),
      progress: {
        current: sessionData.askedQuestions.length,
        total: 20, // Estimated total
        questionsAsked: sessionData.askedQuestions.length,
        estimatedRemaining: '3-10'
      }
    };
  }

  /**
   * Process answer in height determination phase
   * @param {object} sessionData - Session data
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {object} Next question or completion
   */
  async processHeightAnswer(sessionData, questionId, answerId) {
    // Get answer details with height adjustment
    const answerDetails = questionService.getAnswerDetailsHeight(questionId, answerId);
    sessionData.heightAnswers.push(answerDetails);

    // Update height adjustment
    sessionData.heightAdjustment += answerDetails.heightAdjustment;

    // Update category probabilities
    sessionData.heightCategoryProbs = inferenceService.updateHeightCategoryProbabilities(
      sessionData.heightAdjustment
    );

    // Calculate confidence (max probability among categories)
    const heightConfidence = Math.max(...Object.values(sessionData.heightCategoryProbs));

    logger.info('Height adjustment updated', {
      sessionId: sessionData.sessionId,
      totalAdjustment: sessionData.heightAdjustment,
      confidence: (heightConfidence * 100).toFixed(1) + '%',
      topCategory: inferenceService.getFinalHeightCategory(sessionData.heightCategoryProbs)
    });

    // Check if we should complete the quiz
    const shouldComplete = 
      heightConfidence >= config.adaptive.heightConfidenceThreshold ||
      sessionData.heightAnswers.length >= config.adaptive.maxHeightQuestions;

    if (shouldComplete) {
      sessionData.completed = true;
      sessionData.completedAt = new Date().toISOString();
      await redisService.set(`session:${sessionData.sessionId}`, sessionData);
      
      logger.info('Quiz completed', {
        sessionId: sessionData.sessionId,
        totalQuestions: sessionData.askedQuestions.length,
        nationalityQuestions: sessionData.nationalityAnswers.length,
        heightQuestions: sessionData.heightAnswers.length,
        finalConfidence: (heightConfidence * 100).toFixed(1) + '%'
      });
      
      return {
        completed: true,
        message: 'Quiz completed! Check your result.'
      };
    }

    // Continue with height questions
    const nextQuestion = questionService.selectNextQuestion(
      'height_relative',
      sessionData.askedQuestions,
      null,
      sessionData.recentCategories
    );

    if (!nextQuestion) {
      // No more height questions, complete anyway
      sessionData.completed = true;
      sessionData.completedAt = new Date().toISOString();
      await redisService.set(`session:${sessionData.sessionId}`, sessionData);
      
      return {
        completed: true,
        message: 'Quiz completed! Check your result.'
      };
    }

    // Update session
    sessionData.askedQuestions.push(nextQuestion.id);
    sessionData.recentCategories.push(nextQuestion.category);
    await redisService.set(`session:${sessionData.sessionId}`, sessionData);

    return {
      completed: false,
      next_question: questionService.formatQuestionForResponse(nextQuestion),
      progress: {
        current: sessionData.askedQuestions.length,
        total: 20, // Estimated total
        questionsAsked: sessionData.askedQuestions.length,
        estimatedRemaining: Math.max(1, config.adaptive.maxHeightQuestions - sessionData.heightAnswers.length)
      }
    };
  }

  /**
   * Get quiz result with statistical analysis
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

      // Calculate final height
      const predictedHeightCm = heightService.calculateFinalHeight(
        sessionData.baseHeight,
        sessionData.heightAdjustment,
        sessionData.heightCategoryProbs
      );

      const formattedHeight = formatHeight(predictedHeightCm);
      const heightCategory = inferenceService.getFinalHeightCategory(sessionData.heightCategoryProbs);
      
      // Get country name
      const countryData = questionService.getCountryData(sessionData.determinedCountry);
      const countryName = countryData ? countryData.name : 'Unknown';

      // Generate insights
      const relativeToAvg = predictedHeightCm - sessionData.baseHeight;
      const relativeSign = relativeToAvg >= 0 ? '+' : '';
      
      logger.info('Result generated', { 
        sessionId, 
        height: predictedHeightCm,
        country: countryName,
        confidence: sessionData.nationalityConfidence 
      });

      return {
        height: {
          cm: predictedHeightCm,
          feet: formattedHeight.feet,
          inches: formattedHeight.inches,
          display: formattedHeight.display,
          category: heightCategory,
          categoryDescription: this.getCategoryDescription(heightCategory)
        },
        nationality: countryName,
        confidence: Math.round(sessionData.nationalityConfidence * 100),
        relativeHeight: this.getCategoryDescription(heightCategory).toLowerCase(),
        insights: {
          countryContext: `Based on your preferences, you seem to align with ${countryName} cultural patterns.`,
          heightContext: `You're ${this.getHeightPercentile(relativeToAvg)} than average in ${countryName}.`,
          relativeToAvg: `${relativeSign}${relativeToAvg.toFixed(1)}cm from average`
        },
        message: heightService.generateMessage(predictedHeightCm),
        questionsAsked: sessionData.askedQuestions.length,
        breakdown: {
          culturalQuestions: sessionData.nationalityAnswers.length,
          physicalQuestions: sessionData.heightAnswers.length
        },
        share_text: `I'm predicted to be ${formattedHeight.display} (${predictedHeightCm}cm) - ${this.getCategoryDescription(heightCategory)}! 🎯 #HeightQuiz`
      };
    } catch (error) {
      logger.error('Error getting result', { sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * Get category description
   * @param {string} category - Height category
   * @returns {string} Description
   */
  getCategoryDescription(category) {
    const descriptions = {
      'way_below': 'Way Below Average',
      'below': 'Below Average',
      'average': 'Average',
      'above': 'Above Average',
      'way_above': 'Way Above Average'
    };
    return descriptions[category] || 'Average';
  }

  /**
   * Get height percentile description
   * @param {number} diff - Difference from average
   * @returns {string} Description
   */
  getHeightPercentile(diff) {
    if (diff > 15) return 'significantly taller';
    if (diff > 5) return 'taller';
    if (diff > -5) return 'about the same height';
    if (diff > -15) return 'shorter';
    return 'significantly shorter';
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
