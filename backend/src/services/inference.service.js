/**
 * Statistical Inference Service
 * 
 * Implements Bayesian inference and information gain calculations
 * for adaptive question selection in the height prediction quiz.
 */

const logger = require('../utils/logger');

class InferenceService {
  /**
   * Initialize uniform probability distribution across all countries
   * @param {Array<string>} countryCodes - List of country codes
   * @returns {Object} Uniform distribution
   */
  initializeUniformDistribution(countryCodes) {
    const prob = 1.0 / countryCodes.length;
    const distribution = {};
    
    for (const code of countryCodes) {
      distribution[code] = prob;
    }
    
    logger.debug('Initialized uniform distribution', { 
      countries: countryCodes.length,
      probability: prob 
    });
    
    return distribution;
  }

  /**
   * Update probability distribution using Bayesian inference
   * 
   * Formula: P(Country|Answer) = P(Answer|Country) × P(Country) / P(Answer)
   * 
   * @param {Object} currentDistribution - Current probability distribution
   * @param {Object} countryWeights - Likelihood P(Answer|Country) for each country
   * @returns {Object} Updated probability distribution
   */
  bayesianUpdate(currentDistribution, countryWeights) {
    const newDistribution = {};
    let sum = 0;
    
    // Step 1: Calculate unnormalized probabilities
    for (const [country, currentProb] of Object.entries(currentDistribution)) {
      // P(Answer|Country) - likelihood from question option
      const likelihood = countryWeights[country] || 0.01; // Small default for missing countries
      
      // P(Country|Answer) ∝ P(Answer|Country) × P(Country)
      newDistribution[country] = likelihood * currentProb;
      sum += newDistribution[country];
    }
    
    // Step 2: Normalize to ensure probabilities sum to 1.0
    if (sum > 0) {
      for (const country in newDistribution) {
        newDistribution[country] /= sum;
      }
    } else {
      // Fallback to uniform if all probabilities are zero
      logger.warn('All probabilities zero after update, reverting to uniform');
      return this.initializeUniformDistribution(Object.keys(currentDistribution));
    }
    
    // Validate
    const finalSum = Object.values(newDistribution).reduce((a, b) => a + b, 0);
    if (Math.abs(finalSum - 1.0) > 0.001) {
      logger.error('Probability distribution does not sum to 1.0', { sum: finalSum });
    }
    
    logger.debug('Bayesian update complete', {
      topCountries: this.getTopCountries(newDistribution, 3)
    });
    
    return newDistribution;
  }

  /**
   * Calculate entropy of a probability distribution
   * 
   * Formula: H = -Σ P(country) × log2(P(country))
   * 
   * Higher entropy = more uncertainty
   * Lower entropy = more certainty
   * 
   * @param {Object} distribution - Probability distribution
   * @returns {number} Entropy value
   */
  calculateEntropy(distribution) {
    let entropy = 0;
    
    for (const prob of Object.values(distribution)) {
      if (prob > 0) {
        entropy -= prob * Math.log2(prob);
      }
    }
    
    return entropy;
  }

  /**
   * Calculate expected information gain for a question
   * 
   * Formula: IG(Q) = H(current) - Σ P(answer) × H(after_answer)
   * 
   * @param {Object} question - Question with options containing countryWeights
   * @param {Object} currentDistribution - Current probability distribution
   * @returns {number} Information gain value
   */
  calculateInformationGain(question, currentDistribution) {
    // Current entropy (uncertainty before asking question)
    const currentEntropy = this.calculateEntropy(currentDistribution);
    
    // Calculate expected entropy after asking question
    let expectedEntropy = 0;
    
    for (const option of question.options) {
      // Simulate choosing this option
      const newDistribution = this.bayesianUpdate(
        currentDistribution, 
        option.countryWeights
      );
      
      // Calculate entropy after this answer
      const newEntropy = this.calculateEntropy(newDistribution);
      
      // Weight by probability of choosing this option
      const optionProbability = this.calculateOptionProbability(
        option, 
        currentDistribution
      );
      
      expectedEntropy += optionProbability * newEntropy;
    }
    
    // Information gain = reduction in entropy
    const informationGain = currentEntropy - expectedEntropy;
    
    logger.debug('Information gain calculated', {
      questionId: question.id,
      currentEntropy: currentEntropy.toFixed(3),
      expectedEntropy: expectedEntropy.toFixed(3),
      informationGain: informationGain.toFixed(3)
    });
    
    return informationGain;
  }

  /**
   * Calculate probability of selecting a specific option
   * given current country distribution
   * 
   * @param {Object} option - Question option with countryWeights
   * @param {Object} currentDistribution - Current probability distribution
   * @returns {number} Probability of selecting this option
   */
  calculateOptionProbability(option, currentDistribution) {
    let probability = 0;
    
    for (const [country, countryProb] of Object.entries(currentDistribution)) {
      const weight = option.countryWeights[country] || 0.01;
      probability += countryProb * weight;
    }
    
    return probability;
  }

  /**
   * Get confidence level (probability of most likely country)
   * 
   * @param {Object} distribution - Probability distribution
   * @returns {number} Confidence (0-1)
   */
  getConfidence(distribution) {
    return Math.max(...Object.values(distribution));
  }

