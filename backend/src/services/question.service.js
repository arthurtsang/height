const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const inferenceService = require('./inference.service');

class QuestionService {
  constructor() {
    this.questions = [];
    this.countryStats = null;
    this.loadData();
  }

  /**
   * Load questions and country statistics from JSON files
   */
  loadData() {
    try {
      // Load enhanced question bank
      const questionsPath = path.join(__dirname, '../data/question-bank-enhanced.json');
      const questionsData = fs.readFileSync(questionsPath, 'utf8');
      const parsed = JSON.parse(questionsData);
      this.questions = parsed.questions || [];
      logger.info(`Loaded ${this.questions.length} questions from enhanced bank`);

      // Load country statistics
      const statsPath = path.join(__dirname, '../data/country-statistics.json');
      const statsData = fs.readFileSync(statsPath, 'utf8');
      this.countryStats = JSON.parse(statsData);
      logger.info(`Loaded statistics for ${this.countryStats.countries.length} countries`);
    } catch (error) {
      logger.error('Failed to load data', { error: error.message });
      this.questions = [];
      this.countryStats = null;
    }
  }

  /**
   * Get all country codes from statistics
   * @returns {Array<string>} Array of country codes
   */
  getCountryCodes() {
    if (!this.countryStats || !this.countryStats.countries) {
      return [];
    }
    return this.countryStats.countries.map(c => c.code);
  }

  /**
   * Get country data by code
   * @param {string} countryCode - Country code (e.g., 'US')
   * @returns {object|null} Country data
   */
  getCountryData(countryCode) {
    if (!this.countryStats || !this.countryStats.countries) {
      return null;
    }
    return this.countryStats.countries.find(c => c.code === countryCode);
  }

  /**
   * Get all country statistics
   * @returns {object} Country statistics object
   */
  getCountryStatistics() {
    return this.countryStats;
  }

  /**
   * Get question by ID
   * @param {string} questionId - Question ID
   * @returns {object} Question object
   */
  getQuestionById(questionId) {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error(`Question not found: ${questionId}`);
    }
    return question;
  }

  /**
   * Select next question using unified information gain across all attributes
   * @param {Array<string>} askedQuestionIds - Already asked question IDs
   * @param {object} attributeDistributions - Current distributions for all attributes
   * @param {Array<string>} recentCategories - Recently asked categories
   * @returns {object|null} Next question or null if no more questions
   */
  selectNextQuestion(askedQuestionIds, attributeDistributions, recentCategories = []) {
    try {
      // Get available questions
      const availableQuestions = this.questions.filter(q => !askedQuestionIds.includes(q.id));

      if (availableQuestions.length === 0) {
        logger.warn('No more questions available', { askedCount: askedQuestionIds.length });
        return null;
      }

      // Calculate information gain for each question across all attributes
      const questionsWithIG = availableQuestions.map(question => {
        let maxIG = 0;
        let bestAttribute = null;

        // Check IG for each attribute
        for (const [attribute, distribution] of Object.entries(attributeDistributions)) {
          const ig = this.calculateQuestionIG(question, distribution, attribute);
          if (ig > maxIG) {
            maxIG = ig;
            bestAttribute = attribute;
          }
        }

        return {
          question,
          informationGain: maxIG,
          bestAttribute,
          category: question.category
        };
      });

      // Sort by information gain
      questionsWithIG.sort((a, b) => b.informationGain - a.informationGain);

      // Apply diversity penalty for recently used categories
      const diversityWeight = 0.2;
      questionsWithIG.forEach(item => {
        if (recentCategories.includes(item.category)) {
          const penalty = recentCategories.indexOf(item.category) + 1;
          item.informationGain *= (1 - diversityWeight * (penalty / recentCategories.length));
        }
      });

      // Re-sort after diversity adjustment
      questionsWithIG.sort((a, b) => b.informationGain - a.informationGain);

      // Add some randomness to top 3 questions
      const topQuestions = questionsWithIG.slice(0, Math.min(3, questionsWithIG.length));
      const selected = topQuestions[Math.floor(Math.random() * topQuestions.length)];

      logger.info('Selected question', {
        questionId: selected.question.id,
        informationGain: selected.informationGain.toFixed(3),
        bestAttribute: selected.bestAttribute,
        category: selected.category
      });

      return selected.question;
    } catch (error) {
      logger.error('Error selecting next question', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate information gain for a question on a specific attribute
   * @param {object} question - Question object
   * @param {object} distribution - Current probability distribution for the attribute
   * @param {string} attribute - Attribute name (nationality, sex, age_group, height_deviation)
   * @returns {number} Information gain
   */
  calculateQuestionIG(question, distribution, attribute) {
    // Current entropy
    const currentEntropy = inferenceService.calculateEntropy(distribution);

    // Calculate expected entropy after asking this question
    let expectedEntropy = 0;
    const totalProb = Object.values(distribution).reduce((sum, p) => sum + p, 0);

    question.options.forEach(option => {
      // Get weights for this attribute from the option
      const weights = option.weights?.[attribute] || {};
      
      if (Object.keys(weights).length === 0) {
        return; // Skip if no weights for this attribute
      }

      // Simulate posterior distribution for this answer
      const posterior = {};
      let posteriorSum = 0;

      for (const [value, prior] of Object.entries(distribution)) {
        const weight = weights[value] || 0;
        // Bayesian update: posterior ∝ prior × likelihood
        posterior[value] = prior * (weight / 100);
        posteriorSum += posterior[value];
      }

      // Normalize
      if (posteriorSum > 0) {
        for (const value in posterior) {
          posterior[value] /= posteriorSum;
        }
      }

      // Calculate entropy of this posterior
      const posteriorEntropy = inferenceService.calculateEntropy(posterior);

      // Weight by probability of choosing this answer (assume uniform for now)
      const answerProb = 1 / question.options.length;
      expectedEntropy += answerProb * posteriorEntropy;
    });

    // Information gain = current entropy - expected entropy
    return Math.max(0, currentEntropy - expectedEntropy);
  }

  /**
   * Format question for API response (hide internal data)
   * @param {object} question - Question object
   * @returns {object} Formatted question
   */
  formatQuestionForResponse(question) {
    return {
      id: question.id,
      text: question.text,
      category: question.category,
      options: question.options.map(opt => ({
        id: opt.id,
        text: opt.text
      }))
    };
  }

  /**
   * Get answer details with multi-attribute weights
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {object} Answer details with weights for all attributes
   */
  getAnswerDetails(questionId, answerId) {
    const question = this.getQuestionById(questionId);
    const answer = question.options.find(opt => opt.id === answerId);
    
    if (!answer) {
      throw new Error(`Answer not found: ${answerId} for question ${questionId}`);
    }

    return {
      questionId,
      answerId,
      text: answer.text,
      category: question.category,
      weights: answer.weights || {
        nationality: {},
        sex: {},
        age_group: {},
        height_deviation: {}
      }
    };
  }

  /**
   * Get total number of questions available
   * @returns {number} Total questions
   */
  getTotalQuestions() {
    return this.questions.length;
  }

  /**
   * Get questions that can help determine a specific attribute
   * @param {string} attribute - Attribute name
   * @returns {Array} Questions with weights for this attribute
   */
  getQuestionsForAttribute(attribute) {
    return this.questions.filter(q => {
      return q.options.some(opt => {
        const weights = opt.weights?.[attribute];
        return weights && Object.keys(weights).length > 0;
      });
    });
  }
}

module.exports = new QuestionService();

// Made with Bob
