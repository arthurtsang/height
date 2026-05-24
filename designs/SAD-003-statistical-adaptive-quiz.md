# Software Architecture Document: Statistical Adaptive Height Quiz

**Document ID**: SAD-003  
**Version**: 1.0  
**Date**: 2026-05-24  
**Status**: Draft  
**Supersedes**: SAD-002

## 1. Executive Summary

This document describes an enhanced adaptive height prediction quiz that uses real-world statistical data to subtly infer a user's nationality through cultural preference questions, then determines their relative height compared to their country's average. The system uses confidence-based questioning with no fixed question limits, stopping only when sufficient confidence is achieved or phase-specific maximums are reached.

### Key Innovations

- **Subtle Nationality Detection**: Uses real statistical data (food preferences, sports, climate, transportation) instead of direct questions
- **Real Data Integration**: Pulls from public domain sources (WHO, OECD, cultural surveys)
- **Bayesian Inference**: Mathematically sound probability updates
- **Information Gain Optimization**: Selects most informative questions dynamically
- **Two-Phase Confidence System**: Separate confidence thresholds for nationality (90%) and height (85%)
- **No Total Question Limit**: Adapts to user responses, only phase-specific maximums
- **Internal Phase Management**: Phases are invisible to users for seamless experience

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Welcome    │→ │   Question   │→ │    Result    │     │
│  │   Screen     │  │   Screen     │  │    Screen    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                    REST API (JSON)
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Node.js/Express)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Statistical Inference Engine                     │  │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │  │
│  │  │   Bayesian     │  │  Information Gain        │   │  │
│  │  │   Updater      │  │  Calculator              │   │  │
│  │  └────────────────┘  └──────────────────────────┘   │  │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │  │
│  │  │   Question     │  │  Phase Manager           │   │  │
│  │  │   Selector     │  │  (Internal)              │   │  │
│  │  └────────────────┘  └──────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Statistical Data Layer                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │  Country   │  │  Enhanced  │  │   Session    │  │  │
│  │  │  Stats DB  │  │  Question  │  │   Store      │  │  │
│  │  │  (JSON)    │  │  Bank      │  │   (Redis)    │  │  │
│  │  └────────────┘  └────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Core Components

#### 2.2.1 Statistical Inference Engine

**Purpose**: Dynamically determines nationality and height using statistical methods.

**Sub-Components**:

1. **Bayesian Updater**
   - Updates probability distribution across countries
   - Implements: `P(Country|Answer) = P(Answer|Country) × P(Country) / P(Answer)`
   - Maintains numerical stability (log-space calculations)
   - Normalizes probabilities to sum to 1.0

2. **Information Gain Calculator**
   - Calculates entropy: `H = -Σ P(country) × log2(P(country))`
   - Computes expected information gain for each unasked question
   - Selects questions that maximize uncertainty reduction
   - Pre-computes gains for common scenarios

3. **Question Selector**
   - Phase-aware question selection
   - Filters questions by phase (nationality vs height_relative)
   - Excludes already-asked questions
   - Prioritizes high information gain questions
   - Considers question diversity (category balancing)

4. **Phase Manager** (Internal - Not Exposed to User)
   - Tracks current phase: `nationality` or `height_relative`
   - Monitors confidence levels per phase
   - Enforces phase-specific question maximums
   - Triggers phase transitions automatically
   - Determines quiz completion

#### 2.2.2 Country Statistics Database

**Purpose**: Stores real-world statistical data for nationality inference.

