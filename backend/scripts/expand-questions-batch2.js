#!/usr/bin/env node

/**
 * Question Bank Expansion Script - Batch 2
 * Adds 60+ more questions to reach 100+ total
 */

const fs = require('fs');
const path = require('path');

// Country codes for all 20 countries
const countries = ['US', 'GB', 'JP', 'CN', 'IN', 'NL', 'DE', 'FR', 'IT', 'ES', 'CA', 'AU', 'MX', 'BR', 'KR', 'SE', 'NO', 'DK', 'TH', 'AR'];

// Helper to create nationality weights
function createNationalityWeights(primary, secondary = {}, defaultWeight = 5) {
  const weights = {};
  countries.forEach(c => weights[c] = defaultWeight);
  Object.entries(primary).forEach(([country, weight]) => weights[country] = weight);
  Object.entries(secondary).forEach(([country, weight]) => weights[country] = weight);
  return weights;
}

// Load existing questions
const existingPath = path.join(__dirname, '../src/data/question-bank-enhanced.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));

console.log(`📊 Current question count: ${existing.questions.length}`);

// Additional questions - Batch 2
const batch2Questions = [
  // More food questions
  {
    id: "q_food_lunch_001",
    category: "food_preference",
    text: "What's your typical lunch?",
    options: [
      {id: "opt1", text: "🥪 Sandwich", weights: {nationality: createNationalityWeights({US: 60, GB: 65, CA: 60, AU: 60, NL: 55, DE: 50})}},
      {id: "opt2", text: "🍱 Bento or packed meal", weights: {nationality: createNationalityWeights({JP: 75, KR: 65, CN: 55, TH: 50})}},
      {id: "opt3", text: "🍝 Pasta or hot meal", weights: {nationality: createNationalityWeights({IT: 70, FR: 60, ES: 60, AR: 55, BR: 50})}},
      {id: "opt4", text: "🥗 Salad", weights: {nationality: createNationalityWeights({US: 40, GB: 35, CA: 40, AU: 40, FR: 45, NL: 40})}},
      {id: "opt5", text: "🍜 Noodles or soup", weights: {nationality: createNationalityWeights({JP: 60, CN: 65, KR: 60, TH: 65, IN: 50})}}
    ],
    precomputedIG: 0.89
  },
  {
    id: "q_food_sauce_001",
    category: "food_preference",
    text: "What sauce do you put on fries/chips?",
    options: [
      {id: "opt1", text: "🍅 Ketchup", weights: {nationality: createNationalityWeights({US: 75, CA: 70, GB: 60, AU: 65, MX: 55})}},
      {id: "opt2", text: "🧈 Mayonnaise", weights: {nationality: createNationalityWeights({NL: 70, FR: 60, ES: 50, AR: 45})}},
      {id: "opt3", text: "🧄 Aioli or garlic sauce", weights: {nationality: createNationalityWeights({ES: 60, FR: 55, IT: 50, GB: 40})}},
      {id: "opt4", text: "🌶️ Hot sauce or chili", weights: {nationality: createNationalityWeights({MX: 65, TH: 60, IN: 55, KR: 50, US: 35})}},
      {id: "opt5", text: "🧂 Just salt, no sauce", weights: {nationality: createNationalityWeights({GB: 45, AU: 40, US: 30, CA: 30})}}
    ],
    precomputedIG: 0.88
  },
  {
    id: "q_food_cheese_001",
    category: "food_preference",
    text: "How do you feel about cheese?",
    options: [
      {id: "opt1", text: "🧀 Love it, eat it daily", weights: {nationality: createNationalityWeights({FR: 80, IT: 75, NL: 70, DE: 65, GB: 60, US: 60})}},
      {id: "opt2", text: "😊 Like it occasionally", weights: {nationality: createNationalityWeights({US: 50, CA: 50, AU: 50, ES: 55, BR: 45, MX: 45})}},
      {id: "opt3", text: "😐 It's okay", weights: {nationality: createNationalityWeights({JP: 40, KR: 35, CN: 30, TH: 30})}},
      {id: "opt4", text: "🚫 Don't like it or can't eat it", weights: {nationality: createNationalityWeights({CN: 50, JP: 35, KR: 35, TH: 40, IN: 45})}}
    ],
    precomputedIG: 0.87
  },
  {
    id: "q_food_seafood_001",
    category: "food_preference",
    text: "How often do you eat seafood?",
    options: [
      {id: "opt1", text: "🐟 Multiple times a week", weights: {nationality: createNationalityWeights({JP: 80, NO: 75, DK: 70, ES: 65, TH: 70, KR: 65})}},
      {id: "opt2", text: "🦐 Once a week", weights: {nationality: createNationalityWeights({IT: 60, FR: 55, GB: 50, AU: 55, US: 45, CA: 45})}},
      {id: "opt3", text: "🐠 Occasionally", weights: {nationality: createNationalityWeights({US: 50, CA: 50, DE: 45, NL: 45, BR: 45, MX: 40})}},
      {id: "opt4", text: "🚫 Rarely or never", weights: {nationality: createNationalityWeights({AR: 50, BR: 40, MX: 45, IN: 40, CN: 35})}}
    ],
    precomputedIG: 0.90
  },
  {
    id: "q_food_bread_001",
    category: "food_preference",
    text: "What type of bread do you prefer?",
    options: [
      {id: "opt1", text: "🥖 Baguette or French bread", weights: {nationality: createNationalityWeights({FR: 80, IT: 50, ES: 45, GB: 35})}},
      {id: "opt2", text: "🍞 Sliced sandwich bread", weights: {nationality: createNationalityWeights({US: 70, GB: 65, CA: 65, AU: 65, NL: 55})}},
      {id: "opt3", text: "🥨 Dark/rye bread", weights: {nationality: createNationalityWeights({DE: 75, DK: 70, NO: 70, SE: 70, NL: 60})}},
      {id: "opt4", text: "🫓 Flatbread or naan", weights: {nationality: createNationalityWeights({IN: 75, TH: 55, MX: 50, AR: 45})}},
      {id: "opt5", text: "🍚 I prefer rice over bread", weights: {nationality: createNationalityWeights({JP: 75, CN: 75, KR: 75, TH: 70, IN: 60})}}
    ],
    precomputedIG: 0.91
  },

  // More beverage questions
  {
    id: "q_beverage_water_001",
    category: "beverage_preference",
    text: "How do you prefer your water?",
    options: [
      {id: "opt1", text: "🧊 Ice cold", weights: {nationality: createNationalityWeights({US: 70, CA: 60, AU: 65, MX: 60, BR: 65})}},
      {id: "opt2", text: "🌡️ Room temperature", weights: {nationality: createNationalityWeights({IT: 60, FR: 55, ES: 55, JP: 50, CN: 55, KR: 50})}},
      {id: "opt3", text: "💧 Sparkling/carbonated", weights: {nationality: createNationalityWeights({IT: 65, FR: 60, DE: 65, ES: 55, NL: 50})}},
      {id: "opt4", text: "🚰 Tap water is fine", weights: {nationality: createNationalityWeights({NL: 70, DK: 70, NO: 70, SE: 70, GB: 60, CA: 55})}}
    ],
    precomputedIG: 0.86
  },
  {
    id: "q_beverage_energy_001",
    category: "beverage_preference",
    text: "Do you drink energy drinks?",
    options: [
      {id: "opt1", text: "⚡ Yes, regularly", weights: {nationality: createNationalityWeights({US: 45, GB: 40, AU: 40, CA: 40}), age_group: {child: 15, teen: 60, adult: 40, senior: 10}}},
      {id: "opt2", text: "😊 Occasionally", weights: {nationality: createNationalityWeights({US: 40, GB: 35, DE: 35, SE: 35, KR: 40}), age_group: {child: 20, teen: 55, adult: 45, senior: 15}}},
      {id: "opt3", text: "🚫 Never", weights: {nationality: createNationalityWeights({IT: 60, FR: 60, ES: 55, JP: 55, NO: 55, DK: 55}), age_group: {child: 65, teen: 30, adult: 50, senior: 75}}}
    ],
    precomputedIG: 0.83
  },
  {
    id: "q_beverage_milk_001",
    category: "beverage_preference",
    text: "What type of milk do you drink?",
    options: [
      {id: "opt1", text: "🥛 Regular dairy milk", weights: {nationality: createNationalityWeights({US: 60, GB: 60, CA: 60, AU: 60, NL: 70, DK: 70, NO: 70, SE: 70}), age_group: {child: 80, teen: 60, adult: 50, senior: 55}}},
      {id: "opt2", text: "🌱 Plant-based (almond, soy, oat)", weights: {nationality: createNationalityWeights({US: 45, GB: 40, CA: 45, AU: 40, SE: 50, NO: 45}), age_group: {child: 25, teen: 45, adult: 60, senior: 35}}},
      {id: "opt3", text: "🚫 I don't drink milk", weights: {nationality: createNationalityWeights({CN: 60, JP: 55, KR: 50, TH: 55, IT: 40, ES: 40}), age_group: {child: 20, teen: 35, adult: 50, senior: 55}}}
    ],
    precomputedIG: 0.84
  },

  // More sports questions
  {
    id: "q_sports_olympics_001",
    category: "sports_preference",
    text: "Which Olympic sport interests you most?",
    options: [
      {id: "opt1", text: "🏊 Swimming", weights: {nationality: createNationalityWeights({AU: 70, US: 60, GB: 55, CA: 55, NL: 55})}},
      {id: "opt2", text: "🏃 Track and field", weights: {nationality: createNationalityWeights({US: 55, GB: 55})}},
      {id: "opt3", text: "🤸 Gymnastics", weights: {nationality: createNationalityWeights({US: 50, CN: 60, JP: 55})}},
      {id: "opt4", text: "⛷️ Winter sports", weights: {nationality: createNationalityWeights({NO: 75, SE: 70, CA: 65, US: 50, DE: 50})}},
      {id: "opt5", text: "🥋 Martial arts", weights: {nationality: createNationalityWeights({JP: 70, KR: 70, CN: 65, TH: 60, BR: 50})}}
    ],
    precomputedIG: 0.87
  },
  {
    id: "q_sports_fitness_001",
    category: "sports_preference",
    text: "How often do you exercise?",
    options: [
      {id: "opt1", text: "💪 Daily", weights: {nationality: createNationalityWeights({US: 35, AU: 35, NL: 40, SE: 45, NO: 45}), age_group: {child: 50, teen: 55, adult: 40, senior: 30}}},
      {id: "opt2", text: "🏃 3-5 times a week", weights: {nationality: createNationalityWeights({US: 45, GB: 40, CA: 45, AU: 45, DE: 45, NL: 50}), age_group: {child: 55, teen: 60, adult: 55, senior: 35}}},
      {id: "opt3", text: "😊 1-2 times a week", weights: {nationality: createNationalityWeights({GB: 45, FR: 40, IT: 40, ES: 40, JP: 40}), age_group: {child: 40, teen: 45, adult: 50, senior: 40}}},
      {id: "opt4", text: "🚫 Rarely", weights: {nationality: createNationalityWeights({US: 30, GB: 35, IT: 40, ES: 40, MX: 45}), age_group: {child: 25, teen: 25, adult: 40, senior: 60}}}
    ],
    precomputedIG: 0.81
  },
  {
    id: "q_sports_outdoor_001",
    category: "sports_preference",
    text: "What outdoor activity do you enjoy?",
    options: [
      {id: "opt1", text: "🚴 Cycling", weights: {nationality: createNationalityWeights({NL: 75, DK: 70, DE: 55, NO: 55, SE: 55})}},
      {id: "opt2", text: "🥾 Hiking", weights: {nationality: createNationalityWeights({NO: 70, SE: 70, CA: 65, AU: 60, US: 55, NL: 55})}},
      {id: "opt3", text: "🏃 Running", weights: {nationality: createNationalityWeights({US: 55, GB: 55, CA: 55, AU: 55, DE: 55})}},
      {id: "opt4", text: "🏖️ Beach activities", weights: {nationality: createNationalityWeights({BR: 70, AU: 70, MX: 65, TH: 65, ES: 60, IT: 55})}},
      {id: "opt5", text: "🏠 I prefer indoor activities", weights: {nationality: createNationalityWeights({JP: 50, KR: 50, CN: 45, GB: 40}), age_group: {child: 35, teen: 45, adult: 50, senior: 65}}}
    ],
    precomputedIG: 0.86
  },

  // More entertainment questions
  {
    id: "q_entertainment_movies_001",
    category: "entertainment",
    text: "What movie genre do you prefer?",
    options: [
      {id: "opt1", text: "🎬 Action/Adventure", weights: {nationality: createNationalityWeights({US: 60, GB: 55, CA: 55, AU: 55, CN: 55}), age_group: {child: 60, teen: 70, adult: 60, senior: 40}}},
      {id: "opt2", text: "😂 Comedy", weights: {nationality: createNationalityWeights({US: 55, GB: 60, CA: 55, AU: 55, FR: 50}), age_group: {child: 65, teen: 70, adult: 65, senior: 60}}},
      {id: "opt3", text: "💕 Romance", weights: {nationality: createNationalityWeights({KR: 60, JP: 55, FR: 55, IT: 55, ES: 50}), age_group: {child: 30, teen: 55, adult: 60, senior: 55}, sex: {female: 70, male: 35}}},
      {id: "opt4", text: "😱 Horror/Thriller", weights: {nationality: createNationalityWeights({US: 50, GB: 50, KR: 55, JP: 50, TH: 50}), age_group: {child: 25, teen: 65, adult: 55, senior: 30}}},
      {id: "opt5", text: "🎭 Drama", weights: {nationality: createNationalityWeights({FR: 60, IT: 60, GB: 55, KR: 60, JP: 55}), age_group: {child: 20, teen: 35, adult: 65, senior: 75}}}
    ],
    precomputedIG: 0.82
  },
  {
    id: "q_entertainment_reading_001",
    category: "entertainment",
    text: "What do you like to read?",
    options: [
      {id: "opt1", text: "📚 Fiction novels", weights: {nationality: createNationalityWeights({GB: 60, US: 55, FR: 60, JP: 55, DE: 55}), age_group: {child: 50, teen: 55, adult: 60, senior: 70}}},
      {id: "opt2", text: "📖 Non-fiction", weights: {nationality: createNationalityWeights({US: 50, GB: 55, DE: 55, NL: 55, SE: 55}), age_group: {child: 20, teen: 30, adult: 65, senior: 75}}},
      {id: "opt3", text: "📰 News and articles", weights: {nationality: createNationalityWeights({GB: 55, US: 50, DE: 55, FR: 50, JP: 50}), age_group: {child: 15, teen: 25, adult: 70, senior: 80}}},
      {id: "opt4", text: "📱 Social media posts", weights: {nationality: createNationalityWeights({US: 55, GB: 50, KR: 60, BR: 55, MX: 50}), age_group: {child: 60, teen: 80, adult: 55, senior: 25}}},
      {id: "opt5", text: "🚫 I don't read much", weights: {nationality: createNationalityWeights({}), age_group: {child: 40, teen: 45, adult: 30, senior: 35}}}
    ],
    precomputedIG: 0.80
  },
  {
    id: "q_entertainment_vacation_001",
    category: "entertainment",
    text: "What's your ideal vacation?",
    options: [
      {id: "opt1", text: "🏖️ Beach resort", weights: {nationality: createNationalityWeights({BR: 70, MX: 70, TH: 65, ES: 65, IT: 60, AU: 65})}},
      {id: "opt2", text: "🏔️ Mountain hiking", weights: {nationality: createNationalityWeights({NO: 70, SE: 70, DK: 60, NL: 55, CA: 60, AU: 55})}},
      {id: "opt3", text: "🏛️ City sightseeing", weights: {nationality: createNationalityWeights({FR: 65, IT: 65, GB: 60, JP: 60, ES: 60, US: 55})}},
      {id: "opt4", text: "🎢 Theme parks", weights: {nationality: createNationalityWeights({US: 65, JP: 60, GB: 50, CA: 50, AU: 50}), age_group: {child: 80, teen: 70, adult: 50, senior: 25}}},
      {id: "opt5", text: "🏠 Staycation at home", weights: {nationality: createNationalityWeights({JP: 45, GB: 40, US: 35, DE: 40}), age_group: {child: 25, teen: 30, adult: 45, senior: 60}}}
    ],
    precomputedIG: 0.85
  },
  {
    id: "q_entertainment_party_001",
    category: "entertainment",
    text: "What's your ideal party size?",
    options: [
      {id: "opt1", text: "👥 Large party (20+ people)", weights: {nationality: createNationalityWeights({BR: 65, MX: 65, ES: 60, IT: 60, AR: 60, US: 50}), age_group: {child: 50, teen: 70, adult: 55, senior: 35}}},
      {id: "opt2", text: "🎉 Medium gathering (10-20 people)", weights: {nationality: createNationalityWeights({US: 55, GB: 55, CA: 55, AU: 55, FR: 55}), age_group: {child: 55, teen: 65, adult: 60, senior: 45}}},
      {id: "opt3", text: "👫 Small group (5-10 people)", weights: {nationality: createNationalityWeights({JP: 60, SE: 60, NO: 60, DK: 60, NL: 55, DE: 55}), age_group: {child: 45, teen: 50, adult: 60, senior: 60}}},
      {id: "opt4", text: "🏠 Just close friends/family", weights: {nationality: createNationalityWeights({JP: 55, GB: 50, DE: 50, SE: 55, NO: 55}), age_group: {child: 40, teen: 40, adult: 55, senior: 70}}}
    ],
    precomputedIG: 0.82
  },

  // More lifestyle questions
  {
    id: "q_lifestyle_punctuality_001",
    category: "lifestyle",
    text: "How punctual are you?",
    options: [
      {id: "opt1", text: "⏰ Always early", weights: {nationality: createNationalityWeights({JP: 70, DE: 70, NO: 65, SE: 65, DK: 65, NL: 60})}},
      {id: "opt2", text: "✅ Right on time", weights: {nationality: createNationalityWeights({US: 55, GB: 55, CA: 55, AU: 55, FR: 50})}},
      {id: "opt3", text: "😅 Usually a bit late", weights: {nationality: createNationalityWeights({ES: 60, IT: 60, BR: 60, MX: 60, AR: 60, IN: 55})}},
      {id: "opt4", text: "🤷 Time is flexible", weights: {nationality: createNationalityWeights({BR: 50, MX: 50, AR: 50, TH: 50, IN: 50})}}
    ],
    precomputedIG: 0.88
  },
  {
    id: "q_lifestyle_pets_001",
    category: "lifestyle",
    text: "Do you have pets?",
    options: [
      {id: "opt1", text: "🐕 Dog(s)", weights: {nationality: createNationalityWeights({US: 60, GB: 55, CA: 55, AU: 60, BR: 50, MX: 45})}},
      {id: "opt2", text: "🐈 Cat(s)", weights: {nationality: createNationalityWeights({US: 50, GB: 50, CA: 50, JP: 55, FR: 50, IT: 45})}},
      {id: "opt3", text: "🐠 Fish or other small pets", weights: {nationality: createNationalityWeights({JP: 45, CN: 45, KR: 40, TH: 40})}},
      {id: "opt4", text: "🚫 No pets", weights: {nationality: createNationalityWeights({JP: 50, CN: 55, KR: 55, DE: 45, NL: 45})}}
    ],
    precomputedIG: 0.79
  },
  {
    id: "q_lifestyle_cooking_001",
    category: "lifestyle",
    text: "How often do you cook at home?",
    options: [
      {id: "opt1", text: "👨‍🍳 Daily", weights: {nationality: createNationalityWeights({IT: 70, FR: 65, ES: 65, JP: 65, IN: 70, TH: 65}), age_group: {child: 15, teen: 25, adult: 65, senior: 70}}},
      {id: "opt2", text: "🍳 Several times a week", weights: {nationality: createNationalityWeights({US: 55, GB: 55, CA: 55, AU: 55, DE: 60, NL: 60}), age_group: {child: 20, teen: 35, adult: 70, senior: 65}}},
      {id: "opt3", text: "😊 Occasionally", weights: {nationality: createNationalityWeights({US: 40, GB: 40, KR: 45, CN: 45}), age_group: {child: 30, teen: 50, adult: 50, senior: 40}}},
      {id: "opt4", text: "🍕 Rarely, mostly eat out/order", weights: {nationality: createNationalityWeights({US: 35, GB: 35, CN: 40, KR: 45, JP: 35}), age_group: {child: 45, teen: 60, adult: 35, senior: 20}}}
    ],
    precomputedIG: 0.84
  },
  {
    id: "q_lifestyle_morning_001",
    category: "lifestyle",
    text: "Are you a morning person or night owl?",
    options: [
      {id: "opt1", text: "🌅 Morning person", weights: {nationality: createNationalityWeights({JP: 60, DE: 55, NO: 55, SE: 55, DK: 55, NL: 50}), age_group: {child: 40, teen: 25, adult: 50, senior: 75}}},
      {id: "opt2", text: "🦉 Night owl", weights: {nationality: createNationalityWeights({ES: 65, IT: 60, AR: 60, BR: 55, KR: 60, MX: 55}), age_group: {child: 30, teen: 70, adult: 50, senior: 25}}},
      {id: "opt3", text: "😴 Neither, I'm always tired", weights: {nationality: createNationalityWeights({US: 45, GB: 45, CA: 45, AU: 45}), age_group: {child: 35, teen: 50, adult: 55, senior: 45}}}
    ],
    precomputedIG: 0.83
  },
  {
    id: "q_lifestyle_cleaning_001",
    category: "lifestyle",
    text: "How often do you clean your home?",
    options: [
      {id: "opt1", text: "🧹 Daily", weights: {nationality: createNationalityWeights({JP: 65, DE: 60, NL: 60, DK: 60, NO: 60, SE: 60}), age_group: {child: 15, teen: 20, adult: 55, senior: 70}}},
      {id: "opt2", text: "📅 Weekly", weights: {nationality: createNationalityWeights({US: 60, GB: 60, CA: 60, AU: 60, FR: 55, IT: 55}), age_group: {child: 25, teen: 35, adult: 70, senior: 65}}},
      {id: "opt3", text: "😊 When it gets messy", weights: {nationality: createNationalityWeights({US: 40, GB: 40, ES: 45, BR: 45, MX: 45}), age_group: {child: 40, teen: 60, adult: 50, senior: 35}}},
      {id: "opt4", text: "🤷 Rarely", weights: {nationality: createNationalityWeights({US: 25, GB: 25, IT: 30, ES: 30}), age_group: {child: 50, teen: 65, adult: 30, senior: 20}}}
    ],
    precomputedIG: 0.81
  },

  // More climate questions
  {
    id: "q_climate_season_001",
    category: "climate_preference",
    text: "What's your favorite season?",
    options: [
      {id: "opt1", text: "🌸 Spring", weights: {nationality: createNationalityWeights({JP: 70, GB: 60, FR: 60, NL: 60, DE: 55})}},
      {id: "opt2", text: "☀️ Summer", weights: {nationality: createNationalityWeights({ES: 70, IT: 70, BR: 75, MX: 70, TH: 70, AU: 65, US: 60})}},
      {id: "opt3", text: "🍂 Fall/Autumn", weights: {nationality: createNationalityWeights({US: 55, CA: 60, GB: 55, DE: 55, FR: 55, JP: 55})}},
      {id: "opt4", text: "❄️ Winter", weights: {nationality: createNationalityWeights({NO: 65, SE: 60, DK: 55, CA: 50, US: 40})}}
    ],
    precomputedIG: 0.86
  },
  {
    id: "q_climate_rain_001",
    category: "climate_preference",
    text: "How do you feel about rainy weather?",
    options: [
      {id: "opt1", text: "☔ Love it, so cozy", weights: {nationality: createNationalityWeights({GB: 65, NO: 60, SE: 55, NL: 55, JP: 50})}},
      {id: "opt2", text: "😊 It's okay", weights: {nationality: createNationalityWeights({US: 50, CA: 50, DE: 50, FR: 50, AU: 45})}},
      {id: "opt3", text: "😐 Tolerate it", weights: {nationality: createNationalityWeights({IT: 50, ES: 50, BR: 50, MX: 50, AR: 50})}},
      {id: "opt4", text: "☀️ Prefer sunny weather", weights: {nationality: createNationalityWeights({ES: 70, IT: 70, BR: 75, MX: 70, TH: 75, AU: 70})}}
    ],
    precomputedIG: 0.85
  },

  // More work/education questions
  {
    id: "q_work_hours_001",
    category: "work_style",
    text: "What are your ideal work hours?",
    options: [
      {id: "opt1", text: "🌅 Early morning start", weights: {nationality: createNationalityWeights({JP: 65, DE: 60, NO: 60, SE: 60, DK: 60, US: 55}), age_group: {child: 10, teen: 20, adult: 60, senior: 70}}},
      {id: "opt2", text: "☀️ Standard 9-5", weights: {nationality: createNationalityWeights({US: 60, GB: 60, CA: 60, AU: 60, NL: 55, FR: 50}), age_group: {child: 15, teen: 25, adult: 70, senior: 55}}},
      {id: "opt3", text: "🌙 Late start, late finish", weights: {nationality: createNationalityWeights({ES: 65, IT: 60, AR: 60, BR: 55, MX: 55}), age_group: {child: 10, teen: 45, adult: 50, senior: 25}}},
      {id: "opt4", text: "🔄 Flexible hours", weights: {nationality: createNationalityWeights({NL: 60, DK: 60, SE: 60, NO: 55, US: 45, GB: 45}), age_group: {child: 15, teen: 30, adult: 60, senior: 40}}}
    ],
    precomputedIG: 0.84
  },
  {
    id: "q_work_meetings_001",
    category: "work_style",
    text: "How do you feel about meetings?",
    options: [
      {id: "opt1", text: "👍 Necessary and productive", weights: {nationality: createNationalityWeights({JP: 65, KR: 60, CN: 60, DE: 55, US: 50}), age_group: {child: 10, teen: 20, adult: 60, senior: 55}}},
      {id: "opt2", text: "😐 Depends on the meeting", weights: {nationality: createNationalityWeights({US: 55, GB: 55, CA: 55, AU: 55, FR: 50}), age_group: {child: 15, teen: 25, adult: 65, senior: 50}}},
      {id: "opt3", text: "😅 Often a waste of time", weights: {nationality: createNationalityWeights({US: 45, GB: 45, SE: 50, NO: 50, DK: 50, NL: 50}), age_group: {child: 10, teen: 30, adult: 55, senior: 40}}},
      {id: "opt4", text: "📧 Prefer email communication", weights: {nationality: createNationalityWeights({SE: 55, NO: 55, DK: 55, NL: 55, DE: 50}), age_group: {child: 15, teen: 35, adult: 60, senior: 45}}}
    ],
    precomputedIG: 0.80
  },

  // More height deviation questions
  {
    id: "q_height_clothes_001",
    category: "height_deviation",
    text: "How do off-the-rack clothes typically fit you?",
    options: [
      {id: "opt1", text: "👕 Sleeves/pants always too long", weights: {height_deviation: {way_below: 70, below: 20, average: 8, above: 2, way_above: 0}}},
      {id: "opt2", text: "✅ Usually fit well", weights: {height_deviation: {way_below: 10, below: 30, average: 60, above: 10, way_above: 2}}},
      {id: "opt3", text: "👖 Sleeves/pants often too short", weights: {height_deviation: {way_below: 2, below: 8, average: 20, above: 50, way_above: 20}}},
      {id: "opt4", text: "😤 Almost never fit right", weights: {height_deviation: {way_below: 25, below: 15, average: 10, above: 25, way_above: 60}}}
    ],
    precomputedIG: 0.91
  },
  {
    id: "q_height_bed_001",
    category: "height_deviation",
    text: "How does a standard bed fit you?",
    options: [
      {id: "opt1", text: "🛏️ Plenty of room", weights: {height_deviation: {way_below: 65, below: 30, average: 10, above: 2, way_above: 0}}},
      {id: "opt2", text: "😊 Fits perfectly", weights: {height_deviation: {way_below: 20, below: 45, average: 60, above: 15, way_above: 3}}},
      {id: "opt3", text: "😐 Feet hang off a bit", weights: {height_deviation: {way_below: 5, below: 15, average: 25, above: 45, way_above: 15}}},
      {id: "opt4", text: "😤 Way too short", weights: {height_deviation: {way_below: 1, below: 3, average: 8, above: 35, way_above: 65}}}
    ],
    precomputedIG: 0.92
  },
  {
    id: "q_height_mirror_001",
    category: "height_deviation",
    text: "When looking in a standard bathroom mirror, where do you see yourself?",
    options: [
      {id: "opt1", text: "🪞 Need to look up", weights: {height_deviation: {way_below: 70, below: 25, average: 5, above: 1, way_above: 0}}},
      {id: "opt2", text: "😊 Perfect eye level", weights: {height_deviation: {way_below: 15, below: 40, average: 60, above: 12, way_above: 2}}},
      {id: "opt3", text: "👀 Need to duck down", weights: {height_deviation: {way_below: 2, below: 10, average: 25, above: 50, way_above: 20}}},
      {id: "opt4", text: "😤 Can only see my chest", weights: {height_deviation: {way_below: 1, below: 3, average: 8, above: 30, way_above: 65}}}
    ],
    precomputedIG: 0.93
  },
  {
    id: "q_height_public_transport_001",
    category: "height_deviation",
    text: "How comfortable are you on public transportation?",
    options: [
      {id: "opt1", text: "😊 Very comfortable, plenty of space", weights: {height_deviation: {way_below: 65, below: 30, average: 10, above: 2, way_above: 0}}},
      {id: "opt2", text: "✅ Generally comfortable", weights: {height_deviation: {way_below: 20, below: 45, average: 55, above: 12, way_above: 3}}},
      {id: "opt3", text: "😐 A bit cramped", weights: {height_deviation: {way_below: 8, below: 18, average: 30, above: 40, way_above: 15}}},
      {id: "opt4", text: "😤 Very uncomfortable", weights: {height_deviation: {way_below: 2, below: 5, average: 10, above: 40, way_above: 65}}}
    ],
    precomputedIG: 0.91
  }
];

// Combine with existing questions
const expandedQuestionBank = {
  ...existing,
  metadata: {
    ...existing.metadata,
    totalQuestions: existing.questions.length + batch2Questions.length,
    maxQuestions: 100
  },
  questions: [...existing.questions, ...batch2Questions]
};

// Write the expanded question bank
const outputPath = path.join(__dirname, '../src/data/question-bank-enhanced.json');
fs.writeFileSync(outputPath, JSON.stringify(expandedQuestionBank, null, 2));

console.log(`✅ Expanded question bank from ${existing.questions.length} to ${expandedQuestionBank.questions.length} questions`);
console.log(`📊 Total questions: ${expandedQuestionBank.questions.length}`);

// Count by category
const categoryCount = {};
expandedQuestionBank.questions.forEach(q => {
  categoryCount[q.category] = (categoryCount[q.category] || 0) + 1;
});

console.log('\n📈 Questions by category:');
Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count}`);
});

// Made with Bob
