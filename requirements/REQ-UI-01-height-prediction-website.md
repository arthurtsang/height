# REQ-UI-01: Height Prediction Quiz Website

**Status:** Draft

**Related Work Items:** SAD-001

---

## Persona
As a casual web user looking for entertainment,
I want to take a fun, engaging quiz that predicts my height through seemingly random questions, so I can share the amusing results with friends and have a lighthearted experience.

---

## Context
In order to create a viral, shareable web experience that entertains users,

**Background:**
- Users enjoy personality quizzes and prediction games on social media
- Height prediction through indirect questions creates curiosity and engagement
- Simple, fun experiences are more likely to be shared
- Mobile-first design is essential for social media sharing
- No actual accuracy required - entertainment value is the goal

**Constraints:**
- Must work on all modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-responsive design required
- Fast load times (< 2 seconds)
- No user registration or login required
- Simple deployment on AWS ECS

**Dependencies:**
- Backend API for question serving and height calculation
- Redis for session management
- AWS infrastructure (ECS, ALB, CloudFront)

---

## Requirements

### Functional Requirements

1. **Welcome Screen**
   - Display engaging landing page with clear call-to-action
   - Show brief description of the quiz (number of questions, time estimate)
   - "Start Quiz" button prominently displayed
   - Fun, colorful design with emoji/icons

2. **Question Flow**
   - Display one question at a time
   - Show progress indicator (current question / total questions)
   - Display 4-8 answer options per question
   - Smooth transitions between questions
   - Support for emoji in questions and answers
   - No ability to go back (prevents gaming the system)

3. **Question Bank**
   - Minimum 50 questions available
   - Questions categorized by:
     - Nationality/region (to determine base height)
     - Height indicators (above/below average markers)
     - Fun/random questions for entertainment
   - Questions appear random but follow logic:
     - First question determines nationality/base height
     - Subsequent questions refine the estimate
     - Mix of serious and silly questions

