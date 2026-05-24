# Requirements: Statistical Adaptive Height Quiz API

**Requirement ID**: REQ-API-03  
**Version**: 1.0  
**Date**: 2026-05-24  
**Status**: Draft  
**Priority**: High  
**Supersedes**: REQ-API-02

## 1. Overview

### 1.1 Purpose
Implement an enhanced adaptive height prediction quiz that uses real-world statistical data to subtly infer nationality through cultural preferences, then determines relative height compared to national averages using confidence-based questioning with no fixed total question limit.

### 1.2 Scope
- Statistical inference engine with Bayesian updates
- Real data integration from public domain sources
- Two-phase adaptive questioning (internal phases, not exposed to users)
- Information gain-based question selection
- No fixed total question limit (only phase-specific maximums)
- Enhanced privacy and ethical considerations
- Vercel serverless deployment

### 1.3 Key Principles
- **Subtlety**: Never directly ask about nationality or height
- **Data-Driven**: All inferences based on real statistical data
- **Adaptive**: Question count varies based on confidence
- **Privacy-First**: No PII collection, anonymous sessions
- **Culturally Sensitive**: Questions reviewed for appropriateness
- **Transparent**: Methodology documented and explainable

## 2. Functional Requirements

### 2.1 Statistical Inference Engine

#### FR-2.1.1: Bayesian Probability Updates
**Priority**: Critical  
**Description**: Implement Bayesian inference to update country probabilities based on user answers.

**Acceptance Criteria**:
- [ ] Implements formula: `P(Country|Answer) = P(Answer|Country) × P(Country) / P(Answer)`
- [ ] Normalizes probabilities to sum to 1.0 (tolerance: ±0.0001)
- [ ] Handles edge cases (zero probabilities, numerical underflow)
- [ ] Uses log-space calculations for numerical stability
- [ ] Updates all countries in distribution
- [ ] Computation time < 50ms per update
- [ ] Unit tests verify mathematical correctness

**Test Cases**:
```javascript
// Test 1: Probability sum
const updated = bayesianUpdate(distribution, answer);
expect(sum(updated)).toBeCloseTo(1.0, 4);

// Test 2: Consistent answers increase confidence
let dist = uniform(countries);
for (const answer of usTypicalAnswers) {
  dist = bayesianUpdate(dist, answer);
}
expect(dist['US']).toBeGreaterThan(0.80);

// Test 3: Numerical stability
const extremeDist = { US: 0.999, CA: 0.001 };
const result = bayesianUpdate(extremeDist, answer);
expect(isFinite(sum(result))).toBe(true);
```

---

#### FR-2.1.2: Information Gain Calculation
**Priority**: Critical  
**Description**: Calculate expected information gain for question selection.

**Acceptance Criteria**:
- [ ] Calculates entropy: `H = -Σ P(country) × log2(P(country))`
- [ ] Computes expected entropy after each possible answer
- [ ] Returns information gain: `IG = H(current) - E[H(after)]`
- [ ] Handles uniform distribution (max entropy)
- [ ] Handles certain distribution (zero entropy)
- [ ] Computation time < 100ms per question
- [ ] Pre-computes IG for common scenarios
- [ ] Caches results during session

**Test Cases**:
```javascript
// Test 1: IG is positive for uncertain distribution
const dist = { US: 0.4, CA: 0.3, GB: 0.3 };
const ig = calculateIG(question, dist);
expect(ig).toBeGreaterThan(0);

// Test 2: IG is zero for certain distribution
const certain = { US: 1.0 };
const ig = calculateIG(question, certain);
expect(ig).toBe(0);

// Test 3: High-discriminating questions have higher IG
const highIG = calculateIG(highDiscriminatingQ, dist);
const lowIG = calculateIG(lowDiscriminatingQ, dist);
expect(highIG).toBeGreaterThan(lowIG);
```

---

#### FR-2.1.3: Adaptive Question Selection
**Priority**: Critical  
**Description**: Dynamically select most informative questions based on current state.