**Data Structure**:
```javascript
{
  "version": "1.0",
  "lastUpdated": "2026-05-24",
  "sources": {
    "heights": "WHO Global Health Observatory, NCD Risk Factor Collaboration",
    "food": "World Food Atlas, Google Trends, Cultural Surveys",
    "sports": "International Sports Federations, Olympic Data",
    "climate": "Köppen Climate Classification",
    "transport": "OECD Transport Statistics, World Bank"
  },
  "countries": [
    {
      "code": "US",
      "name": "United States",
      "avgHeight": {
        "male": 175.3,
        "female": 161.5,
        "overall": 168.4,
        "source": "CDC NHANES 2015-2018"
      },
      "statistics": {
        "favoriteFoods": {
          "pizza": 0.28,
          "burgers": 0.24,
          "tacos": 0.15,
          "pasta": 0.12,
          "sushi": 0.08,
          "curry": 0.05,
          "noodles": 0.04,
          "other": 0.04
        },
        "favoriteSports": {
          "football": 0.37,
          "basketball": 0.25,
          "baseball": 0.18,
          "soccer": 0.10,
          "hockey": 0.05,
          "other": 0.05
        },
        "climatePreference": {
          "warm": 0.45,
          "moderate": 0.35,
          "cold": 0.20
        },
        "beveragePreferences": {
          "coffee": 0.65,
          "tea": 0.20,
          "soda": 0.10,
          "juice": 0.05
        },
        "primaryTransport": {
          "car": 0.85,
          "publicTransit": 0.08,
          "bike": 0.04,
          "walk": 0.03
        },
        "workStyle": {
          "office": 0.55,
          "remote": 0.25,
          "hybrid": 0.15,
          "outdoor": 0.05
        },
        "housingType": {
          "house": 0.62,
          "apartment": 0.30,
          "condo": 0.06,
          "other": 0.02
        }
      }
    },
    {
      "code": "JP",
      "name": "Japan",
      "avgHeight": {
        "male": 171.0,
        "female": 158.0,
        "overall": 164.5,
        "source": "Japanese Ministry of Health 2020"
      },
      "statistics": {
        "favoriteFoods": {
          "noodles": 0.35,
          "sushi": 0.25,
          "rice": 0.20,
          "curry": 0.08,
          "pizza": 0.05,
          "burgers": 0.04,
          "other": 0.03
        },
        "favoriteSports": {
          "baseball": 0.35,
          "soccer": 0.25,
          "sumo": 0.15,
          "basketball": 0.10,
          "volleyball": 0.08,
          "other": 0.07
        },
        "climatePreference": {
          "moderate": 0.50,
          "warm": 0.30,
          "cold": 0.20
        },
        "beveragePreferences": {
          "tea": 0.60,
          "coffee": 0.25,
          "sake": 0.10,
          "other": 0.05
        },
        "primaryTransport": {
          "publicTransit": 0.60,
          "car": 0.25,
          "bike": 0.10,
          "walk": 0.05
        },
        "workStyle": {
          "office": 0.70,
          "hybrid": 0.15,
          "remote": 0.10,
          "outdoor": 0.05
        },
        "housingType": {
          "apartment": 0.55,
          "house": 0.35,
          "condo": 0.08,
          "other": 0.02
        }
      }
    }
    // ... 18-28 more countries with complete data
  ]
}
```

**Data Requirements**:
- Minimum 20 countries with complete statistical profiles
- All probability distributions must sum to 1.0
- Data sourced from reputable public domain sources
- Regular updates (quarterly) to maintain accuracy
- Source attribution for transparency

#### 2.2.3 Enhanced Question Bank

**Question Format**:
```javascript
{
  "id": "q_food_comfort_001",
  "phase": "nationality",  // or "height_relative"
  "category": "food_preference",
  "text": "What's your go-to comfort food when you're feeling down?",
  "options": [
    {
      "id": "opt1",
      "text": "🍕 Pizza",
      "countryWeights": {
        "US": 0.28,
        "IT": 0.35,
        "GB": 0.22,
        "CA": 0.25,
        "AU": 0.24,
        "DE": 0.18,
        "FR": 0.20,
        "ES": 0.22,
        "BR": 0.20,
        "MX": 0.15,
        "JP": 0.05,
        "CN": 0.03,
        "IN": 0.04,
        "KR": 0.06,
        "NL": 0.19,
        "DK": 0.18,
        "NO": 0.17,
        "SE": 0.16
      }
    },
    {
      "id": "opt2",
      "text": "🍜 Noodles or ramen",
      "countryWeights": {
        "JP": 0.35,
        "CN": 0.40,
        "KR": 0.38,
        "TH": 0.35,
        "VN": 0.40,
        "US": 0.04,
        "IT": 0.08,
        "GB": 0.03,
        "CA": 0.05,
        "AU": 0.06
      }
    },
    {
      "id": "opt3",
      "text": "🌮 Tacos or burritos",
      "countryWeights": {
        "MX": 0.45,
        "US": 0.15,
        "ES": 0.08,
        "CA": 0.10,
        "AU": 0.05,
        "GB": 0.04
      }
    },
    {
      "id": "opt4",
      "text": "🍛 Curry",
      "countryWeights": {
        "IN": 0.50,
        "GB": 0.18,
        "JP": 0.08,
        "TH": 0.25,
        "US": 0.05,
        "CA": 0.08
      }
    },
    {
      "id": "opt5",
      "text": "🍔 Burgers",
      "countryWeights": {
        "US": 0.24,
        "CA": 0.22,
        "AU": 0.25,
        "GB": 0.20,
        "DE": 0.15,
        "NL": 0.18
      }
    }
  ],
  "precomputedIG": 0.85  // Information gain score (0-1)
}
```

