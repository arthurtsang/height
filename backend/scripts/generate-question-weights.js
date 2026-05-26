#!/usr/bin/env node

/**
 * Question Weight Generation Script
 * 
 * This script generates country-specific weights for all questions in the question bank
 * based on real statistical data from country-statistics.json.
 * 
 * Usage:
 *   node generate-question-weights.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const COUNTRY_STATS_PATH = path.join(__dirname, '../src/data/country-statistics.json');
const QUESTION_BANK_PATH = path.join(__dirname, '../src/data/question-bank-enhanced.json');
const OUTPUT_PATH = path.join(__dirname, '../src/data/question-bank-enhanced.json');

// Load data
console.log('📖 Loading data files...\n');
const countryStats = JSON.parse(fs.readFileSync(COUNTRY_STATS_PATH, 'utf8'));
const questionBank = JSON.parse(fs.readFileSync(QUESTION_BANK_PATH, 'utf8'));

// Country codes
const COUNTRIES = ['US', 'GB', 'JP', 'CN', 'IN', 'NL', 'DE', 'FR', 'IT', 'ES', 
                   'CA', 'AU', 'MX', 'BR', 'KR', 'SE', 'NO', 'DK', 'TH', 'AR'];

/**
 * Convert probability (0-1) to weight (0-100)
 */
function probToWeight(prob) {
  return Math.round(prob * 100);
}

/**
 * Normalize weights so they sum to 100 per country
 */
function normalizeWeights(weights, countryCode) {
  const sum = Object.values(weights).reduce((acc, answerWeights) => {
    return acc + (answerWeights[countryCode] || 0);
  }, 0);
  
  if (sum === 0) return weights;
  
  const normalized = {};
  for (const [answer, answerWeights] of Object.entries(weights)) {
    normalized[answer] = { ...answerWeights };
    if (answerWeights[countryCode]) {
      normalized[answer][countryCode] = Math.round((answerWeights[countryCode] / sum) * 100);
    }
  }
  
  return normalized;
}

/**
 * Get country statistics by code
 */
function getCountryStats(code) {
  return countryStats.countries.find(c => c.code === code);
}

/**
 * Generate weights for food preference questions
 */
function generateFoodWeights(question) {
  console.log(`  🍕 ${question.id}: ${question.text}`);
  
  const weights = {};
  
  // Map question options to food categories
  const foodMapping = {
    'pizza': ['pizza'],
    'burgers': ['burgers', 'burger'],
    'sushi': ['sushi'],
    'pasta': ['pasta'],
    'tacos': ['tacos'],
    'curry': ['curry'],
    'steak': ['steak'],
    'ramen': ['ramen', 'noodles'],
    'bbq': ['bbq'],
    'spicy': ['curry', 'tacos'],
    'mild': ['pasta', 'pizza'],
    'seafood': ['sushi'],
    'meat': ['steak', 'burgers', 'bbq']
  };
  
  for (const option of question.options) {
    weights[option.id] = {};
    
    for (const countryCode of COUNTRIES) {
      const stats = getCountryStats(countryCode);
      if (!stats) continue;
      
      const foods = stats.statistics.favoriteFoods;
      let score = 0;
      
      // Check if option matches any food category
      const optionLower = option.text.toLowerCase();
      for (const [food, prob] of Object.entries(foods)) {
        if (optionLower.includes(food) || 
            (foodMapping[option.id] && foodMapping[option.id].includes(food))) {
          score += prob;
        }
      }
      
      weights[option.id][countryCode] = probToWeight(score);
    }
  }
  
  // Normalize weights for each country
  for (const countryCode of COUNTRIES) {
    const normalized = normalizeWeights(weights, countryCode);
    for (const [answer, answerWeights] of Object.entries(normalized)) {
      weights[answer][countryCode] = answerWeights[countryCode];
    }
  }
  
  return weights;
}

/**
 * Generate weights for beverage questions
 */
function generateBeverageWeights(question) {
  console.log(`  ☕ ${question.id}: ${question.text}`);
  
  const weights = {};
  
  for (const option of question.options) {
    weights[option.id] = {};
    
    for (const countryCode of COUNTRIES) {
      const stats = getCountryStats(countryCode);
      if (!stats) continue;
      
      const beverages = stats.statistics.beveragePreferences;
      const optionLower = option.text.toLowerCase();
      
      let score = 0;
      if (optionLower.includes('coffee')) {
        score = beverages.coffee || 0;
      } else if (optionLower.includes('tea')) {
        score = beverages.tea || 0;
      } else {
        score = beverages.other || 0.1;
      }
      
      weights[option.id][countryCode] = probToWeight(score);
    }
  }
  
  return weights;
}

