# ADD-001: Code Structure and Organization

**Status:** Draft
**Date:** 2026-05-21
**Authors:** Bob
**Related Requirements:** REQ-API-01, REQ-UI-01, REQ-INFRA-01

---

## Context

### Purpose
This document defines the complete code structure and organization for the height prediction quiz application, including backend API, frontend UI, infrastructure code, and supporting files.

### Goals
- Clear separation of concerns (frontend, backend, infrastructure)
- Maintainable and scalable codebase
- Easy onboarding for new developers
- Consistent naming conventions
- Testable architecture

---

## Project Structure Overview

```
height-quiz/
├── README.md
├── .gitignore
├── docker-compose.yml
├── Makefile
│
├── backend/                    # Node.js/Express API
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                   # React SPA
│   ├── src/
│   ├── public/
│   ├── tests/
│   ├── package.json
│   └── README.md
│
├── terraform/                  # Infrastructure as Code
│   ├── environments/
│   ├── modules/
│   └── README.md
│
├── designs/                    # Design documents
│   ├── ADD-001-code-structure.md
│   ├── SAD-001-height-prediction-app.md
│   ├── question-bank.json
│   └── diagrams/
│
├── requirements/               # Requirements documents
│   ├── REQ-API-01-height-quiz-backend.md
│   ├── REQ-UI-01-height-prediction-website.md
│   └── REQ-INFRA-01-aws-ecs-deployment.md
│
└── .bob/                      # Bob AI skill definitions
    └── skills/
```

---

## Backend Structure (Node.js/Express)

### Directory Layout

```
backend/
├── src/
│   ├── index.js                    # Application entry point
│   ├── app.js                      # Express app configuration
│   ├── config/
│   │   ├── index.js                # Configuration loader
│   │   ├── redis.js                # Redis configuration
│   │   └── questions.js            # Question bank loader
│   ├── routes/
│   │   ├── index.js                # Route aggregator
│   │   ├── session.routes.js       # Session endpoints
│   │   └── health.routes.js        # Health check endpoint
│   ├── controllers/
│   │   ├── session.controller.js   # Session business logic
│   │   └── health.controller.js    # Health check logic
│   ├── services/
│   │   ├── session.service.js      # Session management
│   │   ├── question.service.js     # Question selection logic
│   │   ├── height.service.js       # Height calculation
│   │   └── redis.service.js        # Redis operations
│   ├── middleware/
│   │   ├── errorHandler.js         # Global error handler
│   │   ├── rateLimiter.js          # Rate limiting
│   │   ├── validator.js            # Request validation
│   │   └── cors.js                 # CORS configuration
│   ├── utils/
│   │   ├── logger.js               # Winston logger setup
│   │   ├── heightConverter.js      # cm to feet/inches
│   │   └── sessionGenerator.js     # UUID generation
│   └── data/
│       └── questions.json          # Question bank (copied from designs/)
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   │   ├── height.service.test.js
│   │   │   ├── question.service.test.js
│   │   │   └── session.service.test.js
│   │   └── utils/
│   │       └── heightConverter.test.js
│   ├── integration/
│   │   ├── session.test.js
│   │   ├── health.test.js
│   │   └── rateLimit.test.js
│   └── setup.js                    # Test configuration
│
├── package.json
├── package-lock.json
├── .env.example
├── .dockerignore
├── Dockerfile
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
└── README.md
```

### Key Files

#### `src/index.js`
```javascript
// Application entry point
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
```

#### `src/app.js`
```javascript
// Express app configuration
const express = require('express');
const helmet = require('helmet');
const cors = require('./middleware/cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(helmet());
app.use(cors);
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

module.exports = app;
```

#### `src/config/index.js`
```javascript
// Configuration management
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    ttl: 3600 // 1 hour
  },
  rateLimit: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 sessions per IP
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
  }
};
```

#### `src/services/height.service.js`
```javascript
// Height calculation logic
class HeightService {
  calculateHeight(answers) {
    // 1. Get base height from cultural questions
    const baseHeight = this.getBaseHeight(answers);
    
    // 2. Calculate adjustments from physical indicators
    const adjustments = this.calculateAdjustments(answers);
    
    // 3. Add random factor
    const randomFactor = Math.random() * 6 - 3; // ±3cm
    
    // 4. Calculate final height
    let finalHeight = baseHeight + adjustments + randomFactor;
    
    // 5. Clamp to reasonable range
    finalHeight = Math.max(147, Math.min(208, finalHeight));
    
    return Math.round(finalHeight);
  }
  
  getBaseHeight(answers) {
    // Logic to infer base height from cultural questions
    // Default to 170cm if no cultural indicators
  }
  
  calculateAdjustments(answers) {
    // Sum up all score adjustments
  }
}

module.exports = new HeightService();
```

### Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "docker:build": "docker build -t height-quiz-api .",
    "docker:run": "docker run -p 3000:3000 height-quiz-api"
  }
}
```

---

## Frontend Structure (React + Vite)

### Directory Layout

```
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── main.jsx                    # Application entry point
│   ├── App.jsx                     # Root component
│   ├── index.css                   # Global styles
│   │
│   ├── components/
│   │   ├── WelcomeScreen/
│   │   │   ├── WelcomeScreen.jsx
│   │   │   └── WelcomeScreen.css
│   │   ├── QuestionScreen/
│   │   │   ├── QuestionScreen.jsx
│   │   │   ├── QuestionScreen.css
│   │   │   ├── ProgressBar.jsx
│   │   │   └── OptionButton.jsx
│   │   ├── ResultScreen/
│   │   │   ├── ResultScreen.jsx
│   │   │   ├── ResultScreen.css
│   │   │   └── HeightDisplay.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       └── LoadingSpinner.jsx
│   │
│   ├── services/
│   │   └── api.js                  # API client
│   │
│   ├── hooks/
│   │   ├── useQuiz.js              # Quiz state management
│   │   └── useApi.js               # API call hook
│   │
│   ├── utils/
│   │   ├── heightFormatter.js      # Format height display
│   │   └── shareHelper.js          # Social sharing logic
│   │
│   └── constants/
│       └── config.js               # Frontend configuration
│
├── tests/
│   ├── components/
│   │   ├── WelcomeScreen.test.jsx
│   │   ├── QuestionScreen.test.jsx
│   │   └── ResultScreen.test.jsx
│   ├── hooks/
│   │   └── useQuiz.test.js
│   └── setup.js
│
├── package.json
├── package-lock.json
├── vite.config.js
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── index.html
└── README.md
```

### Key Files

#### `src/App.jsx`
```jsx
import { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
import QuestionScreen from './components/QuestionScreen/QuestionScreen';
import ResultScreen from './components/ResultScreen/ResultScreen';
import { useQuiz } from './hooks/useQuiz';
import './App.css';

function App() {
  const [screen, setScreen] = useState('welcome'); // welcome, question, result
  const { startQuiz, submitAnswer, result } = useQuiz();

  const handleStart = async () => {
    await startQuiz();
    setScreen('question');
  };

  const handleComplete = () => {
    setScreen('result');
  };

  return (
    <div className="app">
      {screen === 'welcome' && <WelcomeScreen onStart={handleStart} />}
      {screen === 'question' && (
        <QuestionScreen 
          onSubmit={submitAnswer} 
          onComplete={handleComplete} 
        />
      )}
      {screen === 'result' && <ResultScreen result={result} />}
    </div>
  );
}

export default App;
```

#### `src/services/api.js`
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  async startSession() {
    const response = await fetch(`${API_BASE_URL}/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async submitAnswer(sessionId, questionId, answerId) {
    const response = await fetch(
      `${API_BASE_URL}/session/${sessionId}/answer`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answerId })
      }
    );
    return response.json();
  }

  async getResult(sessionId) {
    const response = await fetch(`${API_BASE_URL}/session/${sessionId}/result`);
    return response.json();
  }
}

export default new ApiService();
```

#### `src/hooks/useQuiz.js`
```javascript
import { useState } from 'react';
import api from '../services/api';

export function useQuiz() {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 10 });
  const [result, setResult] = useState(null);

  const startQuiz = async () => {
    const data = await api.startSession();
    setSessionId(data.session_id);
    setCurrentQuestion(data.question);
    setProgress(data.progress);
  };

  const submitAnswer = async (answerId) => {
    const data = await api.submitAnswer(
      sessionId,
      currentQuestion.id,
      answerId
    );
    
    if (data.completed) {
      const resultData = await api.getResult(sessionId);
      setResult(resultData);
      return { completed: true };
    }
    
    setCurrentQuestion(data.next_question);
    setProgress(data.progress);
    return { completed: false };
  };

  return { startQuiz, submitAnswer, result, currentQuestion, progress };
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write \"src/**/*.{js,jsx}\""
  }
}
```

---

## Terraform Structure

### Directory Layout

```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   ├── backend.tf
│   │   └── outputs.tf
│   ├── staging/
│   │   └── [same structure]
│   └── prod/
│       └── [same structure]
│
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── ecs-service/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── alb/
│   │   └── [same structure]
│   └── redis/
│       └── [same structure]
│
└── README.md
```

### Module Structure Example

#### `modules/ecs-service/main.tf`
```hcl
resource "aws_ecs_cluster" "main" {
  name = var.cluster_name
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = var.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name  = var.container_name
    image = var.container_image
    portMappings = [{
      containerPort = var.container_port
      protocol      = "tcp"
    }]
    environment = var.environment_variables
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.app.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])
}
```

---

## Docker Configuration

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

EXPOSE 3000

USER node

CMD ["node", "src/index.js"]
```

### Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - CORS_ORIGIN=http://localhost:5173
    depends_on:
      - redis
    volumes:
      - ./backend/src:/app/src

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000/api
    volumes:
      - ./frontend/src:/app/src

volumes:
  redis-data:
```

---

## Configuration Management

### Environment Variables

#### Backend (.env.example)
```bash
# Server
NODE_ENV=development
PORT=3000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=10

# Logging
LOG_LEVEL=info
```

#### Frontend (.env.example)
```bash
VITE_API_URL=http://localhost:3000/api
```

---

## Testing Strategy

### Backend Tests

```
tests/
├── unit/                           # Fast, isolated tests
│   ├── services/
│   ├── utils/
│   └── middleware/
├── integration/                    # API endpoint tests
│   ├── session.test.js
│   └── health.test.js
└── e2e/                           # End-to-end tests (optional)
```

### Frontend Tests

```
tests/
├── components/                     # Component tests
│   ├── WelcomeScreen.test.jsx
│   ├── QuestionScreen.test.jsx
│   └── ResultScreen.test.jsx
├── hooks/                         # Hook tests
│   └── useQuiz.test.js
└── integration/                   # Integration tests
    └── quiz-flow.test.jsx
```

---

## Code Style and Standards

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    'prefer-const': 'error'
  }
};
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

---

## Naming Conventions

### Files
- **Components:** PascalCase (e.g., `WelcomeScreen.jsx`)
- **Services:** camelCase with .service suffix (e.g., `height.service.js`)
- **Utils:** camelCase (e.g., `heightConverter.js`)
- **Tests:** Same as source file with .test suffix (e.g., `height.service.test.js`)

### Code
- **Variables/Functions:** camelCase (e.g., `calculateHeight`)
- **Classes:** PascalCase (e.g., `HeightService`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_QUESTIONS`)
- **React Components:** PascalCase (e.g., `QuestionScreen`)

### Git Branches
- **Feature:** `feature/REQ-XXX-description`
- **Bugfix:** `bugfix/issue-description`
- **Hotfix:** `hotfix/critical-issue`

### Commit Messages
```
feat: add height calculation service [REQ-API-01]
fix: correct height conversion formula
docs: update API documentation
test: add unit tests for question service
refactor: simplify session management
```

---

## Development Workflow

### Local Development Setup

1. **Clone repository**
   ```bash
   git clone <repo-url>
   cd height-quiz
   ```

2. **Start backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   npm run dev
   ```

3. **Start frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

4. **Or use Docker Compose**
   ```bash
   docker-compose up
   ```

### Testing

```bash
# Backend
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report

# Frontend
cd frontend
npm test                    # Run all tests
npm run test:ui            # UI mode
```

### Building for Production

```bash
# Backend
cd backend
docker build -t height-quiz-api:latest .

# Frontend
cd frontend
npm run build
```

---

## CI/CD Pipeline (Future)

```yaml
# .github/workflows/ci.yml
name: CI/CD

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run backend tests
        run: |
          cd backend
          npm install
          npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run frontend tests
        run: |
          cd frontend
          npm install
          npm test

  deploy:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: |
          # Deployment steps
```

---

## Documentation Standards

### README.md Structure

Each component (backend, frontend, terraform) should have:

1. **Overview** - What it does
2. **Prerequisites** - Required tools/versions
3. **Installation** - Setup steps
4. **Configuration** - Environment variables
5. **Usage** - How to run
6. **Testing** - How to test
7. **Deployment** - How to deploy
8. **Troubleshooting** - Common issues

### Code Comments

```javascript
/**
 * Calculate height based on user answers
 * @param {Array} answers - Array of user answers
 * @returns {number} Predicted height in centimeters
 */
function calculateHeight(answers) {
  // Implementation
}
```

---

## Security Considerations

### Backend
- No secrets in code or logs
- Input validation on all endpoints
- Rate limiting enabled
- CORS properly configured
- Helmet.js security headers
- Redis password protected

### Frontend
- No API keys in client code
- XSS protection
- HTTPS only in production
- Content Security Policy

### Infrastructure
- Security groups with least privilege
- Secrets in AWS Secrets Manager
- Encryption at rest and in transit
- IAM roles with minimal permissions

---

## Performance Targets

### Backend
- API response time: < 200ms (p95)
- Session creation: < 100ms
- Health check: < 50ms
- Support 1,000 concurrent users

### Frontend
- Page load: < 2 seconds (3G)
- Question transition: < 300ms
- Lighthouse score: > 90

---

## Monitoring and Logging

### Backend Logging
```javascript
logger.info('Session created', { sessionId, timestamp });
logger.error('Redis connection failed', { error, timestamp });
```

### CloudWatch Metrics
- API request count
- Response times
- Error rates
- ECS CPU/Memory
- Redis connections

---

## References

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)