**Height-Relative Question Format**:
```javascript
{
  "id": "q_physical_airplane_001",
  "phase": "height_relative",
  "category": "physical_comfort",
  "text": "How do you feel about airplane legroom in economy class?",
  "options": [
    {
      "id": "opt1",
      "text": "✈️ Plenty of space, very comfortable",
      "heightAdjustment": -12,  // cm relative to country average
      "confidence": 0.85
    },
    {
      "id": "opt2",
      "text": "😊 Comfortable enough, no complaints",
      "heightAdjustment": -5,
      "confidence": 0.70
    },
    {
      "id": "opt3",
      "text": "😐 A bit tight, manageable",
      "heightAdjustment": 3,
      "confidence": 0.65
    },
    {
      "id": "opt4",
      "text": "😣 Very cramped, knees hit the seat",
      "heightAdjustment": 10,
      "confidence": 0.80
    },
    {
      "id": "opt5",
      "text": "😤 Extremely uncomfortable, can't fit",
      "heightAdjustment": 18,
      "confidence": 0.90
    }
  ],
  "precomputedIG": 0.78
}
```

## 3. Adaptive Algorithm Design

### 3.1 Phase 1: Nationality Identification

**Goal**: Determine user's nationality with ≥90% confidence

**Algorithm**:
```
1. Initialize uniform probability distribution:
   P(country) = 1/N for all N countries

2. For each question:
   a. Calculate information gain for all unasked nationality questions
   b. Select question with highest IG
   c. Present question to user
   d. Receive answer
   e. Update probability distribution using Bayesian inference:
      P(Country|Answer) = P(Answer|Country) × P(Country) / P(Answer)
      where P(Answer|Country) = countryWeight from question option
   f. Normalize probabilities to sum to 1.0
   g. Calculate confidence = max(P(country))
   h. Check termination:
      - If confidence ≥ 0.90: proceed to Phase 2
      - If questions asked ≥ 15: proceed to Phase 2 with best guess
      - Otherwise: continue to next question

3. Determine nationality:
   - Select country with highest probability
   - Record confidence level
   - Retrieve country's average height
```

**Bayesian Update Implementation**:
```javascript
function updateProbabilities(currentDist, answer) {
  const newDist = {};
  let sum = 0;
  
  // Update each country's probability
  for (const [country, prob] of Object.entries(currentDist)) {
    const likelihood = answer.countryWeights[country] || 0.01; // Small default
    newDist[country] = likelihood * prob;
    sum += newDist[country];
  }
  
  // Normalize
  for (const country in newDist) {
    newDist[country] /= sum;
  }
  
  return newDist;
}
```

**Information Gain Calculation**:
```javascript
function calculateEntropy(distribution) {
  let entropy = 0;
  for (const prob of Object.values(distribution)) {
    if (prob > 0) {
      entropy -= prob * Math.log2(prob);
    }
  }
  return entropy;
}

function calculateInformationGain(question, currentDist) {
  const currentEntropy = calculateEntropy(currentDist);
  let expectedEntropy = 0;
  
  // For each possible answer
  for (const option of question.options) {
    // Simulate choosing this option
    const newDist = updateProbabilities(currentDist, option);
    const newEntropy = calculateEntropy(newDist);
    
    // Weight by probability of choosing this option
    const optionProb = calculateOptionProbability(option, currentDist);
    expectedEntropy += optionProb * newEntropy;
  }
  
  return currentEntropy - expectedEntropy;
}

function calculateOptionProbability(option, currentDist) {
  let prob = 0;
  for (const [country, countryProb] of Object.entries(currentDist)) {
    const weight = option.countryWeights[country] || 0.01;
    prob += countryProb * weight;
  }
  return prob;
}
```

