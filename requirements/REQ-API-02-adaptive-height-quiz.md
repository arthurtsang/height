# Requirements: Adaptive Height Prediction Quiz API

**Requirement ID**: REQ-API-02  
**Version**: 1.0  
**Date**: 2026-05-22  
**Status**: Draft  
**Priority**: High  
**Supersedes**: REQ-API-01

## 1. Overview

### 1.1 Purpose
Enhance the height prediction quiz to use an adaptive, confidence-based questioning system that determines nationality through subtle cultural preference questions and predicts height relative to national averages.

### 1.2 Scope
- Adaptive question selection based on confidence levels
- Two-phase questioning: nationality identification → relative height determination
- Real statistical data integration
- No fixed question limit (adaptive based on confidence)
- Removal of session-based rate limiting
- Vercel deployment support

## 2. Functional Requirements

### 2.1 Adaptive Question Selection

#### FR-2.1.1: Confidence-Based Progression
**Priority**: Critical  
**Description**: System must dynamically select questions based on current confidence levels.

**Acceptance Criteria**:
- [ ] System maintains probability distribution across all countries
- [ ] Confidence calculated as max(probability) in distribution
- [ ] Questions selected based on maximum information gain
- [ ] System transitions between phases when confidence threshold reached
- [ ] No fixed total question limit (only per-phase maximums)

**Context**: Unlike the previous fixed 7-question approach, the system adapts to user responses and stops when confident enough.

**Persona**: As a user, I want the quiz to be as short as possible while still being accurate, so I don't waste time on unnecessary questions.

---

#### FR-2.1.2: Phase 1 - Nationality Identification
**Priority**: Critical  
**Description**: Determine user's likely nationality through cultural preference questions.

**Acceptance Criteria**:
- [ ] Questions are subtle and indirect (no "Where are you from?")
- [ ] Questions cover: food preferences, sports, climate, beverages, transportation, hobbies
- [ ] Each answer updates probability distribution using Bayesian inference
- [ ] Phase completes when confidence ≥ 90% OR max 15 questions reached
- [ ] Top 3 candidate countries tracked and displayed in progress
- [ ] Questions avoid stereotypes and are culturally sensitive

**Context**: Users should not realize they're being asked about nationality. Questions should feel like personality/preference questions.

**Persona**: As a user, I want to answer fun questions about my preferences without feeling like I'm being profiled or stereotyped.

---

#### FR-2.1.3: Phase 2 - Relative Height Determination
**Priority**: Critical  
**Description**: Determine if user is significantly above/below their country's average height.

**Acceptance Criteria**:
- [ ] Uses determined nationality's average height as baseline
- [ ] Questions focus on physical indicators (doorways, legroom, shelves, etc.)
- [ ] Categorizes into 5 levels: Way Above, Above, Average, Below, Way Below
- [ ] Phase completes when confidence ≥ 85% OR max 12 questions reached
- [ ] Reuses good questions from existing question bank
- [ ] No direct questions about height or comparisons to others

**Context**: After knowing the country, we need to determine relative height without asking "Are you tall?"

**Persona**: As a user, I want the quiz to accurately predict my height without me having to tell it directly.

---

### 2.2 Data Integration

#### FR-2.2.1: Country Statistics Database
**Priority**: Critical  
**Description**: Integrate real-world statistical data for nationality inference.

**Acceptance Criteria**:
- [ ] Database includes 20-30 major countries with reliable data
- [ ] Each country has average height data (male, female, overall)
- [ ] Statistical preferences stored with probabilities (sum to 1.0)
- [ ] Data categories: food, sports, climate, beverages, transportation
- [ ] Data sourced from reputable public sources (WHO, OECD, etc.)
- [ ] Data validation ensures probability distributions are valid
- [ ] Data can be updated without code changes

**Context**: Predictions must be based on real data, not assumptions or stereotypes.

**Persona**: As a developer, I want to use verified statistical data so the predictions are accurate and defensible.

---

#### FR-2.2.2: Question Bank with Country Weights
**Priority**: Critical  
**Description**: Enhanced question format with country probability weights.

**Acceptance Criteria**:
- [ ] Each question has phase indicator (nationality or height_relative)
- [ ] Each option has countryWeights object with probabilities
- [ ] Questions have pre-calculated information gain scores
- [ ] Minimum 50 nationality questions covering diverse preferences
- [ ] Minimum 30 height-relative questions (physical indicators)
- [ ] Questions validated for cultural sensitivity
- [ ] Questions avoid direct nationality or height references

**Context**: Questions must be informative enough to discriminate between countries while being subtle.

**Persona**: As a content creator, I want to write questions that are fun and engaging while being statistically useful.

