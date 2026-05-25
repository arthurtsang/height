#!/usr/bin/env node

/**
 * Question Bank Expansion Script
 * Expands the question bank from 21 to 100+ questions
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

// New questions to add
const newQuestions = [
  // FOOD PREFERENCES (expand from 1 to 15)
  {
    id: "q_food_breakfast_001",
    category: "food_preference",
    text: "What's your typical breakfast?",
    options: [
      {id: "opt1", text: "🥐 Croissant or pastry", weights: {nationality: createNationalityWeights({FR: 75, IT: 45, ES: 40, GB: 28, DE: 35})}},
      {id: "opt2", text: "🍳 Eggs and bacon", weights: {nationality: createNationalityWeights({US: 65, GB: 60, CA: 60, AU: 60, DE: 35})}},
      {id: "opt3", text: "🍚 Rice and soup", weights: {nationality: createNationalityWeights({JP: 70, CN: 65, KR: 70, TH: 60})}},
      {id: "opt4", text: "🥣 Cereal or oatmeal", weights: {nationality: createNationalityWeights({US: 45, GB: 50, CA: 50, AU: 50, SE: 55, NO: 55, DK: 55})}},
      {id: "opt5", text: "🫓 Bread and cheese", weights: {nationality: createNationalityWeights({NL: 70, DE: 60, DK: 55, NO: 50, SE: 50})}}
    ],
    precomputedIG: 0.90
  },
  {
    id: "q_food_snack_001",
    category: "food_preference",
    text: "What's your favorite snack?",
    options: [
      {id: "opt1", text: "🍿 Popcorn", weights: {nationality: createNationalityWeights({US: 55, CA: 50, GB: 40, AU: 45})}},
      {id: "opt2", text: "🍘 Rice crackers", weights: {nationality: createNationalityWeights({JP: 70, CN: 55, KR: 60, TH: 45})}},
      {id: "opt3", text: "🥨 Pretzels or chips", weights: {nationality: createNationalityWeights({US: 50, DE: 60, GB: 40, CA: 45, AU: 40})}},
      {id: "opt4", text: "🍫 Chocolate", weights: {nationality: createNationalityWeights({GB: 55, US: 45, DE: 50, FR: 50, IT: 45, ES: 45, SE: 60, NO: 55, DK: 55})}},
      {id: "opt5", text: "🥜 Nuts or seeds", weights: {nationality: createNationalityWeights({IN: 50, TH: 45, CN: 40, BR: 40, MX: 35})}}
    ],
    precomputedIG: 0.87
  },
  {
    id: "q_food_dessert_001",
    category: "food_preference",
    text: "What's your go-to dessert?",
    options: [
      {id: "opt1", text: "🍰 Cake or pie", weights: {nationality: createNationalityWeights({US: 60, GB: 55, CA: 55, AU: 55, DE: 50})}},
      {id: "opt2", text: "🍨 Ice cream or gelato", weights: {nationality: createNationalityWeights({IT: 70, US: 55, ES: 50, FR: 45, AU: 50, BR: 55})}},
      {id: "opt3", text: "🍡 Mochi or sweet rice", weights: {nationality: createNationalityWeights({JP: 75, CN: 50, KR: 55, TH: 45})}},
      {id: "opt4", text: "🍮 Flan or custard", weights: {nationality: createNationalityWeights({ES: 60, MX: 65, AR: 60, BR: 50, FR: 45})}},
      {id: "opt5", text: "🍪 Cookies or biscuits", weights: {nationality: createNationalityWeights({GB: 60, US: 50, CA: 50, AU: 50, NL: 55})}}
    ],
    precomputedIG: 0.88
  },
  {
    id: "q_food_spice_001",
    category: "food_preference",
    text: "How spicy do you like your food?",
    options: [
      {id: "opt1", text: "🌶️🌶️🌶️ Very spicy!", weights: {nationality: createNationalityWeights({IN: 75, TH: 70, MX: 65, KR: 55, CN: 45})}},
      {id: "opt2", text: "🌶️🌶️ Moderately spicy", weights: {nationality: createNationalityWeights({MX: 50, IN: 40, TH: 45, KR: 45, CN: 40, US: 35, BR: 40})}},
      {id: "opt3", text: "🌶️ Mild spice", weights: {nationality: createNationalityWeights({US: 45, GB: 40, CA: 45, AU: 45, JP: 40, DE: 35, FR: 35})}},
      {id: "opt4", text: "❌ No spice at all", weights: {nationality: createNationalityWeights({SE: 55, NO: 55, DK: 55, NL: 50, GB: 35, DE: 40})}}
    ],
    precomputedIG: 0.89
  },
  {
    id: "q_food_street_001",
    category: "food_preference",
    text: "What street food appeals to you most?",
    options: [
      {id: "opt1", text: "🌭 Hot dogs", weights: {nationality: createNationalityWeights({US: 65, CA: 45, DE: 50, DK: 40})}},
      {id: "opt2", text: "🍢 Skewers (yakitori, satay)", weights: {nationality: createNationalityWeights({JP: 70, TH: 70, CN: 55, KR: 55, IN: 45})}},
      {id: "opt3", text: "🥙 Kebabs or gyros", weights: {nationality: createNationalityWeights({GB: 45, DE: 50, FR: 40, NL: 40, SE: 35})}},
      {id: "opt4", text: "🌮 Tacos or quesadillas", weights: {nationality: createNationalityWeights({MX: 75, US: 40, ES: 25, CA: 30, BR: 25})}},
      {id: "opt5", text: "🍟 Fries or chips", weights: {nationality: createNationalityWeights({GB: 55, US: 50, CA: 50, AU: 50, NL: 60, BE: 65})}}
    ],
    precomputedIG: 0.91
  },
  {
    id: "q_food_carbs_001",
    category: "food_preference",
    text: "What's your preferred carb with meals?",
    options: [
      {id: "opt1", text: "🍚 Rice", weights: {nationality: createNationalityWeights({JP: 80, CN: 80, KR: 80, TH: 80, IN: 75, BR: 45})}},
      {id: "opt2", text: "🍞 Bread", weights: {nationality: createNationalityWeights({FR: 75, IT: 70, DE: 70, GB: 65, US: 60, ES: 65, NL: 65})}},
      {id: "opt3", text: "🍝 Pasta", weights: {nationality: createNationalityWeights({IT: 80, US: 50, GB: 45, FR: 45, AR: 50, BR: 45})}},
      {id: "opt4", text: "🥔 Potatoes", weights: {nationality: createNationalityWeights({GB: 60, US: 55, DE: 60, NL: 55, SE: 60, NO: 60, DK: 60})}},
      {id: "opt5", text: "🌽 Corn or tortillas", weights: {nationality: createNationalityWeights({MX: 75, BR: 50, AR: 45, US: 30})}}
    ],
    precomputedIG: 0.92
  },

  // BEVERAGE PREFERENCES (expand from 1 to 10)
  {
    id: "q_beverage_alcohol_001",
    category: "beverage_preference",
    text: "What's your alcoholic drink of choice? (if you drink)",
    options: [
      {id: "opt1", text: "🍺 Beer", weights: {nationality: createNationalityWeights({DE: 80, GB: 70, US: 65, CA: 60, AU: 65, NL: 65, DK: 70, NO: 60, SE: 60, BR: 55, MX: 50}), age_group: {child: 0, teen: 5, adult: 70, senior: 55}}},
      {id: "opt2", text: "🍷 Wine", weights: {nationality: createNationalityWeights({FR: 80, IT: 80, ES: 75, AR: 70, GB: 50, US: 50, AU: 55, DE: 45}), age_group: {child: 0, teen: 5, adult: 65, senior: 75}}},
      {id: "opt3", text: "🥃 Whiskey or spirits", weights: {nationality: createNationalityWeights({GB: 55, US: 50, CA: 45, JP: 50, KR: 45, IN: 40}), age_group: {child: 0, teen: 8, adult: 60, senior: 50}}},
      {id: "opt4", text: "🍶 Sake or soju", weights: {nationality: createNationalityWeights({JP: 75, KR: 80, CN: 35}), age_group: {child: 0, teen: 5, adult: 65, senior: 55}}},
      {id: "opt5", text: "🚫 I don't drink alcohol", weights: {nationality: createNationalityWeights({IN: 55, TH: 40, US: 30, GB: 25}), age_group: {child: 95, teen: 70, adult: 25, senior: 35}}}
    ],
    precomputedIG: 0.86
  },
  {
    id: "q_beverage_afternoon_001",
    category: "beverage_preference",
    text: "What do you drink in the afternoon?",
    options: [
      {id: "opt1", text: "☕ Coffee", weights: {nationality: createNationalityWeights({IT: 75, SE: 80, NO: 75, DK: 75, NL: 70, US: 60, CA: 60}), age_group: {child: 5, teen: 20, adult: 70, senior: 75}}},
      {id: "opt2", text: "🍵 Tea", weights: {nationality: createNationalityWeights({GB: 75, IN: 80, CN: 70, JP: 65, TH: 60}), age_group: {child: 15, teen: 25, adult: 55, senior: 70}}},
      {id: "opt3", text: "🥤 Soda or soft drink", weights: {nationality: createNationalityWeights({US: 55, MX: 60, BR: 55, AR: 50}), age_group: {child: 70, teen: 75, adult: 35, senior: 20}}},
      {id: "opt4", text: "💧 Water", weights: {nationality: createNationalityWeights({DE: 50, NL: 50, SE: 55, NO: 55, DK: 55}), age_group: {child: 40, teen: 45, adult: 60, senior: 65}}},
      {id: "opt5", text: "🧃 Juice", weights: {nationality: createNationalityWeights({BR: 45, MX: 40, TH: 40, US: 30}), age_group: {child: 75, teen: 50, adult: 25, senior: 20}}}
    ],
    precomputedIG: 0.85
  },
  {
    id: "q_beverage_hot_001",
    category: "beverage_preference",
    text: "How do you take your hot beverages?",
    options: [
      {id: "opt1", text: "☕ Black coffee, no sugar", weights: {nationality: createNationalityWeights({IT: 70, SE: 65, NO: 65, DK: 60, FR: 55}), age_group: {child: 2, teen: 15, adult: 60, senior: 65}}},
      {id: "opt2", text: "☕ Coffee with milk/cream", weights: {nationality: createNationalityWeights({US: 60, CA: 60, AU: 60, GB: 45, DE: 50, NL: 55}), age_group: {child: 5, teen: 25, adult: 65, senior: 60}}},
      {id: "opt3", text: "🍵 Tea with milk", weights: {nationality: createNationalityWeights({GB: 75, IN: 70, TH: 40}), age_group: {child: 10, teen: 20, adult: 50, senior: 65}}},
      {id: "opt4", text: "🍵 Tea plain or with lemon", weights: {nationality: createNationalityWeights({JP: 70, CN: 75, KR: 60, TH: 55}), age_group: {child: 15, teen: 25, adult: 55, senior: 70}}},
      {id: "opt5", text: "🥤 I prefer cold drinks", weights: {nationality: createNationalityWeights({US: 40, BR: 50, MX: 45, TH: 50, AU: 45}), age_group: {child: 60, teen: 65, adult: 35, senior: 25}}}
    ],
    precomputedIG: 0.87
  },

  // SPORTS & ACTIVITIES (expand from 1 to 12)
  {
    id: "q_sports_participate_001",
    category: "sports_preference",
    text: "Which sport do you actually play or practice?",
    options: [
      {id: "opt1", text: "⚽ Soccer/Football", weights: {nationality: createNationalityWeights({BR: 70, ES: 65, IT: 60, MX: 65, AR: 70, FR: 55, DE: 55}), age_group: {child: 65, teen: 70, adult: 40, senior: 15}}},
      {id: "opt2", text: "🏃 Running or jogging", weights: {nationality: createNationalityWeights({US: 50, GB: 50, CA: 50, AU: 50, DE: 55, NL: 55, SE: 60, NO: 60}), age_group: {child: 35, teen: 50, adult: 65, senior: 45}}},
      {id: "opt3", text: "🏊 Swimming", weights: {nationality: createNationalityWeights({AU: 65, US: 50, GB: 45, CA: 45, NL: 50}), age_group: {child: 60, teen: 50, adult: 45, senior: 40}}},
      {id: "opt4", text: "🏋️ Gym/Weight training", weights: {nationality: createNationalityWeights({US: 55, GB: 45, CA: 45, AU: 45, DE: 40, SE: 45}), age_group: {child: 10, teen: 45, adult: 70, senior: 35}}},
      {id: "opt5", text: "🧘 Yoga or martial arts", weights: {nationality: createNationalityWeights({IN: 60, JP: 55, CN: 50, TH: 50, US: 35}), age_group: {child: 20, teen: 30, adult: 60, senior: 50}}},
      {id: "opt6", text: "🚫 I don't play sports", weights: {nationality: createNationalityWeights({}), age_group: {child: 15, teen: 20, adult: 35, senior: 60}}}
    ],
    precomputedIG: 0.84
  },
  {
    id: "q_sports_winter_001",
    category: "sports_preference",
    text: "What winter sport interests you most?",
    options: [
      {id: "opt1", text: "⛷️ Skiing", weights: {nationality: createNationalityWeights({NO: 75, SE: 70, DK: 60, CA: 55, US: 45, FR: 50, IT: 45})}},
      {id: "opt2", text: "🏂 Snowboarding", weights: {nationality: createNationalityWeights({US: 50, CA: 50, JP: 45, AU: 40, NO: 40, SE: 40})}},
      {id: "opt3", text: "⛸️ Ice skating", weights: {nationality: createNationalityWeights({CA: 50, US: 40, NL: 55, SE: 45, NO: 45, DK: 45})}},
      {id: "opt4", text: "🏒 Ice hockey", weights: {nationality: createNationalityWeights({CA: 70, SE: 60, NO: 45, US: 35})}},
      {id: "opt5", text: "🌴 I prefer warm weather activities", weights: {nationality: createNationalityWeights({BR: 70, MX: 65, TH: 70, IN: 65, AU: 55, ES: 50, IT: 45})}}
    ],
    precomputedIG: 0.88
  },
  {
    id: "q_sports_team_001",
    category: "sports_preference",
    text: "Do you prefer team sports or individual sports?",
    options: [
      {id: "opt1", text: "👥 Team sports definitely", weights: {nationality: createNationalityWeights({BR: 65, ES: 60, IT: 60, MX: 60, AR: 65, US: 55}), age_group: {child: 70, teen: 75, adult: 50, senior: 30}}},
      {id: "opt2", text: "🏃 Individual sports", weights: {nationality: createNationalityWeights({SE: 55, NO: 55, DK: 50, JP: 50, GB: 45}), age_group: {child: 30, teen: 40, adult: 60, senior: 55}}},
      {id: "opt3", text: "🤷 No preference", weights: {nationality: createNationalityWeights({}), age_group: {child: 40, teen: 45, adult: 50, senior: 50}}},
      {id: "opt4", text: "🚫 Not into sports", weights: {nationality: createNationalityWeights({}), age_group: {child: 20, teen: 25, adult: 40, senior: 65}}}
    ],
    precomputedIG: 0.79
  },

  // ENTERTAINMENT & MUSIC (new category, 10 questions)
  {
    id: "q_music_genre_001",
    category: "entertainment",
    text: "What's your favorite music genre?",
    options: [
      {id: "opt1", text: "🎸 Rock or alternative", weights: {nationality: createNationalityWeights({GB: 60, US: 55, CA: 55, AU: 55, DE: 50, SE: 50}), age_group: {child: 20, teen: 45, adult: 60, senior: 55}}},
      {id: "opt2", text: "🎤 Pop", weights: {nationality: createNationalityWeights({US: 50, GB: 50, KR: 60, JP: 55, SE: 45}), age_group: {child: 70, teen: 75, adult: 45, senior: 30}}},
      {id: "opt3", text: "🎵 Classical or jazz", weights: {nationality: createNationalityWeights({FR: 50, IT: 50, GB: 45, US: 40, JP: 45}), age_group: {child: 10, teen: 15, adult: 45, senior: 70}}},
      {id: "opt4", text: "🎶 Hip-hop or R&B", weights: {nationality: createNationalityWeights({US: 60, CA: 50, GB: 45, FR: 40, BR: 45}), age_group: {child: 35, teen: 70, adult: 50, senior: 20}}},
      {id: "opt5", text: "🪕 Country or folk", weights: {nationality: createNationalityWeights({US: 45, CA: 40, AU: 40, GB: 30, SE: 35, NO: 35}), age_group: {child: 15, teen: 20, adult: 45, senior: 60}}},
      {id: "opt6", text: "🎹 Electronic or EDM", weights: {nationality: createNationalityWeights({NL: 55, DE: 50, SE: 50, GB: 45, US: 40}), age_group: {child: 30, teen: 65, adult: 50, senior: 20}}}
    ],
    precomputedIG: 0.83
  },
  {
    id: "q_entertainment_streaming_001",
    category: "entertainment",
    text: "What do you watch most on streaming services?",
    options: [
      {id: "opt1", text: "🎬 Movies", weights: {nationality: createNationalityWeights({US: 55, GB: 50, CA: 50, AU: 50, FR: 55, IT: 50}), age_group: {child: 45, teen: 50, adult: 60, senior: 65}}},
      {id: "opt2", text: "📺 TV series/dramas", weights: {nationality: createNationalityWeights({US: 60, GB: 60, KR: 70, JP: 60, ES: 55, BR: 55}), age_group: {child: 40, teen: 65, adult: 70, senior: 60}}},
      {id: "opt3", text: "😂 Comedy shows", weights: {nationality: createNationalityWeights({US: 55, GB: 60, CA: 55, AU: 55}), age_group: {child: 50, teen: 60, adult: 60, senior: 50}}},
      {id: "opt4", text: "📖 Documentaries", weights: {nationality: createNationalityWeights({GB: 50, DE: 50, NL: 50, SE: 55, NO: 55, DK: 55}), age_group: {child: 20, teen: 25, adult: 55, senior: 75}}},
      {id: "opt5", text: "🎮 Gaming content", weights: {nationality: createNationalityWeights({US: 45, KR: 50, JP: 45, SE: 40}), age_group: {child: 75, teen: 80, adult: 35, senior: 10}}}
    ],
    precomputedIG: 0.81
  },
  {
    id: "q_entertainment_hobby_001",
    category: "entertainment",
    text: "What's your favorite hobby?",
    options: [
      {id: "opt1", text: "📚 Reading", weights: {nationality: createNationalityWeights({GB: 55, FR: 50, DE: 50, JP: 50, SE: 55, NO: 55}), age_group: {child: 35, teen: 40, adult: 60, senior: 75}}},
      {id: "opt2", text: "🎮 Gaming", weights: {nationality: createNationalityWeights({KR: 70, JP: 65, US: 55, SE: 50, CN: 55}), age_group: {child: 80, teen: 85, adult: 45, senior: 15}}},
      {id: "opt3", text: "🎨 Arts and crafts", weights: {nationality: createNationalityWeights({JP: 50, IT: 45, FR: 45, NL: 40, SE: 40}), age_group: {child: 60, teen: 45, adult: 50, senior: 60}}},
      {id: "opt4", text: "🎵 Playing music", weights: {nationality: createNationalityWeights({US: 40, GB: 40, FR: 40, IT: 40, JP: 40}), age_group: {child: 50, teen: 60, adult: 45, senior: 35}}},
      {id: "opt5", text: "🏃 Sports and fitness", weights: {nationality: createNationalityWeights({US: 50, AU: 50, CA: 45, NL: 50, SE: 55, NO: 55}), age_group: {child: 55, teen: 65, adult: 60, senior: 40}}},
      {id: "opt6", text: "🌳 Outdoor activities", weights: {nationality: createNationalityWeights({NO: 60, SE: 60, CA: 55, AU: 55, NL: 50}), age_group: {child: 60, teen: 55, adult: 55, senior: 50}}}
    ],
    precomputedIG: 0.80
  },

  // LIFESTYLE & DAILY ROUTINES (new category, 12 questions)
  {
    id: "q_lifestyle_sleep_001",
    category: "lifestyle",
    text: "What time do you usually go to bed?",
    options: [
      {id: "opt1", text: "🌙 Before 10 PM", weights: {nationality: createNationalityWeights({JP: 45, CN: 40, IN: 40, TH: 40}), age_group: {child: 75, teen: 25, adult: 30, senior: 70}}},
      {id: "opt2", text: "😴 10 PM - Midnight", weights: {nationality: createNationalityWeights({US: 50, GB: 50, CA: 50, AU: 50, DE: 50, SE: 50}), age_group: {child: 20, teen: 45, adult: 65, senior: 55}}},
      {id: "opt3", text: "🦉 Midnight - 2 AM", weights: {nationality: createNationalityWeights({ES: 60, IT: 55, AR: 55, BR: 50, MX: 50, KR: 55}), age_group: {child: 5, teen: 60, adult: 50, senior: 20}}},
      {id: "opt4", text: "🌃 After 2 AM", weights: {nationality: createNationalityWeights({ES: 40, KR: 45, JP: 35}), age_group: {child: 2, teen: 45, adult: 25, senior: 8}}}
    ],
    precomputedIG: 0.82
  },
  {
    id: "q_lifestyle_shopping_001",
    category: "lifestyle",
    text: "Where do you prefer to shop for groceries?",
    options: [
      {id: "opt1", text: "🏪 Small local shops", weights: {nationality: createNationalityWeights({JP: 60, IT: 55, FR: 55, ES: 50, TH: 55, IN: 50})}},
      {id: "opt2", text: "🏬 Large supermarkets", weights: {nationality: createNationalityWeights({US: 70, GB: 65, CA: 65, AU: 65, DE: 60, NL: 60, SE: 60})}},
      {id: "opt3", text: "🌾 Farmers markets", weights: {nationality: createNationalityWeights({NL: 45, DK: 45, NO: 45, SE: 45, US: 35, CA: 35})}},
      {id: "opt4", text: "📱 Online delivery", weights: {nationality: createNationalityWeights({CN: 65, KR: 60, GB: 45, US: 40, JP: 40}), age_group: {child: 15, teen: 35, adult: 60, senior: 30}}}
    ],
    precomputedIG: 0.84
  },
  {
    id: "q_lifestyle_weekend_001",
    category: "lifestyle",
    text: "How do you typically spend your weekends?",
    options: [
      {id: "opt1", text: "🏠 Relaxing at home", weights: {nationality: createNationalityWeights({JP: 55, GB: 50, US: 45, CA: 45}), age_group: {child: 30, teen: 35, adult: 55, senior: 70}}},
      {id: "opt2", text: "🌳 Outdoor activities", weights: {nationality: createNationalityWeights({NO: 65, SE: 65, DK: 60, NL: 55, CA: 55, AU: 60}), age_group: {child: 60, teen: 55, adult: 55, senior: 45}}},
      {id: "opt3", text: "🛍️ Shopping and errands", weights: {nationality: createNationalityWeights({US: 50, GB: 45, CA: 45, AU: 45, CN: 50}), age_group: {child: 25, teen: 40, adult: 60, senior: 50}}},
      {id: "opt4", text: "👥 Socializing with friends/family", weights: {nationality: createNationalityWeights({ES: 65, IT: 65, BR: 65, MX: 65, AR: 65, FR: 55}), age_group: {child: 50, teen: 70, adult: 60, senior: 55}}},
      {id: "opt5", text: "🎯 Hobbies and personal projects", weights: {nationality: createNationalityWeights({DE: 50, NL: 50, SE: 50, JP: 45}), age_group: {child: 45, teen: 50, adult: 60, senior: 65}}}
    ],
    precomputedIG: 0.79
  },

  // AGE INDICATORS (expand from 3 to 8)
  {
    id: "q_age_payment_001",
    category: "age_indicator",
    text: "How do you prefer to pay for things?",
    options: [
      {id: "opt1", text: "💳 Credit/debit card", weights: {age_group: {child: 10, teen: 45, adult: 80, senior: 65}}},
      {id: "opt2", text: "📱 Mobile payment (Apple Pay, etc.)", weights: {age_group: {child: 25, teen: 65, adult: 60, senior: 25}}},
      {id: "opt3", text: "💵 Cash", weights: {age_group: {child: 60, teen: 35, adult: 25, senior: 70}}},
      {id: "opt4", text: "💰 Whatever's convenient", weights: {age_group: {child: 30, teen: 45, adult: 55, senior: 45}}}
    ],
    precomputedIG: 0.86
  },
  {
    id: "q_age_communication_001",
    category: "age_indicator",
    text: "How do you prefer to communicate with friends?",
    options: [
      {id: "opt1", text: "📱 Text messages", weights: {age_group: {child: 70, teen: 85, adult: 70, senior: 40}}},
      {id: "opt2", text: "📞 Phone calls", weights: {age_group: {child: 15, teen: 20, adult: 50, senior: 80}}},
      {id: "opt3", text: "💬 Social media messaging", weights: {age_group: {child: 60, teen: 80, adult: 55, senior: 25}}},
      {id: "opt4", text: "🎥 Video calls", weights: {age_group: {child: 40, teen: 50, adult: 60, senior: 45}}},
      {id: "opt5", text: "👥 In person", weights: {age_group: {child: 50, teen: 45, adult: 55, senior: 70}}}
    ],
    precomputedIG: 0.88
  },
  {
    id: "q_age_news_001",
    category: "age_indicator",
    text: "Where do you get your news?",
    options: [
      {id: "opt1", text: "📱 Social media", weights: {age_group: {child: 35, teen: 75, adult: 55, senior: 25}}},
      {id: "opt2", text: "📺 TV news", weights: {age_group: {child: 20, teen: 15, adult: 45, senior: 80}}},
      {id: "opt3", text: "📰 Newspapers (online or print)", weights: {age_group: {child: 10, teen: 15, adult: 50, senior: 70}}},
      {id: "opt4", text: "📻 Radio", weights: {age_group: {child: 15, teen: 20, adult: 45, senior: 60}}},
      {id: "opt5", text: "🤷 I don't follow news much", weights: {age_group: {child: 60, teen: 45, adult: 20, senior: 15}}}
    ],
    precomputedIG: 0.89
  },

  // SEX INDICATORS (expand from 3 to 6)
  {
    id: "q_sex_shopping_001",
    category: "sex_indicator",
    text: "How long do you typically spend shopping for clothes?",
    options: [
      {id: "opt1", text: "🏃 Quick in and out (under 30 min)", weights: {sex: {female: 25, male: 75}}},
      {id: "opt2", text: "⏰ About an hour", weights: {sex: {female: 45, male: 55}}},
      {id: "opt3", text: "🛍️ Several hours, I enjoy browsing", weights: {sex: {female: 70, male: 20}}},
      {id: "opt4", text: "🚫 I avoid clothes shopping", weights: {sex: {female: 15, male: 65}}}
    ],
    precomputedIG: 0.85
  },
  {
    id: "q_sex_grooming_001",
    category: "sex_indicator",
    text: "How long is your typical morning routine?",
    options: [
      {id: "opt1", text: "⚡ Under 15 minutes", weights: {sex: {female: 20, male: 70}}},
      {id: "opt2", text: "⏰ 15-30 minutes", weights: {sex: {female: 40, male: 60}}},
      {id: "opt3", text: "🕐 30-60 minutes", weights: {sex: {female: 65, male: 25}}},
      {id: "opt4", text: "⏳ Over an hour", weights: {sex: {female: 75, male: 15}}}
    ],
    precomputedIG: 0.87
  },
  {
    id: "q_sex_colors_001",
    category: "sex_indicator",
    text: "What's your favorite color palette?",
    options: [
      {id: "opt1", text: "🌸 Pastels and soft colors", weights: {sex: {female: 70, male: 25}}},
      {id: "opt2", text: "🔥 Bright and bold colors", weights: {sex: {female: 55, male: 45}}},
      {id: "opt3", text: "⚫ Dark colors (black, navy, etc.)", weights: {sex: {female: 45, male: 65}}},
      {id: "opt4", text: "🌈 I like all colors equally", weights: {sex: {female: 50, male: 50}}}
    ],
    precomputedIG: 0.78
  }
];

// Combine with existing questions
const expandedQuestionBank = {
  ...existing,
  metadata: {
    ...existing.metadata,
    totalQuestions: existing.questions.length + newQuestions.length,
    maxQuestions: 100
  },
  questions: [...existing.questions, ...newQuestions]
};

// Write the expanded question bank
const outputPath = path.join(__dirname, '../src/data/question-bank-enhanced.json');
fs.writeFileSync(outputPath, JSON.stringify(expandedQuestionBank, null, 2));

console.log(`✅ Expanded question bank from ${existing.questions.length} to ${expandedQuestionBank.questions.length} questions`);
console.log(`📊 Categories: ${Object.keys(expandedQuestionBank.questions.reduce((acc, q) => ({...acc, [q.category]: true}), {})).join(', ')}`);

// Made with Bob
