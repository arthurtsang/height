# Software Architecture Document: Adaptive Height Prediction Quiz

**Document ID**: SAD-002  
**Version**: 1.0  
**Date**: 2026-05-22  
**Status**: Draft

## 1. Executive Summary

This document describes the enhanced architecture for an adaptive height prediction quiz that uses confidence-based questioning to determine a user's nationality and relative height without directly asking about these attributes.

### Key Enhancements
- **Adaptive Questioning**: Dynamic question selection based on confidence levels
- **Real Data Integration**: Uses actual statistical data for country preferences and average heights
- **Confidence-Based Progression**: Stops asking questions when confidence threshold is reached
- **Two-Phase Approach**: Nationality identification → Relative height determination
- **No Fixed Question Limit**: Questions adapt to user responses

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
│  │         Adaptive Question Selection Engine            │  │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │  │
│  │  │  Confidence    │  │  Question Selection      │   │  │
│  │  │  Calculator    │  │  Strategy                │   │  │
│  │  └────────────────┘  └──────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Data Layer                                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │  │
│  │  │  Country   │  │  Question  │  │   Session    │  │  │
│  │  │  Stats DB  │  │  Bank      │  │   Store      │  │  │
│  │  └────────────┘  └────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
                    ┌──────────────┐
                    │    Redis     │
                    │   (Session)  │
                    └──────────────┘
```

### 2.2 Component Architecture

#### 2.2.1 Adaptive Question Selection Engine

**Purpose**: Dynamically selects questions based on current confidence levels and phase.

**Components**:
1. **Confidence Calculator**
   - Calculates probability distribution across countries
   - Tracks confidence level (0-100%)
   - Determines when to transition between phases

2. **Question Selection Strategy**
   - Phase 1: Nationality identification questions
   - Phase 2: Relative height determination questions
   - Selects most informative questions based on current state

3. **Phase Manager**
   - Manages transition between phases
   - Enforces max questions per phase
   - Determines quiz completion

#### 2.2.2 Country Statistics Database

**Purpose**: Stores real-world statistical data for nationality inference.

**Data Structure**:
```javascript
{
  "countries": [
    {
      "code": "US",
      "name": "United States",
      "avgHeight": {
        "male": 175.3,
        "female": 161.5,
        "overall": 168.4
      },
      "statistics": {
        "favoriteFoods": {
          "pizza": 0.35,
          "burgers": 0.28,
          "tacos": 0.15,
          // ... more foods with probabilities
        },
        "favoriteSports": {
          "football": 0.37,
          "basketball": 0.25,
          "baseball": 0.18,
          // ... more sports
        },
        "climatePreference": {
          "warm": 0.45,
          "moderate": 0.35,
          "cold": 0.20
        },
        "beveragePreferences": {
          "coffee": 0.65,
          "tea": 0.25,
          "other": 0.10
        },
        "transportMode": {
          "car": 0.85,
          "publicTransit": 0.08,
          "bike": 0.04,
          "walk": 0.03
        }
      }
    }
    // ... more countries
  ]
}
```

#### 2.2.3 Question Bank Structure

**Enhanced Question Format**:
```javascript
{
  "id": "q_food_001",
  "phase": "nationality",  // or "height_relative"
  "category": "food_preference",
  "text": "What's your go-to comfort food?",
  "options": [
    {
      "id": "opt1",
      "text": "🍕 Pizza",
      "countryWeights": {
        "US": 0.35,
        "IT": 0.45,
        "BR": 0.25,
        // ... probabilities for each country
      }
    },
    {
      "id": "opt2",
      "text": "🍜 Noodles",
      "countryWeights": {
        "CN": 0.55,
        "JP": 0.60,
        "TH": 0.50,
        // ...
      }
    }
    // ... more options
  ],
  "informationGain": 0.85  // How much this question reduces uncertainty
}
```

## 3. Adaptive Algorithm Design

### 3.1 Confidence-Based Progression

#### Phase 1: Nationality Identification

**Goal**: Determine user's likely nationality with ≥90% confidence

**Process**:
1. Start with uniform probability distribution across all countries
2. For each answer:
   - Update probability distribution using Bayesian inference
   - Calculate confidence = max(probability)
3. Continue until:
   - Confidence ≥ 90%, OR
   - Max questions reached (e.g., 15 questions)

**Bayesian Update Formula**:
```
P(Country|Answer) = P(Answer|Country) × P(Country) / P(Answer)