### 3.2 Phase 2: Relative Height Determination

**Goal**: Determine height category relative to country average with ≥85% confidence

**Height Categories**:
- **Way Below**: -15cm or more below average (< -15cm)
- **Below**: -5cm to -15cm below average
- **Average**: -5cm to +5cm from average
- **Above**: +5cm to +15cm above average
- **Way Above**: +15cm or more above average (> +15cm)

**Algorithm**:
```
1. Initialize:
   - baseHeight = determined country's average height
   - heightAdjustment = 0
   - categoryProbabilities = uniform distribution across 5 categories

2. For each question:
   a. Calculate information gain for all unasked height questions
   b. Select question with highest IG
   c. Present question to user
   d. Receive answer
   e. Update height adjustment:
      heightAdjustment += answer.heightAdjustment
   f. Update category probabilities based on adjustment
   g. Calculate confidence = max(categoryProbability)
   h. Check termination:
      - If confidence ≥ 0.85: complete quiz
      - If questions asked ≥ 12: complete quiz with best guess
      - Otherwise: continue to next question

3. Calculate final height:
   - predictedHeight = baseHeight + heightAdjustment
   - Add small random factor (±2cm) for variety
   - Clamp to reasonable range (147-208cm)
   - Determine category
```

**Category Probability Update**:
```javascript
function updateCategoryProbabilities(currentProbs, adjustment, totalAdjustment) {
  // Map total adjustment to category probabilities
  const categories = ['way_below', 'below', 'average', 'above', 'way_above'];
  const newProbs = {};
  
  // Use Gaussian distribution centered on total adjustment
  const sigma = 8; // Standard deviation
  for (const category of categories) {
    const categoryCenter = getCategoryCenter(category);
    const distance = Math.abs(totalAdjustment - categoryCenter);
    newProbs[category] = Math.exp(-(distance * distance) / (2 * sigma * sigma));
  }
  
  // Normalize
  const sum = Object.values(newProbs).reduce((a, b) => a + b, 0);
  for (const category in newProbs) {
    newProbs[category] /= sum;
  }
  
  return newProbs;
}

function getCategoryCenter(category) {
  const centers = {
    'way_below': -20,
    'below': -10,
    'average': 0,
    'above': 10,
    'way_above': 20
  };
  return centers[category];
}
```

### 3.3 Question Selection Strategy

**Priority Factors**:
1. **Information Gain** (weight: 0.6): Maximize uncertainty reduction
2. **Category Diversity** (weight: 0.2): Balance question categories
3. **Recency** (weight: 0.2): Avoid similar questions in succession

```javascript
function selectNextQuestion(phase, askedQuestions, currentState) {
  const availableQuestions = getAvailableQuestions(phase, askedQuestions);
  
  let bestQuestion = null;
  let bestScore = -Infinity;
  
  for (const question of availableQuestions) {
    // Calculate information gain
    const ig = calculateInformationGain(question, currentState);
    
    // Category diversity bonus
    const categoryBonus = getCategoryDiversityBonus(
      question.category, 
      askedQuestions
    );
    
    // Recency penalty
    const recencyPenalty = getRecencyPenalty(
      question.category, 
      askedQuestions
    );
    
    // Combined score
    const score = (ig * 0.6) + (categoryBonus * 0.2) - (recencyPenalty * 0.2);
    
    if (score > bestScore) {
      bestScore = score;
      bestQuestion = question;
    }
  }
  
  return bestQuestion;
}
```

## 4. Data Sources & Collection

### 4.1 Recommended Public Data Sources

**Height Data**:
- WHO Global Health Observatory
- NCD Risk Factor Collaboration (2016 study)
- Country-specific health ministries
- CDC (US), NHS (UK), etc.

**Food Preferences**:
- Google Trends (public data)
- World Food Atlas
- Cultural food surveys (academic)
- National dietary surveys

**Sports Preferences**:
- International Olympic Committee data
- FIFA, NBA, NFL viewership statistics
- Sports participation surveys
- Nielsen Sports data (public reports)

**Climate & Geography**:
- Köppen climate classification
- World Bank climate data
- Population distribution data