**Acceptance Criteria**:
- [ ] Filters questions by current phase
- [ ] Excludes already-asked questions
- [ ] Calculates IG for all available questions
- [ ] Applies category diversity bonus (weight: 0.2)
- [ ] Applies recency penalty for similar categories (weight: 0.2)
- [ ] Selects question with highest combined score
- [ ] Falls back to random selection if IG calculation fails
- [ ] Selection time < 100ms
- [ ] Logs selection reasoning for debugging

**Scoring Formula**:
```
score = (IG × 0.6) + (categoryDiversityBonus × 0.2) - (recencyPenalty × 0.2)
```

**Test Cases**:
```javascript
// Test 1: Selects high-IG questions
const selected = selectQuestion(phase, asked, state);
expect(selected.precomputedIG).toBeGreaterThan(0.7);

// Test 2: Avoids recently used categories
const asked = [q1_food, q2_food, q3_food];
const selected = selectQuestion('nationality', asked, state);
expect(selected.category).not.toBe('food_preference');

// Test 3: Respects phase filtering
const selected = selectQuestion('height_relative', asked, state);
expect(selected.phase).toBe('height_relative');
```

---

### 2.2 Phase Management (Internal)

#### FR-2.2.1: Phase 1 - Nationality Identification
**Priority**: Critical  
**Description**: Determine user's nationality through subtle cultural preference questions.

**Acceptance Criteria**:
- [ ] Starts with uniform probability distribution across all countries
- [ ] Asks questions about: food, sports, climate, beverages, transportation, work style, housing
- [ ] Updates probability distribution after each answer
- [ ] Calculates confidence as max(probability)
- [ ] Tracks top 3 candidate countries (for debugging/analytics)
- [ ] Terminates when confidence ≥ 0.90 OR questions asked ≥ 15
- [ ] Selects country with highest probability
- [ ] Records final confidence level
- [ ] Retrieves country's average height data
- [ ] Transitions to Phase 2 automatically
- [ ] Phase information NOT exposed in API responses

**Termination Conditions**:
```javascript
if (confidence >= 0.90 || questionsAsked >= 15) {
  determinedCountry = getTopCountry(distribution);
  baseHeight = getCountryAvgHeight(determinedCountry);
  transitionToPhase2();
}
```

**Test Cases**:
```javascript
// Test 1: Terminates at 90% confidence
const session = simulateSession(consistentUSAnswers);
expect(session.phase1Questions).toBeLessThan(15);
expect(session.confidence).toBeGreaterThanOrEqual(0.90);

// Test 2: Terminates at max questions
const session = simulateSession(randomAnswers);
expect(session.phase1Questions).toBe(15);

// Test 3: Selects correct country for typical patterns
const session = simulateSession(japanTypicalAnswers);
expect(session.determinedCountry).toBe('JP');
```

---

#### FR-2.2.2: Phase 2 - Relative Height Determination
**Priority**: Critical  
**Description**: Determine user's height relative to their country's average.

**Acceptance Criteria**:
- [ ] Uses determined country's average height as baseline
- [ ] Initializes height adjustment to 0
- [ ] Initializes category probabilities uniformly across 5 categories
- [ ] Asks physical indicator questions (legroom, doorways, shelves, etc.)
- [ ] Accumulates height adjustments from answers
- [ ] Updates category probabilities using Gaussian distribution
- [ ] Calculates confidence as max(category probability)
- [ ] Terminates when confidence ≥ 0.85 OR questions asked ≥ 12
- [ ] Calculates final height: baseHeight + totalAdjustment + random(±2cm)
- [ ] Clamps to reasonable range (147-208cm)
- [ ] Determines final category
- [ ] Phase information NOT exposed in API responses

**Height Categories**:
- Way Below: < -15cm from average
- Below: -15cm to -5cm from average
- Average: -5cm to +5cm from average
- Above: +5cm to +15cm from average
- Way Above: > +15cm from average