Where:
- P(Country) = current probability for country
- P(Answer|Country) = weight from question option
- P(Answer) = normalization factor
```

**Question Selection Strategy**:
- Calculate expected information gain for each unasked question
- Select question with highest information gain
- Prioritize questions that best discriminate between top candidates

#### Phase 2: Relative Height Determination

**Goal**: Determine if user is significantly above/below their country's average

**Categories**:
- Way Above: +15cm or more above average
- Above: +5cm to +15cm above average
- Average: -5cm to +5cm from average
- Below: -5cm to -15cm below average
- Way Below: -15cm or more below average

**Process**:
1. Use determined nationality's average height as baseline
2. Ask physical indicator questions (existing good questions)
3. Calculate relative height adjustment
4. Continue until:
   - Confidence in category ≥ 85%, OR
   - Max questions reached (e.g., 12 questions)

### 3.2 Information Gain Calculation

**Purpose**: Select most informative questions

**Formula**:
```
IG(Q) = H(current) - Σ P(answer) × H(after_answer)

Where:
- H = entropy of probability distribution
- H = -Σ P(country) × log2(P(country))
```

**Implementation**:
```javascript
function calculateInformationGain(question, currentDistribution) {
  const currentEntropy = calculateEntropy(currentDistribution);
  
  let expectedEntropy = 0;
  for (const option of question.options) {
    const newDistribution = updateDistribution(
      currentDistribution, 
      option.countryWeights
    );
    const optionProbability = calculateOptionProbability(
      option, 
      currentDistribution
    );
    expectedEntropy += optionProbability * calculateEntropy(newDistribution);
  }
  
  return currentEntropy - expectedEntropy;
}
```

## 4. Data Sources

### 4.1 Country Statistics Sources

**Recommended Public Data Sources**:

1. **Food Preferences**
   - World Food Atlas
   - Google Trends data (public)
   - Cultural food surveys

2. **Sports Preferences**
   - International sports federation data
   - Olympic viewership statistics
   - Sports participation surveys

3. **Average Heights**
   - WHO Global Health Observatory
   - NCD Risk Factor Collaboration
   - Country-specific health statistics

4. **Climate & Geography**
   - Köppen climate classification
   - Population distribution data

5. **Transportation**
   - OECD transport statistics
   - World Bank data

### 4.2 Data Collection Strategy

1. **Initial Dataset**: 20-30 major countries with reliable data
2. **Data Points per Country**: 50-100 statistical preferences
3. **Update Frequency**: Quarterly or as new data becomes available
4. **Data Validation**: Cross-reference multiple sources

## 5. API Design

### 5.1 Enhanced Endpoints

#### POST /api/session/start
**Response**:
```json
{
  "session_id": "uuid",
  "phase": "nationality",
  "question": {
    "id": "q_food_001",
    "text": "What's your go-to comfort food?",
    "category": "food_preference",
    "options": [...]
  },
  "progress": {
    "phase": "nationality",
    "questionsAsked": 1,
    "maxQuestions": 15,
    "confidence": 0.05
  }
}
```

#### POST /api/session/:sessionId/answer
**Request**:
```json
{
  "questionId": "q_food_001",
  "answerId": "opt1"
}
```

**Response** (Phase 1 continuing):
```json
{
  "completed": false,
  "phaseComplete": false,
  "next_question": {...},
  "progress": {
    "phase": "nationality",
    "questionsAsked": 2,
    "maxQuestions": 15,
    "confidence": 0.42,
    "topCandidates": [
      {"country": "US", "probability": 0.42},
      {"country": "CA", "probability": 0.28},
      {"country": "GB", "probability": 0.15}
    ]
  }
}
```

**Response** (Phase transition):
```json
{
  "completed": false,
  "phaseComplete": true,
  "phaseTransition": {
    "from": "nationality",
    "to": "height_relative"
  },
  "determinedCountry": {
    "code": "US",
    "name": "United States",
    "confidence": 0.93,
    "avgHeight": 168.4
  },
  "next_question": {...},
  "progress": {
    "phase": "height_relative",
    "questionsAsked": 1,
    "maxQuestions": 12,
    "confidence": 0.20
  }
}
```

#### GET /api/session/:sessionId/result
**Response**:
```json
{
  "nationality": {
    "country": "United States",
    "code": "US",
    "confidence": 0.93,
    "avgHeight": 168.4
  },
  "predictedHeight": {
    "cm": 178,
    "feet": 5,
    "inches": 10,
    "display": "5'10\"",
    "category": "above",
    "relativeToAvg": "+9.6cm"
  },
  "message": "You're taller than average for the United States! 🌟",
  "confidence": 0.87,
  "questionsAsked": 18,
  "share_text": "I'm predicted to be 5'10\" (178cm) - above average for the US! 🎯"
}
```

## 6. Performance Considerations

### 6.1 Question Selection Performance

- **Pre-compute information gain** for common scenarios
- **Cache probability distributions** during session
- **Limit candidate countries** to top 10 after initial questions
- **Target**: Question selection < 100ms

### 6.2 Session Storage

- **Store minimal state** in Redis
- **Compress probability distributions** (only non-zero values)
- **Session TTL**: 1 hour (adaptive quiz may take longer)

## 7. Privacy & Ethics

### 7.1 Data Collection

- **No PII collected**: Only anonymous quiz responses
- **No tracking**: No cookies or persistent identifiers
- **Transparent**: Clear about prediction methodology

### 7.2 Bias Mitigation

- **Diverse data sources**: Multiple countries and regions
- **Regular audits**: Check for systematic biases
- **User feedback**: Allow reporting of inappropriate questions
- **Inclusive design**: Questions work across cultures

## 8. Testing Strategy

### 8.1 Unit Tests

- Confidence calculation algorithm
- Bayesian update logic
- Information gain calculation
- Phase transition logic

### 8.2 Integration Tests

- Complete quiz flows
- Phase transitions
- Edge cases (low confidence, max questions)

### 8.3 Data Quality Tests

- Statistical data validation
- Probability sum checks (must equal 1.0)
- Country coverage verification

## 9. Deployment Architecture (Vercel)

### 9.1 Vercel Deployment

**Frontend**:
- Static site deployment
- Edge network distribution
- Automatic HTTPS

**Backend**:
- Serverless functions (API routes)
- Auto-scaling
- Global edge network

**Database**:
- Vercel KV (Redis-compatible) for sessions
- Vercel Postgres for country statistics (optional)
- Or use external Redis (Upstash)

### 9.2 Environment Configuration

```
# Vercel Environment Variables
REDIS_URL=<vercel-kv-url>
NODE_ENV=production
CORS_ORIGIN=https://height-quiz.vercel.app
```

## 10. Future Enhancements

1. **Machine Learning**: Train model on actual user data
2. **Multi-language Support**: Questions in multiple languages
3. **Regional Variations**: Sub-national statistics (US states, etc.)
4. **Historical Trends**: Track how preferences change over time
5. **Social Features**: Compare with friends, leaderboards

## 11. Success Metrics

- **Accuracy**: User-reported accuracy of predictions
- **Engagement**: Average questions per session
- **Completion Rate**: % of users who complete quiz
- **Confidence Levels**: Distribution of final confidence scores
- **Performance**: API response times < 200ms

---

**Document Approval**:
- Architecture: Pending Review
- Implementation: Ready to Start