const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const config = require('../config');

class QuestionService {
  constructor() {
    this.questions = [];
    this.loadQuestions();
  }

  /**
   * Load questions from JSON file
   */
  loadQuestions() {
    try {
      const questionsPath = path.join(__dirname, '../data/questions.json');
      const data = fs.readFileSync(questionsPath, 'utf8');
      const parsed = JSON.parse(data);
      this.questions = parsed.questions || [];
      logger.info(`Loaded ${this.questions.length} questions`);
    } catch (error) {
      logger.error('Failed to load questions', { error: error.message });
      this.questions = [];
    }
  }

  /**
   * Get questions for a new session
   * @returns {Array} Array of question IDs in order
   */
  selectQuestionsForSession() {
    const totalQuestions = config.questions.totalPerSession;
    const minCultural = config.questions.minCulturalQuestions;

    // Separate cultural and other questions
    const culturalQuestions = this.questions.filter(q => 
      q.category === 'cuisine' || 
      q.category === 'culture' || 
      q.type === 'nationality_indicator'
    );

    const otherQuestions = this.questions.filter(q => 
      q.category !== 'cuisine' && 
      q.category !== 'culture' && 
      q.type !== 'nationality_indicator'
    );

    // Select cultural questions (first few)
    const selectedCultural = this.shuffleArray(culturalQuestions)
      .slice(0, minCultural);

    // Select remaining questions
    const remainingCount = totalQuestions - minCultural;
    const selectedOthers = this.shuffleArray(otherQuestions)
      .slice(0, remainingCount);

    // Combine: cultural first, then others
    const selectedQuestions = [
      ...selectedCultural,
      ...selectedOthers
    ];

    return selectedQuestions.map(q => q.id);
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
   * Format question for API response (hide scores)
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
   * Get answer details including score
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {object} Answer details with score
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
      score: answer.score || 0,
      baseHeight: answer.baseHeight || null,
      regionBonus: answer.regionBonus || 0
    };
  }

  /**
   * Shuffle array (Fisher-Yates algorithm)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get total number of questions available
   * @returns {number} Total questions
   */
  getTotalQuestions() {
    return this.questions.length;
  }
}

module.exports = new QuestionService();

// Made with Bob