  /**
   * Get top N countries by probability
   * 
   * @param {Object} distribution - Probability distribution
   * @param {number} n - Number of top countries to return
   * @returns {Array<Object>} Top countries with probabilities
   */
  getTopCountries(distribution, n = 3) {
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([country, probability]) => ({
        country,
        probability: Math.round(probability * 1000) / 1000
      }));
  }

  /**
   * Get most likely country
   * 
   * @param {Object} distribution - Probability distribution
   * @returns {string} Country code with highest probability
   */
  getMostLikelyCountry(distribution) {
    let maxProb = 0;
    let mostLikely = null;
    
    for (const [country, prob] of Object.entries(distribution)) {
      if (prob > maxProb) {
        maxProb = prob;
        mostLikely = country;
      }
    }
    
    return mostLikely;
  }

  /**
   * Select next question based on information gain
   * 
   * @param {Array<Object>} availableQuestions - Questions not yet asked
   * @param {Object} currentDistribution - Current probability distribution
   * @param {Array<string>} recentCategories - Recently asked categories (for diversity)
   * @returns {Object} Selected question
   */
  selectNextQuestion(availableQuestions, currentDistribution, recentCategories = []) {
    if (availableQuestions.length === 0) {
      throw new Error('No available questions');
    }
    
    let bestQuestion = null;
    let bestScore = -Infinity;
    
    for (const question of availableQuestions) {
      // Calculate information gain
      const ig = this.calculateInformationGain(question, currentDistribution);
      
      // Category diversity bonus (avoid asking same category repeatedly)
      const categoryBonus = this.calculateCategoryDiversityBonus(
        question.category, 
        recentCategories
      );
      
      // Recency penalty (avoid similar questions in succession)
      const recencyPenalty = this.calculateRecencyPenalty(
        question.category, 
        recentCategories
      );
      
      // Combined score: IG (60%) + diversity (20%) - recency (20%)
      const score = (ig * 0.6) + (categoryBonus * 0.2) - (recencyPenalty * 0.2);
      
      if (score > bestScore) {
        bestScore = score;
        bestQuestion = question;
      }
    }
    
    logger.info('Question selected', {
      questionId: bestQuestion.id,
      category: bestQuestion.category,
      score: bestScore.toFixed(3)
    });
    
    return bestQuestion;
  }

  /**
   * Calculate category diversity bonus
   * Encourages asking questions from different categories
   * 
   * @param {string} category - Question category
   * @param {Array<string>} recentCategories - Recently asked categories
   * @returns {number} Bonus score (0-1)
   */
  calculateCategoryDiversityBonus(category, recentCategories) {
    const recentCount = recentCategories.filter(c => c === category).length;
    
    // More recent occurrences = lower bonus
    if (recentCount === 0) return 1.0;
    if (recentCount === 1) return 0.5;
    if (recentCount === 2) return 0.2;
    return 0.0;
  }

  /**
   * Calculate recency penalty
   * Penalizes asking same category consecutively
   * 
   * @param {string} category - Question category
   * @param {Array<string>} recentCategories - Recently asked categories (last 3)
   * @returns {number} Penalty score (0-1)
   */
  calculateRecencyPenalty(category, recentCategories) {
    if (recentCategories.length === 0) return 0;
    
    // Check last 3 questions
    const last3 = recentCategories.slice(-3);
    
    // Heavy penalty if same as last question
    if (last3[last3.length - 1] === category) return 0.8;
    
    // Medium penalty if same as 2nd to last
    if (last3.length >= 2 && last3[last3.length - 2] === category) return 0.4;
    
    // Light penalty if same as 3rd to last
    if (last3.length >= 3 && last3[last3.length - 3] === category) return 0.2;
    
    return 0;
  }

  /**
   * Update height category probabilities based on adjustment
   * Uses Gaussian distribution centered on total adjustment
   * 
   * @param {number} totalAdjustment - Cumulative height adjustment in cm
   * @returns {Object} Category probabilities
   */
  updateHeightCategoryProbabilities(totalAdjustment) {
    const categories = ['way_below', 'below', 'average', 'above', 'way_above'];
    const centers = {
      'way_below': -20,
      'below': -10,
      'average': 0,
      'above': 10,
      'way_above': 20
    };
    
    const sigma = 8; // Standard deviation
    const probabilities = {};
    let sum = 0;
    
    // Calculate unnormalized probabilities using Gaussian
    for (const category of categories) {
      const center = centers[category];
      const distance = Math.abs(totalAdjustment - center);
      probabilities[category] = Math.exp(-(distance * distance) / (2 * sigma * sigma));
      sum += probabilities[category];
    }
    
    // Normalize
    for (const category in probabilities) {
      probabilities[category] /= sum;
    }
    
    logger.debug('Height category probabilities updated', {
      totalAdjustment,
      probabilities: Object.entries(probabilities)
        .map(([cat, prob]) => `${cat}: ${(prob * 100).toFixed(1)}%`)
        .join(', ')
    });
    
    return probabilities;
  }

  /**
   * Determine final height category
   * 
   * @param {Object} categoryProbabilities - Probabilities for each category
   * @returns {string} Most likely category
   */
  getFinalHeightCategory(categoryProbabilities) {
    let maxProb = 0;
    let category = 'average';
    
    for (const [cat, prob] of Object.entries(categoryProbabilities)) {
      if (prob > maxProb) {
        maxProb = prob;
        category = cat;
      }
    }
    
    return category;
  }
}

module.exports = new InferenceService();

// Made with Bob
