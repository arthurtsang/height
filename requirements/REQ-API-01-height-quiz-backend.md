# REQ-API-01: Height Quiz Backend API

**Status:** Draft

**Related Work Items:** REQ-UI-01, SAD-001

---

## Persona
As a frontend developer building the height quiz,
I need a reliable backend API that serves questions and calculates height predictions, so users can have a seamless quiz experience without the frontend handling complex logic.

---

## Context
In order to separate concerns and enable scalable, maintainable architecture,

**Background:**
- Frontend needs to fetch questions dynamically
- Height calculation logic should be centralized in backend
- Session management required to track user progress
- API should be stateless and RESTful
- Support for future enhancements (analytics, A/B testing)

**Constraints:**
- Must be lightweight and fast (< 200ms response time)
- Node.js/Express for consistency with team skills
- Redis for session storage
- No database required for MVP
- Must handle 1,000 concurrent users

**Dependencies:**
- Redis/ElastiCache for session management
- Question bank JSON file
- REQ-UI-01 (frontend consumer)
- AWS ECS infrastructure (REQ-INFRA-01)

---

## Requirements

### Functional Requirements

1. **Session Management**
   - Create unique session on quiz start
   - Store session data in Redis with 1-hour TTL
   - Track answered questions and scores
   - Support session retrieval and updates

2. **Question Serving**
   - Serve questions one at a time
   - Select questions from 50-question bank
   - Randomize question order (except first few cultural questions)
   - Never repeat questions in same session
   - Support for 10-15 questions per session

