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
   * Create a new quiz session with multi-attribute tracking
   * @returns {object} Session data with first question
   */
  async createSession() {
    try {
      const sessionId = uuidv4();
      
      // Initialize distributions for all 4 attributes
      const countryCodes = questionService.getCountryCodes();
      const nationalityDistribution = inferenceService.initializeUniformDistribution(countryCodes);
      const sexDistribution = { male: 0.5, female: 0.5 };
      const ageGroupDistribution = { child: 0.25, teen: 0.25, adult: 0.25, senior: 0.25 };
      const heightDeviationDistribution = {
        way_below: 0.2,
        below: 0.2,
        average: 0.2,
        above: 0.2,
        way_above: 0.2
      };
      
      const sessionData = {
        sessionId,
        askedQuestions: [],
        recentCategories: [],
        
        // Multi-attribute tracking
        attributes: {
          nationality: {
            distribution: nationalityDistribution,
            confidence: 1.0 / countryCodes.length,
            threshold: config.adaptive.nationalityConfidenceThreshold || 0.90,
            determined: null
          },
          sex: {
            distribution: sexDistribution,
            confidence: 0.5,
            threshold: 0.90,
            determined: null
          },
          age_group: {
            distribution: ageGroupDistribution,
            confidence: 0.25,
            threshold: 0.90,
            determined: null
          },
          height_deviation: {
            distribution: heightDeviationDistribution,
            confidence: 0.2,
            threshold: 0.85,
            determined: null
          }
        },
        
        answers: [],
        createdAt: new Date().toISOString(),
        completed: false
      };

      await redisService.set(`session:${sessionId}`, sessionData);
      
      logger.info('Multi-attribute session created', {
        sessionId,
        attributes: Object.keys(sessionData.attributes)
      });

      // Get first question using unified information gain
      const firstQuestion = questionService.selectNextQuestion(
        sessionData.askedQuestions,
        sessionData.attributes,
        sessionData.recentCategories
      );
      
      if (!firstQuestion) {
        throw new Error('No questions available');
      }

      sessionData.askedQuestions.push(firstQuestion.id);
      sessionData.recentCategories.push(firstQuestion.category);
      await redisService.set(`session:${sessionId}`, sessionData);

      // Calculate average confidence across all attributes
      const avgConfidence = this.calculateAverageConfidence(sessionData.attributes);

      return {
        session_id: sessionId,
        question: questionService.formatQuestionForResponse(firstQuestion),
        progress: {
          current: 1,
          total: config.adaptive.maxQuestions || 25,
          questionsAsked: 1,
          averageConfidence: Math.round(avgConfidence * 100),
          confidenceBreakdown: {
            nationality: Math.round(sessionData.attributes.nationality.confidence * 100),
            sex: Math.round(sessionData.attributes.sex.confidence * 100),
            age: Math.round(sessionData.attributes.age_group.confidence * 100),
            height: Math.round(sessionData.attributes.height_deviation.confidence * 100)
          }
        }
      };
    } catch (error) {
      logger.error('Error creating session', { error: error.message });
      throw error;
    }
  }

  /**
   * Submit an answer and get next question (multi-attribute system)
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
        questionsAsked: sessionData.askedQuestions.length
      });

      // Get answer details with weights for all attributes
      const answerDetails = questionService.getAnswerDetails(questionId, answerId);
      sessionData.answers.push(answerDetails);

      // Update all attribute distributions based on answer weights
      this.updateAttributeDistributions(sessionData, answerDetails);

      // Calculate average confidence
      const avgConfidence = this.calculateAverageConfidence(sessionData.attributes);

      logger.info('Attributes updated', {
        sessionId,
        avgConfidence: (avgConfidence * 100).toFixed(1) + '%',
        nationality: (sessionData.attributes.nationality.confidence * 100).toFixed(1) + '%',
        sex: (sessionData.attributes.sex.confidence * 100).toFixed(1) + '%',
        age_group: (sessionData.attributes.age_group.confidence * 100).toFixed(1) + '%',
        height_deviation: (sessionData.attributes.height_deviation.confidence * 100).toFixed(1) + '%'
      });

      // Check if we should complete the quiz
      const shouldComplete = this.shouldCompleteQuiz(sessionData);

      if (shouldComplete) {
        sessionData.completed = true;
        sessionData.completedAt = new Date().toISOString();
        
        // Determine final values for all attributes
        for (const [attrName, attrData] of Object.entries(sessionData.attributes)) {
          attrData.determined = inferenceService.getMostLikelyValue(attrData.distribution);
        }
        
        await redisService.set(`session:${sessionData.sessionId}`, sessionData);
        
        logger.info('Quiz completed', {
          sessionId,
          totalQuestions: sessionData.askedQuestions.length,
          finalConfidence: (avgConfidence * 100).toFixed(1) + '%'
        });
        
        return {
          completed: true,
          message: 'Quiz completed! Check your result.'
        };
      }

      // Continue with more questions
      const nextQuestion = questionService.selectNextQuestion(
        sessionData.askedQuestions,
        sessionData.attributes,
        sessionData.recentCategories
      );

      if (!nextQuestion) {
        // No more questions, complete anyway
        sessionData.completed = true;
        sessionData.completedAt = new Date().toISOString();
        
        for (const [attrName, attrData] of Object.entries(sessionData.attributes)) {
          attrData.determined = inferenceService.getMostLikelyValue(attrData.distribution);
        }
        
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
          total: config.adaptive.maxQuestions || 25,
          questionsAsked: sessionData.askedQuestions.length,
          averageConfidence: Math.round(avgConfidence * 100),
          confidenceBreakdown: {
            nationality: Math.round(sessionData.attributes.nationality.confidence * 100),
            sex: Math.round(sessionData.attributes.sex.confidence * 100),
            age: Math.round(sessionData.attributes.age_group.confidence * 100),
            height: Math.round(sessionData.attributes.height_deviation.confidence * 100)
          }
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
   * Update attribute distributions based on answer weights
   * @param {object} sessionData - Session data
   * @param {object} answerDetails - Answer details with weights
   */
  updateAttributeDistributions(sessionData, answerDetails) {
    const weights = answerDetails.weights || {};
    
    // Update each attribute that has weights in the answer
    for (const [attrName, attrWeights] of Object.entries(weights)) {
      if (sessionData.attributes[attrName]) {
        // Convert weights from 0-100 scale to 0-1 probabilities
        const normalizedWeights = {};
        for (const [value, weight] of Object.entries(attrWeights)) {
          normalizedWeights[value] = weight / 100;
        }
        
        // Update distribution using Bayesian inference
        sessionData.attributes[attrName].distribution = inferenceService.bayesianUpdate(
          sessionData.attributes[attrName].distribution,
          normalizedWeights
        );
        
        // Update confidence
        sessionData.attributes[attrName].confidence = inferenceService.getConfidence(
          sessionData.attributes[attrName].distribution
        );
      }
    }
  }

  /**
   * Calculate average confidence across all attributes
   * @param {object} attributes - Attributes object
   * @returns {number} Average confidence (0-1)
   */
  calculateAverageConfidence(attributes) {
    const confidences = Object.values(attributes).map(attr => attr.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  /**
   * Check if quiz should be completed
   * @param {object} sessionData - Session data
   * @returns {boolean} True if should complete
   */
  shouldCompleteQuiz(sessionData) {
    // Check if max questions reached
    const maxQuestions = config.adaptive.maxQuestions || 25;
    if (sessionData.askedQuestions.length >= maxQuestions) {
      return true;
    }
    
    // Check if all attributes have reached their thresholds
    let allAttributesConfident = true;
    for (const [attrName, attrData] of Object.entries(sessionData.attributes)) {
      if (attrData.confidence < attrData.threshold) {
        allAttributesConfident = false;
        break;
      }
    }
    
    return allAttributesConfident;
  }

  /**
   * REMOVED: Old phase-based methods no longer needed
   * The multi-attribute system handles all processing in submitAnswer()
   */

  /**
   * Get quiz result with multi-attribute statistical analysis
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

      // Determine final values for all attributes
      const nationality = inferenceService.getMostLikelyValue(
        sessionData.attributes.nationality.distribution
      );
      const sex = inferenceService.getMostLikelyValue(
        sessionData.attributes.sex.distribution
      );
      const ageGroup = inferenceService.getMostLikelyValue(
        sessionData.attributes.age_group.distribution
      );
      const heightDeviation = inferenceService.getMostLikelyValue(
        sessionData.attributes.height_deviation.distribution
      );

      // Get country statistics
      const countryStats = questionService.getCountryStatistics();

      // Calculate final height using all 4 attributes
      const predictedHeightCm = heightService.calculateHeightFromAttributes(
        nationality,
        sex,
        ageGroup,
        heightDeviation,
        countryStats
      );

      const formattedHeight = formatHeight(predictedHeightCm);
      
      // Get country name
      const countryData = questionService.getCountryData(nationality);
      const countryName = countryData ? countryData.name : 'Unknown';

      // Get confidences
      const nationalityConfidence = sessionData.attributes.nationality.confidence;
      const sexConfidence = sessionData.attributes.sex.confidence;
      const ageConfidence = sessionData.attributes.age_group.confidence;
      const heightConfidence = sessionData.attributes.height_deviation.confidence;

      // Calculate average confidence
      const avgConfidence = (nationalityConfidence + sexConfidence + ageConfidence + heightConfidence) / 4;

      // Get base height for comparison
      const countryDataFull = countryStats.countries.find(c => c.code === nationality);
      let baseHeight = 170; // default
      if (countryDataFull && countryDataFull.avgHeight.byAge && countryDataFull.avgHeight.byAge[ageGroup]) {
        baseHeight = countryDataFull.avgHeight.byAge[ageGroup][sex];
      } else if (countryDataFull && countryDataFull.avgHeight[sex]) {
        baseHeight = countryDataFull.avgHeight[sex];
      }

      const relativeToAvg = predictedHeightCm - baseHeight;
      const relativeSign = relativeToAvg >= 0 ? '+' : '';
      
      logger.info('Multi-attribute result generated', {
        sessionId,
        height: predictedHeightCm,
        nationality: countryName,
        sex,
        ageGroup,
        heightDeviation,
        avgConfidence: (avgConfidence * 100).toFixed(1) + '%'
      });

      return {
        height: {
          cm: predictedHeightCm,
          feet: formattedHeight.feet,
          inches: formattedHeight.inches,
          display: formattedHeight.display,
          category: heightDeviation,
          categoryDescription: this.getCategoryDescription(heightDeviation)
        },
        nationality: countryName,
        confidence: Math.round(avgConfidence * 100),
        demographics: {
          sex: sex,
          ageGroup: ageGroup
        },
        confidenceBreakdown: {
          nationality: Math.round(nationalityConfidence * 100),
          sex: Math.round(sexConfidence * 100),
          age: Math.round(ageConfidence * 100),
          height: Math.round(heightConfidence * 100)
        },
        relativeHeight: this.getCategoryDescription(heightDeviation).toLowerCase(),
        insights: {
          countryContext: `Based on your preferences, you seem to align with ${countryName} cultural patterns.`,
          heightContext: `You're ${this.getHeightPercentile(relativeToAvg)} than average for a ${sex} ${ageGroup} in ${countryName}.`,
          relativeToAvg: `${relativeSign}${relativeToAvg.toFixed(1)}cm from average`
        },
        message: heightService.generateMessage(predictedHeightCm),
        questionsAsked: sessionData.askedQuestions.length,
        share_text: `I'm predicted to be ${formattedHeight.display} (${predictedHeightCm}cm) - ${this.getCategoryDescription(heightDeviation)}! 🎯 #HeightQuiz`
      };
    } catch (error) {
      logger.error('Error getting result', { sessionId, error: error.message });
      throw error;
    }
  }

  /**
   * LEGACY - Process answer in nationality identification phase (REMOVED)
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
   * LEGACY - Process answer in height determination phase (REMOVED)
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
    // This method is no longer used in multi-attribute system
    throw new Error('Legacy method - use multi-attribute system instead');
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