**Transportation**:
- OECD Transport Statistics
- World Bank transport data
- National transportation surveys

**Lifestyle**:
- OECD Better Life Index
- World Happiness Report
- National census data

### 4.2 Data Collection Process

1. **Initial Dataset**: 20-30 countries with reliable data
2. **Priority Countries**: US, UK, Canada, Australia, Germany, France, Italy, Spain, Netherlands, Denmark, Norway, Sweden, Japan, China, South Korea, India, Brazil, Mexico, Argentina, Thailand
3. **Data Points per Country**: 50-100 statistical preferences
4. **Validation**: Cross-reference multiple sources
5. **Update Frequency**: Quarterly review, annual major updates
6. **Quality Checks**: Probability sums, outlier detection, consistency checks

## 5. API Design

### 5.1 Session Start

**Endpoint**: `POST /api/session/start`

**Request**: Empty body

**Response**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": {
    "id": "q_food_comfort_001",
    "text": "What's your go-to comfort food when you're feeling down?",
    "category": "food_preference",
    "options": [
      {"id": "opt1", "text": "🍕 Pizza"},
      {"id": "opt2", "text": "🍜 Noodles or ramen"},
      {"id": "opt3", "text": "🌮 Tacos or burritos"},
      {"id": "opt4", "text": "🍛 Curry"},
      {"id": "opt5", "text": "🍔 Burgers"}
    ]
  },
  "progress": {
    "questionsAsked": 1,
    "estimatedRemaining": "5-15"
  }
}
```

**Note**: Phase information is NOT exposed to user

### 5.2 Answer Submission

**Endpoint**: `POST /api/session/:sessionId/answer`

**Request**:
```json
{
  "questionId": "q_food_comfort_001",
  "answerId": "opt1"
}
```

**Response (continuing)**:
```json
{
  "completed": false,
  "question": {
    "id": "q_transport_daily_001",
    "text": "How do you usually get around town?",
    "category": "transportation",
    "options": [...]
  },
  "progress": {
    "questionsAsked": 3,
    "estimatedRemaining": "3-12"
  }
}
```

**Response (completed)**:
```json
{
  "completed": true,
  "message": "Quiz completed! Calculating your results..."
}
```

### 5.3 Result Retrieval

**Endpoint**: `GET /api/session/:sessionId/result`

**Response**:
```json
{
  "predictedHeight": {
    "cm": 178,
    "feet": 5,
    "inches": 10,
    "display": "5'10\"",
    "category": "above",
    "categoryDescription": "Above Average"
  },
  "insights": {
    "countryContext": "Based on your preferences, you seem to align with United States cultural patterns.",
    "heightContext": "You're taller than about 65% of people in the United States.",
    "relativeToAvg": "+9.6cm above average"
  },
  "message": "You're taller than average! 🌟",
  "confidence": 0.87,
  "questionsAsked": 18,
  "breakdown": {
    "culturalQuestions": 8,
    "physicalQuestions": 10
  },
  "shareText": "I'm predicted to be 5'10\" (178cm) - above average! 🎯 #HeightQuiz"
}
```

**Note**: Nationality is implied through "cultural patterns" but not explicitly stated

## 6. Performance Optimization

### 6.1 Computation Optimization

- **Pre-compute Information Gain**: Cache IG scores for common scenarios
- **Lazy Evaluation**: Only calculate IG for top candidates
- **Probability Pruning**: Drop countries with P < 0.01 after 5 questions
- **Log-Space Calculations**: Prevent numerical underflow
- **Target**: Question selection < 100ms, total response < 200ms

### 6.2 Session Storage Optimization

```javascript
// Compressed session state
{
  "sessionId": "uuid",
  "phase": 1,  // 1=nationality, 2=height_relative
  "askedQuestions": ["q1", "q2", "q3"],
  "probDist": {
    // Only store non-zero probabilities
    "US": 0.58,
    "CA": 0.22,
    "GB": 0.12,
    "AU": 0.08
  },
  "heightAdj": 12,
  "categoryProbs": [0.05, 0.15, 0.30, 0.35, 0.15],
  "determinedCountry": null,  // Set after phase 1
  "baseHeight": null,
  "createdAt": 1716508477892,
  "ttl": 3600
}
```

## 7. Privacy & Ethics

### 7.1 Privacy Protection

- **No PII**: Only anonymous quiz responses stored
- **No Tracking**: No cookies, fingerprinting, or persistent IDs
- **Session Expiry**: 1-hour TTL, auto-deletion
- **No IP Logging**: Except for abuse prevention (optional)
- **Transparent**: Clear about methodology in FAQ

### 7.2 Ethical Considerations

- **Cultural Sensitivity**: Questions reviewed by diverse team
- **No Stereotyping**: Based on statistical data, not assumptions
- **Inclusive Design**: Works across cultures and backgrounds
- **User Control**: Can skip questions, restart anytime
- **Bias Auditing**: Regular reviews for systematic biases
- **Feedback Mechanism**: Users can report inappropriate questions

### 7.3 Data Ethics

- **Source Attribution**: All data sources cited
- **Public Domain**: Only use publicly available data
- **Regular Updates**: Keep data current and accurate
- **Transparency**: Methodology documented and available

## 8. Testing Strategy

### 8.1 Algorithm Testing

```javascript
describe('Bayesian Inference', () => {
  test('probabilities sum to 1.0 after update', () => {
    const dist = updateProbabilities(initialDist, answer);
    const sum = Object.values(dist).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
  
  test('confidence increases with consistent answers', () => {
    // Simulate user from US answering consistently
    let dist = uniformDistribution();
    const usAnswers = getUSTypicalAnswers();
    
    for (const answer of usAnswers) {
      dist = updateProbabilities(dist, answer);
    }
    
    expect(dist['US']).toBeGreaterThan(0.80);
  });
});

describe('Information Gain', () => {
  test('IG is positive for non-uniform distribution', () => {
    const dist = { US: 0.6, CA: 0.3, GB: 0.1 };
    const ig = calculateInformationGain(question, dist);
    expect(ig).toBeGreaterThan(0);
  });
  
  test('IG is zero for certain distribution', () => {
    const dist = { US: 1.0 };
    const ig = calculateInformationGain(question, dist);
    expect(ig).toBe(0);
  });
});
```

### 8.2 Integration Testing

- Complete quiz flows (various answer patterns)
- Phase transitions
- Edge cases (max questions, low confidence)
- Error scenarios (invalid inputs, expired sessions)

### 8.3 Data Quality Testing

- Probability sum validation
- Country code validation
- Question ID uniqueness
- Country weight coverage (all countries represented)

## 9. Deployment (Vercel)

### 9.1 Architecture

- **Frontend**: Static React app, edge-cached
- **Backend**: Serverless functions (API routes)
- **Database**: Vercel KV (Redis) for sessions
- **Static Data**: Country stats and questions in JSON files

### 9.2 Environment Variables

```bash
REDIS_URL=<vercel-kv-url>
NODE_ENV=production
CORS_ORIGIN=https://height-quiz.vercel.app
MAX_NATIONALITY_QUESTIONS=15
MAX_HEIGHT_QUESTIONS=12
NATIONALITY_CONFIDENCE_THRESHOLD=0.90
HEIGHT_CONFIDENCE_THRESHOLD=0.85
```

## 10. Success Metrics

### 10.1 Accuracy Metrics

- User-reported nationality accuracy ≥ 75%
- User-reported height accuracy ≥ 70%
- Average confidence at completion ≥ 85%

### 10.2 User Experience Metrics

- Average questions per quiz: 15-20
- Quiz completion rate ≥ 70%
- Average time to complete: 3-5 minutes
- User satisfaction score ≥ 4/5

### 10.3 Technical Metrics

- API response time < 200ms (p95)
- Question selection time < 100ms
- Session storage < 5KB per session
- Zero data loss on session expiry

## 11. Future Enhancements

1. **Machine Learning**: Train on actual user feedback
2. **Regional Variations**: Sub-national statistics (US states, UK regions)
3. **Multi-language**: Questions in multiple languages
4. **Historical Trends**: Track preference changes over time
5. **Social Features**: Compare with friends (opt-in)
6. **Expanded Coverage**: 50+ countries
7. **Gender-Specific**: Optional gender-based height averages
8. **Age Adjustment**: Consider age-related height variations

---

**Document Approval**:
- Architecture Lead: Pending Review
- Data Science Lead: Pending Review
- Privacy Officer: Pending Review
- Implementation: Ready to Start