3. **Height Calculation**
   - Infer base height from cultural/cuisine questions
   - Apply scoring adjustments from physical proxy questions
   - Add small random factor (±3cm) for variety
   - Clamp result to reasonable range (147-208cm / 4'10"-6'10")
   - Convert to both metric (cm) and imperial (feet/inches)

4. **API Endpoints**
   - POST /api/session/start - Create new session
   - POST /api/session/:id/answer - Submit answer, get next question
   - GET /api/session/:id/result - Get final height prediction
   - GET /api/health - Health check endpoint

5. **Error Handling**
   - Graceful handling of invalid session IDs
   - Validation of answer submissions
   - Proper HTTP status codes
   - Meaningful error messages

### Non-Functional Requirements

1. **Performance:**
   - API response time < 200ms (p95)
   - Session creation < 100ms
   - Support 1,000 concurrent sessions
   - Redis connection pooling

2. **Reliability:**
   - 99.9% uptime
   - Automatic retry for Redis connections
   - Circuit breaker for external dependencies
   - Graceful degradation if Redis unavailable

3. **Security:**
   - Rate limiting: 10 sessions per IP per hour
   - Input validation on all endpoints
   - CORS configuration for frontend domain
   - No sensitive data in logs
   - Helmet.js security headers

4. **Scalability:**
   - Stateless API design
   - Horizontal scaling via ECS
   - Redis cluster support
   - Load balancer health checks

5. **Observability:**
   - Structured logging (JSON format)
   - CloudWatch metrics integration
   - Request/response logging
   - Error tracking and alerting

---

## Acceptance Criteria

### AC1: Session Creation
**Given** a client requests to start a quiz
**When** they POST to /api/session/start
**Then** a new session is created in Redis
**And** response includes session_id and first question
**And** response time is < 100ms

**Test Category:** @req-api-01 @session
**Verification:** Automated

### AC2: Cultural Question Base Height
**Given** a session is created
**When** user answers first question with "Japanese cuisine"
**Then** base height is set to 171cm
**And** this is stored in session data

**Test Category:** @req-api-01 @calculation
**Verification:** Automated

### AC3: Answer Submission and Next Question
**Given** a session exists with 3 questions answered
**When** user submits answer to question 4
**Then** answer is stored in session
**And** score is calculated and added to running total
**And** next question (not previously asked) is returned
**And** response time is < 200ms

**Test Category:** @req-api-01 @question-flow
**Verification:** Automated

### AC4: Height Calculation Logic
**Given** a session with base height 175cm
**When** user answers indicate tall indicators (total +15 points)
**Then** final height is calculated as 175 + 15 + random(±3)
**And** result is between 187-193cm

**Test Category:** @req-api-01 @calculation
**Verification:** Automated

### AC5: Height Format Conversion
**Given** calculated height is 175cm
**When** result is requested
**Then** response includes both:
- cm: 175
- feet: 5, inches: 9
- display: "5'9\""

**Test Category:** @req-api-01 @formatting
**Verification:** Automated

### AC6: Session Completion
**Given** a user has answered 10 questions
**When** they submit the final answer
**Then** response indicates quiz is complete
**And** includes redirect to result endpoint
**And** session is marked as completed

**Test Category:** @req-api-01 @session
**Verification:** Automated

### AC7: Result Retrieval
**Given** a completed session
**When** client requests GET /api/session/:id/result
**Then** response includes:
- Predicted height in cm and feet/inches
- Fun message about the result
- Share text template

**Test Category:** @req-api-01 @results
**Verification:** Automated

### AC8: Invalid Session Handling
**Given** a non-existent session ID
**When** client submits an answer
**Then** API returns 404 status
**And** error message "Session not found"

**Test Category:** @req-api-01 @error-handling
**Verification:** Automated

### AC9: Session Expiration
**Given** a session created 61 minutes ago
**When** client tries to access it
**Then** API returns 410 status (Gone)
**And** error message "Session expired"

**Test Category:** @req-api-01 @session
**Verification:** Automated

### AC10: Rate Limiting
**Given** an IP has created 10 sessions in the last hour
**When** they attempt to create an 11th session
**Then** API returns 429 status (Too Many Requests)
**And** error message includes retry-after time

**Test Category:** @req-api-01 @security
**Verification:** Automated

### AC11: CORS Configuration
**Given** a request from the frontend domain
**When** OPTIONS preflight request is sent
**Then** appropriate CORS headers are returned
**And** frontend domain is allowed

**Test Category:** @req-api-01 @security
**Verification:** Automated

### AC12: Health Check
**Given** the API is running
**When** GET /api/health is requested
**Then** response is 200 OK
**And** includes Redis connection status
**And** response time < 50ms

**Test Category:** @req-api-01 @health
**Verification:** Automated

### AC13: Question Randomization
**Given** two different sessions
**When** they both start the quiz
**Then** they receive questions in different orders
**And** cultural questions appear early in both
**And** no question is repeated within a session

**Test Category:** @req-api-01 @question-flow
**Verification:** Automated

### AC14: Concurrent Session Handling
**Given** 100 concurrent session creation requests
**When** all requests are processed
**Then** all sessions are created successfully
**And** no session ID collisions occur
**And** Redis handles all writes

**Test Category:** @req-api-01 @performance
**Verification:** Automated (load test)

### AC15: Logging and Monitoring
**Given** the API is processing requests
**When** any endpoint is called
**Then** structured logs are written to CloudWatch
**And** logs include: timestamp, session_id, endpoint, response_time, status_code
**And** errors are logged with stack traces

**Test Category:** @req-api-01 @observability
**Verification:** Manual

---

## Design References

- **SAD:** [designs/SAD-001-height-prediction-app.md]
- **Question Bank:** [designs/question-bank.json]
- **API Specification:** [designs/api-specification.yaml] (to be created)
- **Data Models:** Documented in SAD-001

**Design/Implementation Parity:** 
- [ ] API endpoints match specification
- [ ] Height calculation logic matches design
- [ ] Session management matches design
- [ ] Error handling matches specification

---

## Test Scenarios

### Test Coverage Map
| Acceptance Criterion | Test File/Suite | Test Scenario ID | Status |
|---------------------|-----------------|------------------|--------|
| AC1 | unit/session.test.js | @req-api-01 Session creation | Pending |
| AC2 | unit/height-calc.test.js | @req-api-01 Base height | Pending |
| AC3 | integration/answer.test.js | @req-api-01 Answer flow | Pending |
| AC4 | unit/height-calc.test.js | @req-api-01 Calculation | Pending |
| AC5 | unit/format.test.js | @req-api-01 Conversion | Pending |
| AC6 | integration/completion.test.js | @req-api-01 Completion | Pending |
| AC7 | integration/result.test.js | @req-api-01 Result | Pending |
| AC8 | integration/errors.test.js | @req-api-01 Invalid session | Pending |
| AC9 | integration/expiration.test.js | @req-api-01 Expiration | Pending |
| AC10 | integration/rate-limit.test.js | @req-api-01 Rate limit | Pending |
| AC11 | integration/cors.test.js | @req-api-01 CORS | Pending |
| AC12 | integration/health.test.js | @req-api-01 Health check | Pending |
| AC13 | unit/questions.test.js | @req-api-01 Randomization | Pending |
| AC14 | load/concurrent.test.js | @req-api-01 Concurrency | Pending |
| AC15 | manual/logging.md | @req-api-01 Logging | Pending |

### Test Annotations Required
- **Requirement reference:** `REQ-API-01`
- **Category tags:** `@backend`, `@api`, `@session`, `@calculation`
- **Feature tags:** `@req-api-01`

### Human Verification Required
- [ ] API responses are intuitive and well-structured
- [ ] Error messages are helpful
- [ ] Logging provides useful debugging information
- [ ] Performance meets expectations under load

### Test Report
[Test results will be documented here once tests are implemented]

---

## Definition of Done Checklist

### 1. Requirement Completeness
- [x] Context explains why we are doing this
- [x] Requirements (functional & non-functional) are documented
- [x] Acceptance criteria are testable and unambiguous
- [x] Design references are linked to `designs/` folder
- [ ] Design/implementation parity is confirmed

### 2. Tests and Traceability
- [ ] Test scenarios documented and mapped to acceptance criteria
- [ ] Test scenarios annotated with requirement reference (REQ-API-01)
- [ ] Test scenarios annotated with category tags
- [ ] Feature scenarios verified and approved by a human
- [ ] All automated tests pass (local and/or CI)
- [ ] Test report documented in this requirement file

### 3. Pull Request
- [ ] PR title includes REQ ID (e.g., "feat: height quiz API [REQ-API-01]")
- [ ] PR description links this requirement file and design docs
- [ ] One primary PR per requirement

### 4. Code Integration
- [ ] Requirement reference included in branch name (e.g., feature/REQ-API-01-quiz-api)
- [ ] Requirement reference in commit messages
- [ ] All DoD items satisfied

### 5. Infrastructure & Deployment
- [ ] Dockerfile created for API
- [ ] Environment variables documented
- [ ] Redis connection configuration
- [ ] Health check endpoint implemented
- [ ] Deployed to dev environment successfully
- [ ] Load testing completed

### 6. Documentation
- [ ] API documentation complete (OpenAPI spec)
- [ ] README with setup instructions
- [ ] Environment variable documentation
- [ ] Deployment notes

---

## Notes

**Open Questions:**
- Should we implement analytics tracking for question answers?
- Do we want A/B testing capability for different question sets?
- Should we cache question bank in memory or read from file each time?

**Assumptions:**
- Redis is available and reliable
- Question bank JSON is loaded at startup
- No need for user authentication
- Session data doesn't need to persist beyond 1 hour

**Follow-up Items:**
- Create OpenAPI specification - Owner: TBD, Due: TBD
- Set up CloudWatch dashboards - Owner: TBD, Due: TBD
- Performance testing with 1000 concurrent users - Owner: TBD, Due: TBD