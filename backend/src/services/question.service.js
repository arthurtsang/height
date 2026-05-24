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
   * Get questions by phase
   * @param {string} phase - 'nationality' or 'height_relative'
   * @returns {Array} Questions for the phase
   */
  getQuestionsByPhase(phase) {
    return this.questions.filter(q => q.phase === phase);
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
   * Select next question using information gain
   * @param {string} phase - Current phase ('nationality' or 'height_relative')
   * @param {Array<string>} askedQuestionIds - Already asked question IDs
   * @param {object} currentDistribution - Current probability distribution (for nationality phase)
   * @param {Array<string>} recentCategories - Recently asked categories
   * @returns {object|null} Next question or null if no more questions
   */
  selectNextQuestion(phase, askedQuestionIds, currentDistribution = null, recentCategories = []) {
    try {
      // Get available questions for this phase
      const phaseQuestions = this.getQuestionsByPhase(phase);
      const availableQuestions = phaseQuestions.filter(q => !askedQuestionIds.includes(q.id));

      if (availableQuestions.length === 0) {
        logger.warn('No more questions available', { phase, askedCount: askedQuestionIds.length });
        return null;
      }

      // For nationality phase, use information gain
      if (phase === 'nationality' && currentDistribution) {
        return inferenceService.selectNextQuestion(
          availableQuestions,
          currentDistribution,
          recentCategories
        );
      }

      // For height phase, select by precomputed IG or randomly
      if (phase === 'height_relative') {
        // Sort by precomputed information gain if available
        const sorted = availableQuestions.sort((a, b) => {
          const igA = a.precomputedIG || 0;
          const igB = b.precomputedIG || 0;
          return igB - igA;
        });
        
        // Add some randomness to top questions
        const topQuestions = sorted.slice(0, Math.min(3, sorted.length));
        return topQuestions[Math.floor(Math.random() * topQuestions.length)];
      }

      // Fallback: random selection
      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    } catch (error) {
      logger.error('Error selecting next question', { error: error.message, phase });
      throw error;
    }
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
   * Get answer details for nationality phase
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {object} Answer details with country weights
   */
  getAnswerDetailsNationality(questionId, answerId) {
    const question = this.getQuestionById(questionId);
    const answer = question.options.find(opt => opt.id === answerId);
    
    if (!answer) {
      throw new Error(`Answer not found: ${answerId} for question ${questionId}`);
    }

    return {
      questionId,
      answerId,
      category: question.category,
      countryWeights: answer.countryWeights || {}
    };
  }

  /**
   * Get answer details for height phase
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {object} Answer details with height adjustment
   */
  getAnswerDetailsHeight(questionId, answerId) {
    const question = this.getQuestionById(questionId);
    const answer = question.options.find(opt => opt.id === answerId);
    
    if (!answer) {
      throw new Error(`Answer not found: ${answerId} for question ${questionId}`);
    }

    return {
      questionId,
      answerId,
      category: question.category,
      heightAdjustment: answer.heightAdjustment || 0,
      confidence: answer.confidence || 0.5
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
   * Get question count by phase
   * @param {string} phase - Phase name
   * @returns {number} Question count
   */
  getQuestionCountByPhase(phase) {
    return this.questions.filter(q => q.phase === phase).length;
  }
}

module.exports = new QuestionService();

// Made with Bob