**Test Cases**:
```javascript
// Test 1: Terminates at 85% confidence
const session = simulatePhase2(consistentTallAnswers);
expect(session.phase2Questions).toBeLessThan(12);
expect(session.confidence).toBeGreaterThanOrEqual(0.85);

// Test 2: Correct category for tall indicators
const session = simulatePhase2(tallAnswers);
expect(session.category).toBeIn(['above', 'way_above']);

// Test 3: Height within reasonable range
const session = simulatePhase2(randomAnswers);
expect(session.finalHeight).toBeGreaterThanOrEqual(147);
expect(session.finalHeight).toBeLessThanOrEqual(208);
```

---

### 2.3 Data Integration

#### FR-2.3.1: Country Statistics Database
**Priority**: Critical  
**Description**: Integrate real-world statistical data for nationality inference.

**Acceptance Criteria**:
- [ ] JSON file with 20-30 countries
- [ ] Each country has: code, name, avgHeight (male, female, overall, source)
- [ ] Statistical categories: favoriteFoods, favoriteSports, climatePreference, beveragePreferences, primaryTransport, workStyle, housingType
- [ ] All probability distributions sum to 1.0 (validated on load)
- [ ] Data sourced from reputable public sources (WHO, OECD, etc.)
- [ ] Source attribution included in data file
- [ ] Data validation on application startup
- [ ] Fails gracefully if data is invalid
- [ ] Can be updated without code changes
- [ ] Includes data version and last updated date

**Data Validation Rules**:
```javascript
// On startup
validateCountryData(data) {
  for (const country of data.countries) {
    // Check required fields
    assert(country.code && country.name);
    assert(country.avgHeight.overall > 0);
    
    // Validate probability distributions
    for (const [category, probs] of Object.entries(country.statistics)) {
      const sum = Object.values(probs).reduce((a, b) => a + b, 0);
      assert(Math.abs(sum - 1.0) < 0.01, `${country.code}.${category} sum: ${sum}`);
    }
  }
}
```

**Test Cases**:
```javascript
// Test 1: All countries have required fields
for (const country of countries) {
  expect(country).toHaveProperty('code');
  expect(country).toHaveProperty('avgHeight.overall');
}

// Test 2: Probability distributions are valid
for (const country of countries) {
  for (const probs of Object.values(country.statistics)) {
    const sum = Object.values(probs).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2);
  }
}

// Test 3: Data loads successfully
expect(() => loadCountryData()).not.toThrow();
```

---

#### FR-2.3.2: Enhanced Question Bank
**Priority**: Critical  
**Description**: Question bank with country weights and height adjustments.

**Acceptance Criteria**:
- [ ] Minimum 50 nationality questions covering diverse preferences
- [ ] Minimum 30 height-relative questions (physical indicators)
- [ ] Each nationality question has countryWeights for all countries
- [ ] Each height question has heightAdjustment and confidence values
- [ ] Questions have phase indicator (nationality or height_relative)
- [ ] Questions have category tags
- [ ] Pre-computed information gain scores (optional, for optimization)
- [ ] Questions validated for cultural sensitivity
- [ ] No direct nationality or height references
- [ ] Questions use emojis for visual appeal
- [ ] JSON format for easy updates
- [ ] Validation on application startup

**Nationality Question Format**:
```javascript
{
  "id": "q_food_comfort_001",
  "phase": "nationality",
  "category": "food_preference",
  "text": "What's your go-to comfort food?",
  "options": [
    {
      "id": "opt1",
      "text": "🍕 Pizza",
      "countryWeights": {
        "US": 0.28, "IT": 0.35, "GB": 0.22, ...
      }
    }
  ],
  "precomputedIG": 0.85
}
```

**Height Question Format**:
```javascript
{
  "id": "q_physical_airplane_001",
  "phase": "height_relative",
  "category": "physical_comfort",
  "text": "How do you feel about airplane legroom?",
  "options": [
    {
      "id": "opt1",
      "text": "✈️ Plenty of space",
      "heightAdjustment": -12,
      "confidence": 0.85
    }
  ]
}
```

