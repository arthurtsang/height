const logger = require('../utils/logger');

class HeightService {
  /**
   * Calculate final height using base height and adjustments
   * @param {number} baseHeight - Base height from country average
   * @param {number} heightAdjustment - Total height adjustment from answers
   * @param {object} categoryProbs - Category probabilities
   * @returns {number} Predicted height in centimeters
   */
  calculateFinalHeight(baseHeight, heightAdjustment, categoryProbs) {
    try {
      // Add small random factor for variety (±2cm)
      const randomFactor = Math.random() * 4 - 2;
      
      // Calculate final height
      let finalHeight = baseHeight + heightAdjustment + randomFactor;
      
      // Clamp to reasonable range (147cm to 208cm / 4'10" to 6'10")
      finalHeight = Math.max(147, Math.min(208, finalHeight));
      
      const roundedHeight = Math.round(finalHeight);
      
      logger.info('Final height calculated', {
        baseHeight,
        heightAdjustment,
        randomFactor: randomFactor.toFixed(2),
        finalHeight: roundedHeight
      });
      
      return roundedHeight;
    } catch (error) {
      logger.error('Error calculating final height', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate height based on user answers (legacy method for backward compatibility)
   * @param {Array} answers - Array of answer objects with questionId and score/baseHeight
   * @returns {number} Predicted height in centimeters
   */
  calculateHeight(answers) {
    try {
      // 1. Get base height from cultural questions (first few answers)
      const baseHeight = this.getBaseHeight(answers);
      logger.info('Base height determined', { baseHeight });

      // 2. Calculate adjustments from physical indicators
      const adjustments = this.calculateAdjustments(answers);
      logger.info('Height adjustments calculated', { adjustments });

      // 3. Add random factor for variety (±3cm)
      const randomFactor = Math.random() * 6 - 3;

      // 4. Calculate final height
      let finalHeight = baseHeight + adjustments + randomFactor;

      // 5. Clamp to reasonable range (147cm to 208cm / 4'10" to 6'10")
      finalHeight = Math.max(147, Math.min(208, finalHeight));

      const roundedHeight = Math.round(finalHeight);
      logger.info('Final height calculated', { 
        baseHeight, 
        adjustments, 
        randomFactor: randomFactor.toFixed(2), 
        finalHeight: roundedHeight 
      });

      return roundedHeight;
    } catch (error) {
      logger.error('Error calculating height', { error: error.message });
      throw error;
    }
  }

  /**
   * Determine base height from cultural/nationality indicators
   * @param {Array} answers - User answers
   * @returns {number} Base height in cm
   */
  getBaseHeight(answers) {
    // Look for answers with baseHeight property (cultural questions)
    const culturalAnswers = answers.filter(a => a.baseHeight);
    
    if (culturalAnswers.length > 0) {
      // Use the first cultural answer's base height
      const baseHeight = culturalAnswers[0].baseHeight;
      
      // If there are multiple cultural answers, average them with weights
      if (culturalAnswers.length > 1) {
        const weights = [0.5, 0.3, 0.2]; // First answer weighted more
        let weightedSum = 0;
        let totalWeight = 0;
        
        culturalAnswers.slice(0, 3).forEach((answer, index) => {
          const weight = weights[index] || 0.1;
          weightedSum += answer.baseHeight * weight;
          totalWeight += weight;
        });
        
        return weightedSum / totalWeight;
      }
      
      return baseHeight;
    }

    // Default to global average if no cultural indicators
    return 170;
  }

  /**
   * Calculate height adjustments from physical proxy questions
   * @param {Array} answers - User answers
   * @returns {number} Total adjustment in cm
   */
  calculateAdjustments(answers) {
    // Sum up all score adjustments from physical indicator questions
    const totalScore = answers.reduce((sum, answer) => {
      return sum + (answer.score || 0);
    }, 0);

    return totalScore;
  }

  /**
   * Determine likely nationality from answers
   * @param {Array} answers - User answers
   * @returns {object} Nationality and confidence
   */
  determineNationality(answers) {
    // Count nationality indicators from cultural answers
    const nationalityVotes = {};
    let totalVotes = 0;
    
    answers.forEach(answer => {
      if (answer.nationality) {
        nationalityVotes[answer.nationality] = (nationalityVotes[answer.nationality] || 0) + 1;
        totalVotes++;
      }
    });
    
    if (totalVotes === 0) {
      return { nationality: 'global citizen', confidence: 75 };
    }
    
    // Find most common nationality
    let topNationality = 'global citizen';
    let topCount = 0;
    
    for (const [nationality, count] of Object.entries(nationalityVotes)) {
      if (count > topCount) {
        topCount = count;
        topNationality = nationality;
      }
    }
    
    // Calculate confidence (higher with more consistent answers)
    const confidence = Math.min(95, Math.round((topCount / totalVotes) * 100));
    
    return { nationality: topNationality, confidence };
  }

  /**
   * Get height category description
   * @param {number} heightCm - Height in centimeters
   * @returns {string} Description
   */
  getHeightCategory(heightCm) {
    if (heightCm < 155) return 'petite';
    if (heightCm < 165) return 'below average';
    if (heightCm < 175) return 'average';
    if (heightCm < 185) return 'above average';
    return 'tall';
  }
  
  /**
   * Get height relative to nationality average
   * @param {number} heightCm - Height in centimeters
   * @param {string} nationality - Detected nationality
   * @returns {string} Relative height description
   */
  getRelativeHeight(heightCm, nationality) {
    // Approximate average heights by nationality (in cm)
    const averageHeights = {
      'American': 175,
      'Chinese': 169,
      'Indian': 165,
      'Japanese': 171,
      'Korean': 173,
      'British': 175,
      'German': 178,
      'French': 175,
      'Italian': 175,
      'Spanish': 173,
      'Brazilian': 173,
      'Mexican': 169,
      'Canadian': 175,
      'Australian': 175,
      'Dutch': 183,
      'Swedish': 180,
      'Norwegian': 179,
      'Russian': 176,
      'Turkish': 174,
      'global citizen': 171
    };
    
    const avgHeight = averageHeights[nationality] || 171;
    const diff = heightCm - avgHeight;
    
    if (diff > 10) return 'way above average';
    if (diff > 5) return 'above average';
    if (diff > -5) return 'average';
    if (diff > -10) return 'below average';
    return 'way below average';
  }

  /**
   * Generate fun message based on height
   * @param {number} heightCm - Height in centimeters
   * @returns {string} Fun message
   */
  generateMessage(heightCm) {
    const category = this.getHeightCategory(heightCm);
    
    const messages = {
      'petite': [
        'Good things come in small packages! 🎁',
        'You\'re perfectly pocket-sized! ✨',
        'Short and sweet! 🍬'
      ],
      'below average': [
        'You\'re at the perfect height for hugs! 🤗',
        'Compact and efficient! 🚀',
        'The best things come in fun-sized packages! 🎉'
      ],
      'average': [
        'You\'re right in the sweet spot! 🎯',
        'Perfectly balanced, as all things should be! ⚖️',
        'You fit just right! ✨'
      ],
      'above average': [
        'You stand out in a crowd! 🌟',
        'Looking good from up there! 👀',
        'You\'ve got a great view! 🏔️'
      ],
      'tall': [
        'You\'re reaching for the stars! ⭐',
        'How\'s the weather up there? ☁️',
        'You\'re head and shoulders above the rest! 🦒'
      ]
    };

    const categoryMessages = messages[category] || messages['average'];
    return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
  }
}

module.exports = new HeightService();

// Made with Bob