/**
 * Generate weights for sports questions
 */
function generateSportsWeights(question) {
  console.log(`  ⚽ ${question.id}: ${question.text}`);
  
  const weights = {};
  
  const sportsMapping = {
    'football': ['football', 'american football'],
    'soccer': ['soccer', 'football'],
    'basketball': ['basketball'],
    'baseball': ['baseball'],
    'cricket': ['cricket'],
    'hockey': ['hockey', 'ice hockey'],
    'rugby': ['rugby']
  };
  
  for (const option of question.options) {
    weights[option.id] = {};
    
    for (const countryCode of COUNTRIES) {
      const stats = getCountryStats(countryCode);
      if (!stats) continue;
      
      const sports = stats.statistics.favoriteSports;
      const optionLower = option.text.toLowerCase();
      
      let score = 0;
      for (const [sport, prob] of Object.entries(sports)) {
        if (optionLower.includes(sport) ||
            (sportsMapping[option.id] && sportsMapping[option.id].some(s => sport.includes(s)))) {
          score += prob;
        }
      }
      
      weights[option.id][countryCode] = probToWeight(score);
    }
  }
  
  // Normalize
  for (const countryCode of COUNTRIES) {
    const normalized = normalizeWeights(weights, countryCode);
    for (const [answer, answerWeights] of Object.entries(normalized)) {
      weights[answer][countryCode] = answerWeights[countryCode];
    }
  }
  
  return weights;
}

/**
 * Generate weights for climate questions
 */
function generateClimateWeights(question) {
  console.log(`  🌤️  ${question.id}: ${question.text}`);
  
  const weights = {};
  
  for (const option of question.options) {
    weights[option.id] = {};
    
    for (const countryCode of COUNTRIES) {
      const stats = getCountryStats(countryCode);
      if (!stats) continue;
      
      const climate = stats.statistics.climatePreference;
      const optionLower = option.text.toLowerCase();
      
      let score = 0;
      if (optionLower.includes('cold') || optionLower.includes('snow') || optionLower.includes('winter')) {
        score = climate.cold || 0;
      } else if (optionLower.includes('hot') || optionLower.includes('warm') || optionLower.includes('summer')) {
        score = climate.hot || 0;
      } else if (optionLower.includes('mild') || optionLower.includes('temperate') || optionLower.includes('moderate')) {
        score = climate.temperate || 0;
      } else {
        score = 0.33; // Default
      }
      
      weights[option.id][countryCode] = probToWeight(score);
    }
  }
  
  return weights;
}

/**
 * Generate weights for transport questions
 */
function generateTransportWeights(question) {
  console.log(`  🚗 ${question.id}: ${question.text}`);
  
  const weights = {};
  
  for (const option of question.options) {
    weights[option.id] = {};
    
    for (const countryCode of COUNTRIES) {
      const stats = getCountryStats(countryCode);
      if (!stats) continue;
      
      const transport = stats.statistics.primaryTransport;
      const optionLower = option.text.toLowerCase();
      
      let score = 0;
      if (optionLower.includes('car') || optionLower.includes('drive')) {
        score = transport.car || 0;
      } else if (optionLower.includes('bike') || optionLower.includes('bicycle') || optionLower.includes('cycle')) {
        score = transport.bicycle || 0;
      } else if (optionLower.includes('public') || optionLower.includes('train') || optionLower.includes('bus')) {
        score = transport.publicTransport || 0;
      } else if (optionLower.includes('walk')) {
        score = transport.walk || 0;
      } else {
        score = 0.1;
      }
      
      weights[option.id][countryCode] = probToWeight(score);
    }
  }
  
  return weights;
}

/**
 * Generate weights for lifestyle questions
 */