**Test Cases**:
```javascript
// Test 1: Sufficient questions per phase
const nationalityQs = questions.filter(q => q.phase === 'nationality');
expect(nationalityQs.length).toBeGreaterThanOrEqual(50);

// Test 2: Country weights are valid
for (const q of nationalityQuestions) {
  for (const opt of q.options) {
    const sum = Object.values(opt.countryWeights).reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(0);
  }
}

// Test 3: No direct nationality references
for (const q of questions) {
  expect(q.text.toLowerCase()).not.toMatch(/country|nationality|where.*from/);
}
```

---

### 2.4 API Endpoints

#### FR-2.4.1: Session Start
**Priority**: Critical  
**Description**: Initialize new quiz session with first question.

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

**Acceptance Criteria**:
- [ ] Generates unique session ID (UUID v4)
- [ ] Creates session in Redis with 1-hour TTL
- [ ] Initializes uniform probability distribution
- [ ] Initializes phase to 'nationality'
- [ ] Selects first question with highest IG
- [ ] Returns formatted question (no scores/weights exposed)
- [ ] Returns progress information
- [ ] Does NOT expose phase information
- [ ] Response time < 200ms
- [ ] Handles Redis connection errors gracefully
- [ ] Logs session creation

**Error Responses**:
- 500: Redis connection failed
- 503: Service temporarily unavailable

**Test Cases**:
```javascript
// Test 1: Creates valid session
const response = await POST('/api/session/start');
expect(response.session_id).toMatch(UUID_REGEX);
expect(response.question).toBeDefined();

// Test 2: Session stored in Redis
const session = await redis.get(sessionId);
expect(session).toBeDefined();
expect(session.phase).toBe('nationality');

// Test 3: First question is high-IG
expect(response.question.id).toMatch(/^q_/);
```

---

#### FR-2.4.2: Answer Submission
**Priority**: Critical  
**Description**: Submit answer and receive next question or completion.

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

**Acceptance Criteria**:
- [ ] Validates session exists and not expired
- [ ] Validates questionId matches current question
- [ ] Validates answerId exists for question
- [ ] Updates probability distribution (Phase 1) OR height adjustment (Phase 2)
- [ ] Calculates new confidence level
- [ ] Checks phase termination conditions
- [ ] Handles phase transition automatically (internal)
- [ ] Selects next question with highest IG
- [ ] Updates session in Redis
- [ ] Returns appropriate response based on state
- [ ] Does NOT expose phase information
- [ ] Response time < 200ms
- [ ] Logs answer and state updates

**Error Responses**:
- 400: Invalid request (missing fields, invalid IDs)
- 404: Session not found or expired
- 409: Question mismatch (not current question)
- 500: Internal server error

**Test Cases**:
```javascript
// Test 1: Valid answer updates state
const response = await POST(`/api/session/${sessionId}/answer`, {
  questionId: 'q1',
  answerId: 'opt1'
});
expect(response.completed).toBe(false);
expect(response.question).toBeDefined();

// Test 2: Phase transition is seamless
// (User doesn't see phase change)
const session = await simulatePhase1Completion();
const response = await submitAnswer(session, lastAnswer);
expect(response.question.phase).toBe('height_relative'); // Internal only

// Test 3: Quiz completes after both phases
const session = await simulateFullQuiz();
expect(session.completed).toBe(true);
```

---

#### FR-2.4.3: Result Retrieval
**Priority**: Critical  
**Description**: Get final prediction with insights.

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