---

### 2.3 API Endpoints

#### FR-2.3.1: Enhanced Session Start
**Priority**: Critical  
**Description**: Start adaptive quiz session with first question.

**Endpoint**: `POST /api/session/start`

**Request**: Empty body

**Response**:
```json
{
  "session_id": "uuid",
  "phase": "nationality",
  "question": {
    "id": "q_food_001",
    "text": "What's your go-to comfort food?",
    "category": "food_preference",
    "options": [
      {"id": "opt1", "text": "🍕 Pizza"},
      {"id": "opt2", "text": "🍜 Noodles"},
      {"id": "opt3", "text": "🌮 Tacos"},
      {"id": "opt4", "text": "🍛 Curry"}
    ]
  },
  "progress": {
    "phase": "nationality",
    "questionsAsked": 1,
    "maxQuestions": 15,
    "confidence": 0.05
  }
}
```

**Acceptance Criteria**:
- [ ] Creates new session in Redis with 1-hour TTL
- [ ] Initializes uniform probability distribution
- [ ] Selects first question with highest information gain
- [ ] Returns session ID, question, and progress
- [ ] Response time < 200ms

---

#### FR-2.3.2: Enhanced Answer Submission
**Priority**: Critical  
**Description**: Submit answer and receive next question or phase transition.

**Endpoint**: `POST /api/session/:sessionId/answer`

**Request**:
```json
{
  "questionId": "q_food_001",
  "answerId": "opt1"
}
```

**Response (continuing same phase)**:
```json
{
  "completed": false,
  "phaseComplete": false,
  "next_question": {...},
  "progress": {
    "phase": "nationality",
    "questionsAsked": 3,
    "maxQuestions": 15,
    "confidence": 0.58,
    "topCandidates": [
      {"country": "US", "name": "United States", "probability": 0.58},
      {"country": "CA", "name": "Canada", "probability": 0.22},
      {"country": "GB", "name": "United Kingdom", "probability": 0.12}
    ]
  }
}
```

**Response (phase transition)**:
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

**Response (quiz complete)**:
```json
{
  "completed": true,
  "phaseComplete": true,
  "message": "Quiz completed! Check your result."
}
```

**Acceptance Criteria**:
- [ ] Validates session exists and not expired
- [ ] Validates question ID matches current question
- [ ] Updates probability distribution using Bayesian inference
- [ ] Calculates new confidence level
- [ ] Selects next question with highest information gain
- [ ] Detects phase completion (confidence ≥ threshold OR max questions)
- [ ] Handles phase transition automatically
- [ ] Detects quiz completion
- [ ] Returns appropriate response based on state
- [ ] Response time < 200ms

---

#### FR-2.3.3: Enhanced Result Retrieval
**Priority**: Critical  
**Description**: Get final prediction with nationality and height.

**Endpoint**: `GET /api/session/:sessionId/result`

**Response**:
```json
{
  "nationality": {
    "country": "United States",
    "code": "US",
    "confidence": 0.93,
    "avgHeight": 168.4,
    "questionsAsked": 8
  },
  "predictedHeight": {
    "cm": 178,
    "feet": 5,
    "inches": 10,
    "display": "5'10\"",
    "category": "above",
    "relativeToAvg": "+9.6cm",
    "percentile": 65
  },
  "message": "You're taller than average for the United States! 🌟",
  "confidence": 0.87,
  "totalQuestionsAsked": 18,
  "breakdown": {
    "nationalityPhase": {
      "questions": 8,
      "confidence": 0.93
    },
    "heightPhase": {
      "questions": 10,
      "confidence": 0.87
    }
  },
  "share_text": "I'm predicted to be 5'10\" (178cm) - above average for the US! 🎯 #HeightQuiz"
}
```

**Acceptance Criteria**:
- [ ] Returns error if session not completed
- [ ] Includes nationality determination with confidence
- [ ] Includes height prediction with category
- [ ] Shows relative difference from country average
- [ ] Provides fun, personalized message
- [ ] Includes breakdown of questions per phase
- [ ] Generates shareable text
- [ ] Response time < 200ms

---

### 2.4 Rate Limiting

#### FR-2.4.1: Remove Session-Based Rate Limiting
**Priority**: High  
**Description**: Remove the limit on number of sessions per IP per time period.

**Acceptance Criteria**:
- [ ] Remove existing rate limiter middleware from session routes
- [ ] Users can play quiz unlimited times
- [ ] No restrictions on session creation frequency
- [ ] Remove rate limit configuration from config file

**Context**: Users should be able to replay the quiz as many times as they want without restrictions.