function generateLifestyleWeights(question) {
  console.log(`  🏃 ${question.id}: ${question.text}`);
  
  // For lifestyle questions, use a mix of existing data
  const weights = {};
  
  for (const option of question.options) {
    weights[option.id] = {};
    
    for (const countryCode of COUNTRIES) {
      const stats = getCountryStats(countryCode);
      if (!stats) continue;
      
      // Use work style as proxy for lifestyle
      const workStyle = stats.statistics.workStyle;
      const optionLower = option.text.toLowerCase();
      
      let score = 0.5; // Default
      
      if (optionLower.includes('active') || optionLower.includes('outdoor')) {
        // Countries with more bicycle usage tend to be more active
        score = (stats.statistics.primaryTransport.bicycle || 0) + 0.3;
      } else if (optionLower.includes('relax') || optionLower.includes('indoor')) {
        score = 1 - ((stats.statistics.primaryTransport.bicycle || 0) + 0.3);
      }
      
      weights[option.id][countryCode] = probToWeight(Math.min(score, 1));
    }
  }
  
  // Normalize
  for (const countryCode of COUNTRIES) {
    const normalized = normalizeWeights(weights, countryCode);
    for (const [answer, answerWeights] of Object.entries(normalized)) {
      weights[answer][countryCode] = answerWeights[countryCode];
    }
  }
  
  return weights;
}

/**
 * Generate weights for work style questions
 */
function generateWorkStyleWeights(question) {
  console.log(`  💼 ${question.id}: ${question.text}`);
  
  const weights = {};
  
  for (const option of question.options) {
    weights[option.id] = {};
    
    for (const countryCode of COUNTRIES) {
      const stats = getCountryStats(countryCode);
      if (!stats) continue;
      
      const workStyle = stats.statistics.workStyle;
      const optionLower = option.text.toLowerCase();
      
      let score = 0.33; // Default
      
      if (optionLower.includes('office') || optionLower.includes('workplace')) {
        score = workStyle.office || 0.6;
      } else if (optionLower.includes('remote') || optionLower.includes('home')) {
        score = workStyle.remote || 0.2;
      } else if (optionLower.includes('hybrid') || optionLower.includes('flexible')) {
        score = workStyle.hybrid || 0.2;
      }
      
      weights[option.id][countryCode] = probToWeight(score);
    }
  }
  
  return weights;
}

/**
 * Keep existing weights for height deviation questions
 * These are based on height data, not cultural preferences
 */
function keepExistingWeights(question) {
  console.log(`  📏 ${question.id}: ${question.text} (keeping existing)`);
  
  const weights = {};
  for (const option of question.options) {
    weights[option.id] = option.weights || {};
  }
  return weights;
}

/**
 * Generate weights based on question category
 */
function generateWeightsForQuestion(question) {
  const category = question.category;
  
  switch (category) {
    case 'food_preference':
      return generateFoodWeights(question);
    case 'beverage':
    case 'beverage_preference':
      return generateBeverageWeights(question);
    case 'sports':
    case 'sports_preference':
      return generateSportsWeights(question);
    case 'climate':
    case 'climate_preference':
      return generateClimateWeights(question);
    case 'transport':
    case 'transport_preference':
      return generateTransportWeights(question);
    case 'lifestyle':
      return generateLifestyleWeights(question);
    case 'work_style':
      return generateWorkStyleWeights(question);
    case 'height_deviation':
    case 'age_indicator':
    case 'sex_indicator':
      return keepExistingWeights(question);
    case 'entertainment':
      return generateLifestyleWeights(question); // Use lifestyle as proxy
    case 'housing':
    case 'housing_preference':
      return generateLifestyleWeights(question); // Use lifestyle as proxy
    default:
      console.warn(`  ⚠️  Unknown category: ${category}, keeping existing weights`);
      return keepExistingWeights(question);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Starting question weight generation...\n');
  console.log(`📊 Processing ${questionBank.questions.length} questions\n`);
  
  let updated = 0;
  let kept = 0;
  
  for (const question of questionBank.questions) {
    const newWeights = generateWeightsForQuestion(question);
    
    // Update question options with new weights
    for (const option of question.options) {
      if (newWeights[option.id]) {
        option.weights = newWeights[option.id];
        updated++;
      } else {
        kept++;
      }
    }
  }
  
  // Update metadata
  questionBank.version = '2.0.0';
  questionBank.lastUpdated = new Date().toISOString().split('T')[0];
  questionBank.description = 'Enhanced question bank with data-driven weights from real statistical sources';
  
  // Save updated question bank
  console.log(`\n💾 Saving updated question bank to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(questionBank, null, 2));
  
  console.log('\n✨ Weight generation complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Total questions: ${questionBank.questions.length}`);
  console.log(`   - Options updated: ${updated}`);
  console.log(`   - Options kept: ${kept}`);
  console.log(`   - Output: ${OUTPUT_PATH}`);
}

// Run
if (require.main === module) {
  try {
    main();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { generateWeightsForQuestion };

// Made with Bob