4. **Height Calculation**
   - Start with national average height based on first question
   - Adjust height based on subsequent answers (+/- scoring)
   - Add small random factor for variety
   - Clamp result to reasonable range (4'10" - 6'10" / 147-208cm)
   - Display result in both feet/inches and centimeters

5. **Result Display**
   - Animated reveal of predicted height
   - Large, prominent display of height in feet and inches
   - Secondary display in centimeters
   - Fun message/commentary about the result
   - Share functionality for social media
   - "Try Again" button to restart quiz

6. **Social Sharing**
   - Share button with pre-populated text
   - Support for native share API (mobile)
   - Fallback for desktop (copy link or social media links)
   - Share text includes predicted height

### Non-Functional Requirements

1. **Performance:**
   - Page load time < 2 seconds on 3G connection
   - Question transitions < 300ms
   - API response time < 200ms
   - Support 1,000 concurrent users

2. **Accessibility:**
   - WCAG 2.1 AA compliant
   - Keyboard navigation support
   - Screen reader compatible
   - Sufficient color contrast ratios
   - Touch targets minimum 44x44px

3. **Responsiveness:**
   - Mobile-first design
   - Support screen sizes from 320px to 2560px
   - Touch-friendly interface
   - Optimized for portrait and landscape orientations

4. **Browser Compatibility:**
   - Chrome (last 2 versions)
   - Firefox (last 2 versions)
   - Safari (last 2 versions)
   - Edge (last 2 versions)
   - iOS Safari 12+
   - Android Chrome 80+

5. **Security:**
   - HTTPS only
   - No PII collected
   - Session data expires after 1 hour
   - Rate limiting (10 sessions per IP per hour)
   - CORS properly configured

---

## Acceptance Criteria

### AC1: Welcome Screen Display
**Given** a user visits the website
**When** the page loads
**Then** they see an engaging welcome screen with:
- Clear heading "Height Guesser" or similar
- Brief description of the quiz
- Prominent "Start Quiz" button
- Fun visual design with emojis/icons

**Test Category:** @req-ui-01 @frontend @welcome
**Verification:** Manual

### AC2: Quiz Initiation
**Given** a user is on the welcome screen
**When** they click the "Start Quiz" button
**Then** the welcome screen transitions to the first question
**And** a progress indicator shows "Question 1 of 10"

**Test Category:** @req-ui-01 @frontend @quiz-flow
**Verification:** Automated

### AC3: Question Display
**Given** a user is taking the quiz
**When** a question is displayed
**Then** they see:
- The question text clearly displayed
- 4-8 answer options as clickable buttons
- Progress indicator showing current position
- Progress bar showing percentage complete

**Test Category:** @req-ui-01 @frontend @questions
**Verification:** Automated

### AC4: Answer Selection
**Given** a user is viewing a question
**When** they click an answer option
**Then** the answer is recorded
**And** the next question appears within 300ms
**And** the progress indicator updates

**Test Category:** @req-ui-01 @frontend @interaction
**Verification:** Automated

### AC5: Nationality-Based Height Calculation
**Given** a user answers the first question about nationality
**When** they select "Netherlands"
**Then** the base height is set to 183cm (Dutch average)
**And** subsequent questions adjust from this baseline

**Test Category:** @req-ui-01 @backend @calculation
**Verification:** Automated

### AC6: Height Adjustment Logic
**Given** a user answers questions indicating they are tall
**When** they select options like "Very cramped" for airplane legroom
**Then** positive points are added to the base height
**And** the final prediction is adjusted upward

**Test Category:** @req-ui-01 @backend @calculation
**Verification:** Automated

### AC7: Result Display
**Given** a user completes all questions
**When** the final answer is submitted
**Then** they see a result screen with:
- Animated reveal of predicted height
- Height displayed in feet and inches (e.g., "5'9"")
- Height displayed in centimeters (e.g., "175 cm")
- Fun message about the result
- Share button
- Try Again button

**Test Category:** @req-ui-01 @frontend @results
**Verification:** Manual

### AC8: Height Format Validation
**Given** the system calculates a height of 175cm
**When** displaying the result
**Then** it shows "5'9"" (5 feet 9 inches)
**And** shows "(175 cm)" as secondary display
**And** the conversion is mathematically correct

**Test Category:** @req-ui-01 @backend @calculation
**Verification:** Automated

### AC9: Mobile Responsiveness
**Given** a user accesses the site on a mobile device (320px width)
**When** they view any screen
**Then** all content is readable without horizontal scrolling
**And** all buttons are easily tappable (minimum 44x44px)
**And** the layout adapts appropriately

**Test Category:** @req-ui-01 @frontend @responsive
**Verification:** Manual

### AC10: Social Sharing
**Given** a user views their result
**When** they click the "Share" button
**Then** on mobile: native share dialog opens with pre-populated text
**And** on desktop: share options are displayed
**And** share text includes their predicted height

**Test Category:** @req-ui-01 @frontend @sharing
**Verification:** Manual

### AC11: Quiz Restart
**Given** a user views their result
**When** they click "Try Again"
**Then** they return to the welcome screen
**And** their previous session is cleared
**And** they can start a fresh quiz

**Test Category:** @req-ui-01 @frontend @navigation
**Verification:** Automated

### AC12: Session Management
**Given** a user starts a quiz
**When** they answer questions
**Then** their answers are stored in a session
**And** the session expires after 1 hour
**And** session data is stored in Redis

**Test Category:** @req-ui-01 @backend @session
**Verification:** Automated

### AC13: Performance - Page Load
**Given** a user on a 3G connection
**When** they visit the website
**Then** the page loads and is interactive within 2 seconds

**Test Category:** @req-ui-01 @performance
**Verification:** Automated (Lighthouse)

### AC14: Performance - Question Transitions
**Given** a user is taking the quiz
**When** they select an answer
**Then** the next question appears within 300ms

**Test Category:** @req-ui-01 @performance
**Verification:** Automated

### AC15: Accessibility - Keyboard Navigation
**Given** a user navigating with keyboard only
**When** they use Tab and Enter keys
**Then** they can complete the entire quiz
**And** focus indicators are clearly visible
**And** all interactive elements are reachable

**Test Category:** @req-ui-01 @accessibility
**Verification:** Manual

---

## Design References

- **SAD:** [designs/SAD-001-height-prediction-app.md]
- **UI Mockup:** [designs/mockup-height-quiz.html]
- **Question Bank:** [designs/question-bank.json] (to be created)
- **API Specs:** [designs/api-specification.yaml] (to be created)

**Design/Implementation Parity:** 
- [ ] Design documents reviewed and approved
- [ ] Implementation matches mockup design
- [ ] Question bank contains 50+ questions
- [ ] Height calculation logic matches specification

---

## Test Scenarios

### Test Coverage Map
| Acceptance Criterion | Test File/Suite | Test Scenario ID | Status |
|---------------------|-----------------|------------------|--------|
| AC1 | e2e/welcome.spec.js | @req-ui-01 Welcome display | Pending |
| AC2 | e2e/quiz-flow.spec.js | @req-ui-01 Start quiz | Pending |
| AC3 | e2e/quiz-flow.spec.js | @req-ui-01 Question display | Pending |
| AC4 | e2e/quiz-flow.spec.js | @req-ui-01 Answer selection | Pending |
| AC5 | unit/height-calc.test.js | @req-ui-01 Base height | Pending |
| AC6 | unit/height-calc.test.js | @req-ui-01 Height adjustment | Pending |
| AC7 | e2e/results.spec.js | @req-ui-01 Result display | Pending |
| AC8 | unit/height-format.test.js | @req-ui-01 Height conversion | Pending |
| AC9 | e2e/responsive.spec.js | @req-ui-01 Mobile layout | Pending |
| AC10 | e2e/sharing.spec.js | @req-ui-01 Social share | Pending |
| AC11 | e2e/navigation.spec.js | @req-ui-01 Quiz restart | Pending |
| AC12 | integration/session.test.js | @req-ui-01 Session mgmt | Pending |
| AC13 | lighthouse/performance.test.js | @req-ui-01 Page load | Pending |
| AC14 | e2e/performance.spec.js | @req-ui-01 Transitions | Pending |
| AC15 | e2e/accessibility.spec.js | @req-ui-01 Keyboard nav | Pending |

### Test Annotations Required
- **Requirement reference:** `REQ-UI-01`
- **Category tags:** `@frontend`, `@backend`, `@performance`, `@accessibility`
- **Feature tags:** `@req-ui-01`

### Human Verification Required
- [ ] Visual design matches mockup
- [ ] Animations are smooth and engaging
- [ ] Mobile experience is intuitive
- [ ] Share functionality works on various platforms
- [ ] Overall user experience is fun and engaging

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
- [ ] Test scenarios annotated with requirement reference (REQ-UI-01)
- [ ] Test scenarios annotated with category tags
- [ ] Feature scenarios verified and approved by a human
- [ ] All automated tests pass (local and/or CI)
- [ ] Test report documented in this requirement file

### 3. Pull Request
- [ ] PR title includes REQ ID (e.g., "feat: height prediction quiz [REQ-UI-01]")
- [ ] PR description links this requirement file and design docs from `designs/`
- [ ] One primary PR per requirement

### 4. Code Integration
- [ ] Requirement reference included in branch name (e.g., feature/REQ-UI-01-height-quiz)
- [ ] Requirement reference in commit messages
- [ ] All DoD items satisfied

### 5. Infrastructure & Deployment
- [ ] Terraform code provided for AWS resources
- [ ] Dockerfile created for containerization
- [ ] ECS task definition configured
- [ ] Environment variables documented
- [ ] Deployed to dev environment successfully
- [ ] Health checks passing
- [ ] Monitoring configured

### 6. Documentation
- [ ] Implementation documented in design docs
- [ ] API documentation complete
- [ ] Deployment runbook updated
- [ ] README updated with setup instructions

---

## Notes

**Open Questions:**
- Should we collect any analytics (anonymously)?
- Do we want to add more question categories in the future?
- Should results be shareable as images (not just text)?

**Assumptions:**
- Users understand this is for entertainment, not accuracy
- Most users will access via mobile devices
- Session storage in Redis is sufficient (no database needed)
- 50 questions provide enough variety for replayability

**Follow-up Items:**
- Create detailed question bank with 50+ questions - Owner: TBD, Due: TBD
- Design share image template for social media - Owner: TBD, Due: TBD
- Set up analytics tracking (if approved) - Owner: TBD, Due: TBD