**Persona**: As a user, I want to try the quiz multiple times with different answers to see how it works, without being blocked.

---

#### FR-2.4.2: Concurrent Connection Limiting (Optional)
**Priority**: Low  
**Description**: Optionally limit concurrent connections from same IP to prevent abuse.

**Acceptance Criteria**:
- [ ] Track active sessions per IP address
- [ ] Limit to reasonable number (e.g., 5 concurrent sessions)
- [ ] Return 429 error if limit exceeded
- [ ] Automatically clean up when sessions complete
- [ ] Does not prevent sequential plays

**Context**: Prevent abuse while allowing legitimate use.

**Persona**: As a system administrator, I want to prevent abuse without impacting normal users.

---

### 2.5 Algorithm Requirements

#### FR-2.5.1: Bayesian Inference
**Priority**: Critical  
**Description**: Update probability distribution using Bayesian inference.

**Formula**:
```
P(Country|Answer) = P(Answer|Country) × P(Country) / P(Answer)
```

**Acceptance Criteria**:
- [ ] Implements correct Bayesian update formula
- [ ] Normalizes probabilities to sum to 1.0
- [ ] Handles edge cases (zero probabilities)
- [ ] Maintains numerical stability (no underflow)
- [ ] Updates all countries in distribution
- [ ] Computation time < 50ms

**Context**: Core algorithm for nationality determination.

**Persona**: As a data scientist, I want the algorithm to be mathematically correct and numerically stable.

---

#### FR-2.5.2: Information Gain Calculation
**Priority**: Critical  
**Description**: Calculate expected information gain for question selection.

**Formula**:
```
IG(Q) = H(current) - Σ P(answer) × H(after_answer)
H = -Σ P(country) × log2(P(country))
```

**Acceptance Criteria**:
- [ ] Calculates entropy of current distribution
- [ ] Simulates each possible answer
- [ ] Calculates expected entropy after each answer
- [ ] Returns information gain score
- [ ] Handles edge cases (uniform distribution, certain distribution)
- [ ] Computation time < 100ms per question
- [ ] Can pre-compute for common scenarios

**Context**: Selects most informative questions to minimize total questions asked.

**Persona**: As a user, I want the quiz to ask smart questions that quickly narrow down the answer.

---

#### FR-2.5.3: Height Calculation
**Priority**: Critical  
**Description**: Calculate predicted height based on country average and adjustments.

**Acceptance Criteria**:
- [ ] Uses determined country's average height as baseline
- [ ] Applies adjustments from physical indicator questions
- [ ] Categorizes into 5 levels based on deviation
- [ ] Calculates percentile within country
- [ ] Returns both metric and imperial units
- [ ] Provides relative difference (e.g., "+9.6cm")

**Context**: Final height prediction based on two-phase results.

**Persona**: As a user, I want to know not just my predicted height, but how I compare to others in my country.

---

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-3.1.1: Response Time
**Priority**: High

**Acceptance Criteria**:
- [ ] Session start: < 200ms
- [ ] Answer submission: < 200ms
- [ ] Result retrieval: < 200ms
- [ ] 95th percentile: < 300ms

---

#### NFR-3.1.2: Scalability
**Priority**: High

**Acceptance Criteria**:
- [ ] Supports 1000+ concurrent sessions
- [ ] Stateless API (scales horizontally)
- [ ] Redis handles session storage
- [ ] No memory leaks during long-running sessions

---

### 3.2 Reliability

#### NFR-3.2.1: Error Handling
**Priority**: High

**Acceptance Criteria**:
- [ ] Graceful handling of invalid session IDs
- [ ] Proper error messages for expired sessions
- [ ] Validation of all user inputs
- [ ] Logging of all errors
- [ ] No crashes on malformed requests

---

#### NFR-3.2.2: Data Integrity
**Priority**: Critical

**Acceptance Criteria**:
- [ ] Probability distributions always sum to 1.0
- [ ] No negative probabilities
- [ ] Session data persists across requests
- [ ] Atomic updates to session state

---

### 3.3 Security

#### NFR-3.3.1: Input Validation
**Priority**: High

**Acceptance Criteria**:
- [ ] Validate all session IDs (UUID format)
- [ ] Validate question and answer IDs exist
- [ ] Sanitize all user inputs
- [ ] Prevent injection attacks

---

#### NFR-3.3.2: Privacy
**Priority**: Critical

**Acceptance Criteria**:
- [ ] No PII collected or stored
- [ ] Sessions automatically expire after 1 hour
- [ ] No tracking cookies
- [ ] No IP address logging (except for concurrent limits)

---

### 3.4 Maintainability

#### NFR-3.4.1: Code Quality
**Priority**: High