**Acceptance Criteria**:
- [ ] Returns 404 if session not found
- [ ] Returns 400 if quiz not completed
- [ ] Calculates final height from baseHeight + adjustments
- [ ] Adds random factor (±2cm) for variety
- [ ] Clamps to range (147-208cm)
- [ ] Determines height category
- [ ] Generates contextual insights (implies nationality, doesn't state it)
- [ ] Calculates percentile within country
- [ ] Generates fun, personalized message
- [ ] Includes question breakdown
- [ ] Generates shareable text
- [ ] Does NOT explicitly state determined nationality
- [ ] Response time < 200ms
- [ ] Marks session as completed in Redis

**Message Generation**:
```javascript
const messages = {
  way_below: ['Good things come in small packages! 🎁', ...],
  below: ['Perfect height for hugs! 🤗', ...],
  average: ['Right in the sweet spot! 🎯', ...],
  above: ['You stand out in a crowd! 🌟', ...],
  way_above: ['Reaching for the stars! ⭐', ...]
};
```

**Test Cases**:
```javascript
// Test 1: Returns result for completed quiz
const result = await GET(`/api/session/${sessionId}/result`);
expect(result.predictedHeight.cm).toBeGreaterThan(0);
expect(result.confidence).toBeGreaterThan(0);

// Test 2: Height within valid range
expect(result.predictedHeight.cm).toBeGreaterThanOrEqual(147);
expect(result.predictedHeight.cm).toBeLessThanOrEqual(208);

// Test 3: Nationality implied, not stated
expect(result.insights.countryContext).toMatch(/cultural patterns/);
expect(result.insights.countryContext).not.toMatch(/you are from/i);
```

---

### 2.5 Session Management

#### FR-2.5.1: Session Storage
**Priority**: High  
**Description**: Efficient session state storage in Redis.

**Session State Structure**:
```javascript
{
  "sessionId": "uuid",
  "phase": 1,  // 1=nationality, 2=height_relative (internal)
  "askedQuestions": ["q1", "q2", "q3"],
  "currentQuestion": "q4",
  "probDist": {
    "US": 0.58,
    "CA": 0.22,
    "GB": 0.12,
    "AU": 0.08
  },
  "heightAdj": 12,
  "categoryProbs": [0.05, 0.15, 0.30, 0.35, 0.15],
  "determinedCountry": null,
  "baseHeight": null,
  "completed": false,
  "createdAt": 1716508477892,
  "ttl": 3600
}
```

**Acceptance Criteria**:
- [ ] Session stored as JSON in Redis
- [ ] TTL set to 1 hour (3600 seconds)
- [ ] Only non-zero probabilities stored (compression)
- [ ] Session size < 5KB
- [ ] Atomic updates (no race conditions)
- [ ] Automatic expiry after TTL
- [ ] No PII stored
- [ ] Session ID is UUID v4

**Test Cases**:
```javascript
// Test 1: Session stored correctly
await createSession(sessionId);
const session = await redis.get(sessionId);
expect(session).toBeDefined();

// Test 2: Session expires after TTL
await createSession(sessionId);
await sleep(3601000); // 1 hour + 1 second
const session = await redis.get(sessionId);
expect(session).toBeNull();

// Test 3: Session size is reasonable
const session = await redis.get(sessionId);
const size = JSON.stringify(session).length;
expect(size).toBeLessThan(5000);
```

---

#### FR-2.5.2: No Rate Limiting on Sessions
**Priority**: High  
**Description**: Remove session creation rate limits to allow unlimited replays.

**Acceptance Criteria**:
- [ ] No limit on sessions per IP
- [ ] No limit on session creation frequency
- [ ] Users can replay quiz unlimited times
- [ ] Rate limiter middleware removed from session routes
- [ ] Rate limit configuration removed
- [ ] Optional: Concurrent session limit per IP (e.g., 5 active sessions)

**Rationale**: Users should be able to experiment with different answers without restrictions.

**Test Cases**:
```javascript
// Test 1: Can create multiple sessions rapidly
for (let i = 0; i < 10; i++) {
  const response = await POST('/api/session/start');
  expect(response.status).toBe(200);
}

// Test 2: Can replay immediately after completion
await completeQuiz(session1);
const session2 = await POST('/api/session/start');
expect(session2.status).toBe(200);
```

---

## 3. Non-Functional Requirements

### 3.1 Performance

#### NFR-3.1.1: Response Time
**Priority**: High

**Acceptance Criteria**:
- [ ] Session start: < 200ms (p95)
- [ ] Answer submission: < 200ms (p95)
- [ ] Result retrieval: < 200ms (p95)
- [ ] Question selection: < 100ms
- [ ] Bayesian update: < 50ms
- [ ] Information gain calculation: < 100ms per question

**Monitoring**:
- Log response times for all endpoints
- Alert if p95 exceeds thresholds
- Track slow queries

---

#### NFR-3.1.2: Scalability
**Priority**: High

**Acceptance Criteria**:
- [ ] Supports 1000+ concurrent sessions
- [ ] Stateless API (horizontal scaling)
- [ ] Redis handles session storage
- [ ] No memory leaks
- [ ] Efficient probability distribution storage
- [ ] Pre-computed IG scores where possible

---

### 3.2 Reliability

#### NFR-3.2.1: Error Handling
**Priority**: High

**Acceptance Criteria**:
- [ ] Graceful handling of invalid session IDs
- [ ] Clear error messages for expired sessions
- [ ] Validation of all user inputs
- [ ] Logging of all errors with context
- [ ] No crashes on malformed requests
- [ ] Fallback to default values on data errors
- [ ] Circuit breaker for Redis failures

---

#### NFR-3.2.2: Data Integrity
**Priority**: Critical

**Acceptance Criteria**:
- [ ] Probability distributions always sum to 1.0
- [ ] No negative probabilities
- [ ] Session data persists across requests
- [ ] Atomic updates to session state
- [ ] Data validation on load
- [ ] Graceful degradation if data is invalid

---

### 3.3 Security

#### NFR-3.3.1: Input Validation
**Priority**: High

**Acceptance Criteria**:
- [ ] Validate all session IDs (UUID format)
- [ ] Validate question and answer IDs exist
- [ ] Sanitize all user inputs
- [ ] Prevent injection attacks
- [ ] Rate limiting on API endpoints (not sessions)
- [ ] CORS properly configured

---

#### NFR-3.3.2: Privacy
**Priority**: Critical

**Acceptance Criteria**:
- [ ] No PII collected or stored
- [ ] Sessions automatically expire after 1 hour
- [ ] No tracking cookies
- [ ] No IP address logging (except for abuse prevention)
- [ ] Nationality implied, not explicitly stated in results
- [ ] Transparent about methodology
- [ ] GDPR compliant (no personal data)

---

### 3.4 Maintainability

#### NFR-3.4.1: Code Quality
**Priority**: High

**Acceptance Criteria**:
- [ ] Unit test coverage ≥ 85% for core algorithms
- [ ] Integration tests for API endpoints
- [ ] Clear code documentation
- [ ] Consistent code style (ESLint)
- [ ] Type checking (JSDoc or TypeScript)
- [ ] Code reviews required

---

#### NFR-3.4.2: Data Management
**Priority**: High

**Acceptance Criteria**:
- [ ] Country statistics in separate JSON file
- [ ] Question bank in separate JSON file
- [ ] Easy to update data without code changes
- [ ] Data validation on startup
- [ ] Version tracking for data files
- [ ] Source attribution in data files

---

## 4. Technical Requirements

### 4.1 Technology Stack

#### TR-4.1.1: Backend
**Acceptance Criteria**:
- [ ] Node.js 18+
- [ ] Express.js framework
- [ ] Redis for session storage (Vercel KV or Upstash)
- [ ] Jest for testing
- [ ] Winston for logging

---

#### TR-4.1.2: Deployment
**Acceptance Criteria**:
- [ ] Vercel serverless functions
- [ ] Vercel KV for Redis
- [ ] Environment variables for configuration
- [ ] Automatic HTTPS
- [ ] Global CDN distribution
- [ ] Automatic deployments from main branch

---

### 4.2 Data Requirements

#### TR-4.2.1: Country Statistics
**Acceptance Criteria**:
- [ ] Minimum 20 countries with complete data
- [ ] Priority countries: US, UK, CA, AU, DE, FR, IT, ES, NL, DK, NO, SE, JP, CN, KR, IN, BR, MX, AR, TH
- [ ] Average height data from WHO or equivalent
- [ ] Statistical preferences from reputable sources
- [ ] Data updated quarterly
- [ ] Source attribution in data file
- [ ] Version tracking

**Data Sources**:
- Heights: WHO, NCD Risk Factor Collaboration, national health agencies
- Food: Google Trends, World Food Atlas, cultural surveys
- Sports: IOC, FIFA, national sports federations
- Climate: Köppen classification, World Bank
- Transport: OECD, World Bank
- Lifestyle: OECD Better Life Index, national census data

---

#### TR-4.2.2: Question Bank
**Acceptance Criteria**:
- [ ] Minimum 50 nationality questions
- [ ] Minimum 30 height-relative questions
- [ ] All questions reviewed for cultural sensitivity
- [ ] Questions tested with diverse user groups
- [ ] Regular updates based on user feedback
- [ ] No direct nationality or height references
- [ ] Emojis for visual appeal

---

## 5. Testing Requirements

### 5.1 Unit Tests

**Acceptance Criteria**:
- [ ] Bayesian inference algorithm (10+ tests)
- [ ] Information gain calculation (8+ tests)
- [ ] Probability distribution updates (12+ tests)
- [ ] Phase transition logic (6+ tests)
- [ ] Height calculation (8+ tests)
- [ ] Question selection (10+ tests)
- [ ] Coverage ≥ 85%

**Key Test Scenarios**:
```javascript
describe('Bayesian Inference', () => {
  test('probabilities sum to 1.0');
  test('consistent answers increase confidence');
  test('handles numerical underflow');
  test('normalizes correctly');
});

describe('Information Gain', () => {
  test('positive for uncertain distribution');
  test('zero for certain distribution');
  test('higher for discriminating questions');
});

describe('Phase Management', () => {
  test('transitions at 90% confidence');
  test('transitions at max questions');
  test('phase not exposed in API');
});
```

---

### 5.2 Integration Tests

**Acceptance Criteria**:
- [ ] Complete quiz flow (both phases)
- [ ] Phase transition scenarios
- [ ] Edge cases (max questions, low confidence)
- [ ] Error scenarios (invalid inputs, expired sessions)
- [ ] Redis connection failures
- [ ] Data validation failures

---

### 5.3 Data Validation Tests

**Acceptance Criteria**:
- [ ] Probability distributions sum to 1.0
- [ ] All country codes valid (ISO 3166-1 alpha-2)
- [ ] All question IDs unique
- [ ] Country weights present for all options
- [ ] Height adjustments are reasonable (-20 to +20)
- [ ] All required fields present

---

## 6. Documentation Requirements

### 6.1 API Documentation

**Acceptance Criteria**:
- [ ] OpenAPI/Swagger specification
- [ ] Example requests and responses
- [ ] Error code documentation
- [ ] Authentication requirements (none)
- [ ] Rate limiting documentation

---

### 6.2 Algorithm Documentation

**Acceptance Criteria**:
- [ ] Bayesian inference explanation
- [ ] Information gain calculation
- [ ] Phase transition logic
- [ ] Height calculation methodology
- [ ] Question selection strategy
- [ ] Data sources and attribution

---

### 6.3 User-Facing Documentation

**Acceptance Criteria**:
- [ ] FAQ explaining methodology
- [ ] Privacy policy
- [ ] Data sources disclosure
- [ ] Accuracy disclaimers
- [ ] How to interpret results

---

## 7. Deployment Requirements

### 7.1 Vercel Deployment

**Acceptance Criteria**:
- [ ] Frontend deployed as static site
- [ ] Backend deployed as serverless functions
- [ ] Environment variables configured
- [ ] Custom domain configured (optional)
- [ ] Automatic deployments from main branch
- [ ] Preview deployments for PRs
- [ ] Production and staging environments

**Environment Variables**:
```bash
REDIS_URL=<vercel-kv-url>
NODE_ENV=production
CORS_ORIGIN=https://height-quiz.vercel.app
MAX_NATIONALITY_QUESTIONS=15
MAX_HEIGHT_QUESTIONS=12
NATIONALITY_CONFIDENCE_THRESHOLD=0.90
HEIGHT_CONFIDENCE_THRESHOLD=0.85
LOG_LEVEL=info
```

---

### 7.2 Monitoring

**Acceptance Criteria**:
- [ ] Error logging (Vercel logs or external service)
- [ ] Performance monitoring (response times)
- [ ] Session metrics (total, completed, abandoned)
- [ ] Average questions per phase
- [ ] Confidence distribution
- [ ] Most common determined countries
- [ ] Height distribution

---

## 8. Success Criteria

### 8.1 Accuracy Metrics

**Acceptance Criteria**:
- [ ] User-reported nationality accuracy ≥ 75%
- [ ] User-reported height accuracy ≥ 70%
- [ ] Average confidence at phase 1 completion ≥ 85%
- [ ] Average confidence at quiz completion ≥ 80%

**Measurement Method**:
- Optional feedback form after results
- A/B testing with different question sets
- User surveys

---

### 8.2 User Experience Metrics

**Acceptance Criteria**:
- [ ] Average questions per quiz: 15-20
- [ ] Quiz completion rate ≥ 70%
- [ ] Average time to complete: 3-5 minutes
- [ ] User satisfaction score ≥ 4/5
- [ ] Share rate ≥ 20%

---

### 8.3 Technical Metrics

**Acceptance Criteria**:
- [ ] API response time < 200ms (p95)
- [ ] Zero data loss on session expiry
- [ ] Uptime ≥ 99.5%
- [ ] Error rate < 1%

---

## 9. Migration Plan

### 9.1 From REQ-API-02

**Acceptance Criteria**:
- [ ] Existing sessions gracefully handled (or expired)
- [ ] Old question format supported temporarily (if needed)
- [ ] Gradual rollout with feature flag
- [ ] Rollback plan documented
- [ ] Data migration scripts (if needed)
- [ ] Backward compatibility for 1 week

---

## 10. Ethical Considerations

### 10.1 Cultural Sensitivity

**Acceptance Criteria**:
- [ ] Questions reviewed by diverse team
- [ ] No stereotyping or offensive content
- [ ] Inclusive design (works across cultures)
- [ ] User feedback mechanism for inappropriate questions
- [ ] Regular bias audits
- [ ] Transparent methodology

---

### 10.2 Data Ethics

**Acceptance Criteria**:
- [ ] All data from public domain sources
- [ ] Source attribution provided
- [ ] No proprietary or copyrighted data
- [ ] Regular data accuracy reviews
- [ ] Transparent about limitations

---

## 11. Definition of Done

A feature is considered complete when:

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (≥85% coverage)
- [ ] Integration tests written and passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging and tested
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Accessibility review completed (if UI changes)
- [ ] User acceptance testing passed
- [ ] Monitoring and alerts configured
- [ ] Rollback plan documented

---

## 12. Appendix

### 12.1 Example Question Categories

**Nationality Questions**:
- Food preferences (comfort food, breakfast, snacks)
- Sports preferences (favorite sport, playing vs watching)
- Climate preferences (ideal weather, vacation spots)
- Beverage preferences (coffee vs tea, hot vs cold drinks)
- Transportation (daily commute, preferred vehicle)
- Work style (office vs remote, work hours)
- Housing (apartment vs house, urban vs rural)
- Leisure activities (hobbies, weekend activities)

**Height-Relative Questions**:
- Airplane comfort (legroom, overhead bins)
- Doorways and ceilings (bumping head, ducking)
- Furniture (counters, desks, chairs, beds)
- Vehicles (car seats, headroom)
- Shopping (pants length, shirt sizes, shoe sizes)
- Social situations (group photos, concerts, movies)
- Physical activities (reaching shelves, stairs)
- Daily inconveniences (shower heads, mirrors)

---

**Document Approval**:
- Product Owner: Pending
- Technical Lead: Pending
- Data Science Lead: Pending
- Privacy Officer: Pending
- QA Lead: Pending