**Acceptance Criteria**:
- [ ] Unit test coverage ≥ 85% for core algorithms
- [ ] Integration tests for API endpoints
- [ ] Clear code documentation
- [ ] Consistent code style

---

#### NFR-3.4.2: Data Management
**Priority**: High

**Acceptance Criteria**:
- [ ] Country statistics in separate JSON file
- [ ] Question bank in separate JSON file
- [ ] Easy to update data without code changes
- [ ] Data validation on startup

---

## 4. Technical Requirements

### 4.1 Technology Stack

#### TR-4.1.1: Backend
**Acceptance Criteria**:
- [ ] Node.js 18+
- [ ] Express.js framework
- [ ] Redis for session storage (Vercel KV or Upstash)
- [ ] Jest for testing

---

#### TR-4.1.2: Deployment
**Acceptance Criteria**:
- [ ] Vercel serverless functions
- [ ] Vercel KV for Redis
- [ ] Environment variables for configuration
- [ ] Automatic HTTPS
- [ ] Global CDN distribution

---

### 4.2 Data Requirements

#### TR-4.2.1: Country Statistics
**Acceptance Criteria**:
- [ ] Minimum 20 countries with complete data
- [ ] Average height data from WHO or equivalent
- [ ] Statistical preferences from reputable sources
- [ ] Data updated quarterly
- [ ] Source attribution in data file

---

#### TR-4.2.2: Question Bank
**Acceptance Criteria**:
- [ ] Minimum 50 nationality questions
- [ ] Minimum 30 height-relative questions
- [ ] All questions reviewed for cultural sensitivity
- [ ] Questions tested with diverse user groups
- [ ] Regular updates based on user feedback

---

## 5. Testing Requirements

### 5.1 Unit Tests

**Acceptance Criteria**:
- [ ] Bayesian inference algorithm
- [ ] Information gain calculation
- [ ] Probability distribution updates
- [ ] Phase transition logic
- [ ] Height calculation
- [ ] Coverage ≥ 85%

---

### 5.2 Integration Tests

**Acceptance Criteria**:
- [ ] Complete quiz flow (both phases)
- [ ] Phase transition scenarios
- [ ] Edge cases (max questions, low confidence)
- [ ] Error scenarios (invalid inputs)

---

### 5.3 Data Validation Tests

**Acceptance Criteria**:
- [ ] Probability distributions sum to 1.0
- [ ] All country codes valid
- [ ] All question IDs unique
- [ ] Country weights present for all options

---

## 6. Documentation Requirements

### 6.1 API Documentation

**Acceptance Criteria**:
- [ ] OpenAPI/Swagger specification
- [ ] Example requests and responses
- [ ] Error code documentation
- [ ] Rate limiting documentation

---

### 6.2 Algorithm Documentation

**Acceptance Criteria**:
- [ ] Bayesian inference explanation
- [ ] Information gain calculation
- [ ] Phase transition logic
- [ ] Height calculation methodology

---

## 7. Deployment Requirements

### 7.1 Vercel Deployment

**Acceptance Criteria**:
- [ ] Frontend deployed as static site
- [ ] Backend deployed as serverless functions
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] Automatic deployments from main branch

---

### 7.2 Monitoring

**Acceptance Criteria**:
- [ ] Error logging (Vercel logs)
- [ ] Performance monitoring
- [ ] Session metrics (total, completed, abandoned)
- [ ] Average questions per phase

---

## 8. Success Criteria

### 8.1 Accuracy Metrics

**Acceptance Criteria**:
- [ ] User-reported nationality accuracy ≥ 80%
- [ ] User-reported height accuracy ≥ 70%
- [ ] Average confidence at phase 1 completion ≥ 85%
- [ ] Average confidence at quiz completion ≥ 80%

---

### 8.2 User Experience Metrics

**Acceptance Criteria**:
- [ ] Average questions per quiz: 15-20
- [ ] Quiz completion rate ≥ 70%
- [ ] Average time to complete: 3-5 minutes
- [ ] User satisfaction score ≥ 4/5

---

## 9. Migration Plan

### 9.1 From REQ-API-01

**Acceptance Criteria**:
- [ ] Existing sessions gracefully handled
- [ ] Old question format supported temporarily
- [ ] Gradual rollout with feature flag
- [ ] Rollback plan documented

---

## 10. Definition of Done

A feature is considered complete when:

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (≥85% coverage)
- [ ] Integration tests written and passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging and tested
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Accessibility review completed
- [ ] User acceptance testing passed

---

**Document Approval**:
- Product Owner: Pending
- Technical Lead: Pending
- QA Lead: Pending