# SAD-001: Height Prediction Fun App

**Status:** Draft
**Date:** 2026-05-21
**Authors:** Bob
**Related Requirements:** REQ-UI-01 (to be created)

---

## Context

### Background
A fun, lighthearted web app that "predicts" a user's height through a series of seemingly random questions. The predictions are based on simple scoring rules and randomization - it's meant to be entertaining rather than accurate.

### Problem Statement
Create an engaging, shareable web experience that entertains users with a playful height prediction game. No actual accuracy required - it's all about the fun factor and shareability.

### Constraints
- Simple web app (HTML/CSS/JavaScript frontend + lightweight backend)
- Deploy on AWS ECS
- No complex ML or training data needed
- Must be fast and responsive
- Low cost to operate

### Assumptions
- Users understand this is for entertainment
- Simple scoring algorithm is sufficient
- No need for data persistence beyond sessions
- Mobile-friendly design is essential

---

## Solution Design

### High-Level Architecture

```
┌─────────────────┐
│   User Browser  │
│  (React SPA)    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────┐
│     CloudFront CDN + ALB            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      ECS Fargate Service            │
│  ┌─────────────────────────────┐   │
│  │   Node.js/Express API       │   │
│  │   - Question logic          │   │
│  │   - Simple scoring          │   │
│  │   - Session management      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     ElastiCache Redis               │
│     (Session storage)               │
└─────────────────────────────────────┘
```

### Core Components

#### 1. Frontend (React SPA)
**Purpose:** Single-page application for user interaction.

**Features:**
- Question display with smooth animations
- Progress indicator
- Height reveal with fun animations
- Share to social media
- Mobile-responsive design

**Tech Stack:**
- React 18
- Tailwind CSS for styling
- Framer Motion for animations
- Deployed as static files on S3/CloudFront

#### 2. Backend API (Node.js/Express)
**Purpose:** Serve questions and calculate "predictions".

**Endpoints:**
```javascript
POST /api/session/start
  → Returns session_id and first question

POST /api/session/:id/answer
  → Accepts answer, returns next question or prediction

GET /api/session/:id/result
  → Returns final height prediction
```

**Simple Scoring Logic:**
```javascript
function calculateHeight(answers) {
  let score = 0;
  
  // Each answer adds/subtracts points
  answers.forEach(answer => {
    score += getAnswerScore(answer);
  });
  
  // Add some randomness for fun
  const randomFactor = Math.random() * 10 - 5; // ±5cm
  
  // Convert score to height range (150-200cm)
  const baseHeight = 170; // Average height
  const height = baseHeight + score + randomFactor;
  
  // Clamp to reasonable range
  return Math.max(150, Math.min(200, Math.round(height)));
}
```

#### 3. Session Management (Redis)
**Purpose:** Store user answers temporarily.

**Session Data:**
```json
{
  "session_id": "uuid",
  "answers": [
    {"question_id": "q1", "answer": "option2"},
    {"question_id": "q2", "answer": "option1"}
  ],
  "created_at": "timestamp"
}
```

**TTL:** 1 hour (auto-expire)

---

## Question Bank

### 10 Fun Questions with Simple Scoring

```javascript
const questions = [
  {
    id: "q1",
    text: "What's your favorite type of weather?",
    options: [
      { text: "Sunny ☀️", score: 3 },
      { text: "Rainy 🌧️", score: -2 },
      { text: "Snowy ❄️", score: 5 },
      { text: "Windy 💨", score: 0 }
    ]
  },
  {
    id: "q2",
    text: "Pick your ideal vacation:",
    options: [
      { text: "Beach 🏖️", score: -3 },
      { text: "Mountains ⛰️", score: 4 },
      { text: "City 🏙️", score: 1 },
      { text: "Countryside 🌾", score: 2 }
    ]
  },
  {
    id: "q3",
    text: "Your go-to coffee order?",
    options: [
      { text: "Espresso ☕", score: -4 },
      { text: "Latte 🥛", score: 2 },
      { text: "Americano", score: 3 },
      { text: "I don't drink coffee", score: 0 }
    ]
  },
  {
    id: "q4",
    text: "Favorite time of day?",
    options: [
      { text: "Early morning 🌅", score: 4 },
      { text: "Afternoon ☀️", score: 1 },
      { text: "Evening 🌆", score: -1 },
      { text: "Night 🌙", score: -3 }
    ]
  },
  {
    id: "q5",
    text: "Pick a superpower:",
    options: [
      { text: "Flying 🦅", score: 5 },
      { text: "Invisibility 👻", score: -4 },
      { text: "Super strength 💪", score: 6 },
      { text: "Telepathy 🧠", score: 0 }
    ]
  },
  {
    id: "q6",
    text: "Favorite pizza topping?",
    options: [
      { text: "Pepperoni 🍕", score: 2 },
      { text: "Vegetables 🥗", score: -2 },
      { text: "Extra cheese 🧀", score: 3 },
      { text: "Pineapple 🍍", score: -5 }
    ]
  },
  {
    id: "q7",
    text: "Your spirit animal?",
    options: [
      { text: "Eagle 🦅", score: 4 },
      { text: "Cat 🐱", score: -3 },
      { text: "Bear 🐻", score: 5 },
      { text: "Dolphin 🐬", score: 1 }
    ]
  },
  {
    id: "q8",
    text: "Favorite season?",
    options: [
      { text: "Spring 🌸", score: 1 },
      { text: "Summer ☀️", score: 3 },
      { text: "Fall 🍂", score: 2 },
      { text: "Winter ⛄", score: 4 }
    ]
  },
  {
    id: "q9",
    text: "Pick a color:",
    options: [
      { text: "Blue 💙", score: 2 },
      { text: "Red ❤️", score: 3 },
      { text: "Green 💚", score: -1 },
      { text: "Yellow 💛", score: 0 }
    ]
  },
  {
    id: "q10",
    text: "Favorite type of music?",
    options: [
      { text: "Rock 🎸", score: 4 },
      { text: "Pop 🎤", score: -2 },
      { text: "Classical 🎻", score: 1 },
      { text: "Jazz 🎺", score: 3 }
    ]
  }
];
```

---

## API Design

### 1. Start Session
```http
POST /api/session/start

Response 200:
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "question": {
    "id": "q1",
    "text": "What's your favorite type of weather?",
    "options": [
      {"id": "opt1", "text": "Sunny ☀️"},
      {"id": "opt2", "text": "Rainy 🌧️"},
      {"id": "opt3", "text": "Snowy ❄️"},
      {"id": "opt4", "text": "Windy 💨"}
    ]
  },
  "progress": {
    "current": 1,
    "total": 10
  }
}
```

### 2. Submit Answer
```http
POST /api/session/:session_id/answer

Request:
{
  "question_id": "q1",
  "answer_id": "opt3"
}

Response 200:
{
  "next_question": {
    "id": "q2",
    "text": "Pick your ideal vacation:",
    "options": [...]
  },
  "progress": {
    "current": 2,
    "total": 10
  }
}

// Or if last question:
Response 200:
{
  "completed": true,
  "redirect": "/api/session/:session_id/result"
}
```

### 3. Get Result
```http
GET /api/session/:session_id/result

Response 200:
{
  "height": {
    "cm": 175,
    "feet": 5,
    "inches": 9,
    "display": "5'9\""
  },
  "message": "Based on your cosmic energy, we predict you are...",
  "share_text": "I'm 5'9\" according to this totally scientific quiz! 😄"
}
```

---

## AWS Infrastructure (Terraform)

### Resources Needed

```hcl
# VPC and Networking
- VPC with public/private subnets
- Internet Gateway
- NAT Gateway (optional, for private subnets)
- Security Groups

# Load Balancing
- Application Load Balancer (ALB)
- Target Group
- Listener (HTTPS)

# ECS
- ECS Cluster
- ECS Task Definition
- ECS Service (Fargate)
- CloudWatch Log Group

# Caching
- ElastiCache Redis cluster (single node for dev)

# Container Registry
- ECR repository for Docker images

# DNS & SSL
- Route53 hosted zone (if custom domain)
- ACM certificate

# Monitoring
- CloudWatch alarms
- CloudWatch dashboard
```

### Terraform Structure
```
terraform/
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── prod/
├── modules/
│   ├── ecs-service/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   ├── alb/
│   ├── redis/
│   └── networking/
└── README.md
```

---

## Deployment Architecture

### Container Setup

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

**ECS Task Definition:**
- CPU: 256 (.25 vCPU)
- Memory: 512 MB
- Port: 3000
- Environment variables:
  - REDIS_HOST
  - REDIS_PORT
  - NODE_ENV

### Scaling Configuration
- Desired count: 2 (for HA)
- Min: 1
- Max: 4
- Auto-scaling based on CPU (target 70%)

---

## User Experience Flow

### 1. Landing Page
```
┌─────────────────────────────┐
│                             │
│   Can We Guess Your Height? │
│                             │
│   [Start Quiz] 🎯           │
│                             │
│   "10 fun questions"        │
│                             │
└─────────────────────────────┘
```

### 2. Question Flow
```
┌─────────────────────────────┐
│  Question 3 of 10           │
│  ████████░░░░░░░░░░ 30%     │
│                             │
│  Pick your ideal vacation:  │
│                             │
│  [ Beach 🏖️ ]               │
│  [ Mountains ⛰️ ]           │
│  [ City 🏙️ ]                │
│  [ Countryside 🌾 ]         │
│                             │
└─────────────────────────────┘
```

### 3. Result Page
```
┌─────────────────────────────┐
│                             │
│      🎉 We predict...       │
│                             │
│         5'9"                │
│       (175 cm)              │
│                             │
│  [Share] [Try Again]        │
│                             │
└─────────────────────────────┘
```

---

## Tech Stack Summary

### Frontend
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Build:** Vite
- **Hosting:** S3 + CloudFront

### Backend
- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Session:** Redis (ElastiCache)
- **Container:** Docker
- **Orchestration:** ECS Fargate

### Infrastructure
- **Cloud:** AWS
- **IaC:** Terraform
- **CI/CD:** GitHub Actions
- **Monitoring:** CloudWatch

---

## Cost Estimate (Monthly)

### Development Environment
- ECS Fargate (2 tasks): ~$30
- ALB: ~$20
- ElastiCache (t3.micro): ~$15
- Data transfer: ~$5
- **Total: ~$70/month**

### Production Environment
- ECS Fargate (2-4 tasks): ~$60
- ALB: ~$20
- ElastiCache (t3.small): ~$30
- CloudFront: ~$10
- Data transfer: ~$20
- **Total: ~$140/month**

---

## Development Plan

### Phase 1: MVP (Week 1)
- [ ] Basic React frontend with 10 questions
- [ ] Simple Express API with scoring logic
- [ ] Local development setup
- [ ] Basic styling

### Phase 2: Infrastructure (Week 2)
- [ ] Terraform code for AWS resources
- [ ] Docker containerization
- [ ] ECS deployment
- [ ] Redis integration

### Phase 3: Polish (Week 3)
- [ ] Animations and transitions
- [ ] Mobile responsiveness
- [ ] Social sharing
- [ ] Error handling

### Phase 4: Launch
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Performance testing
- [ ] Documentation

---

## Success Criteria

### Technical
- [ ] Page load time < 2 seconds
- [ ] API response time < 200ms
- [ ] 99% uptime
- [ ] Mobile-friendly (responsive)

### User Experience
- [ ] Complete quiz in < 2 minutes
- [ ] Fun, engaging animations
- [ ] Easy social sharing
- [ ] Works on all modern browsers

---

## Security Considerations

- HTTPS only (ALB with ACM certificate)
- Rate limiting (10 sessions per IP per hour)
- No PII collected
- Session data expires after 1 hour
- CORS configured for frontend domain only
- Security headers (helmet.js)

---

## Monitoring & Alerts

### CloudWatch Metrics
- ECS CPU/Memory utilization
- ALB request count and latency
- Redis connection count
- Error rates

### Alarms
- High error rate (> 5%)
- High latency (> 1s)
- Low healthy host count
- Redis connection failures

---

## Future Enhancements (Optional)

- Multiple question sets (themes)
- Leaderboard of predictions
- Custom share images
- Multi-language support
- Analytics dashboard
- A/B testing different questions

---

## References

- AWS ECS Best Practices
- Terraform AWS Provider Documentation
- React Performance Optimization
- Express.js Security Best Practices

---

## Appendix

### Environment Variables
```bash
# Backend
NODE_ENV=production
PORT=3000
REDIS_HOST=redis.example.com
REDIS_PORT=6379
CORS_ORIGIN=https://height-quiz.example.com

# Frontend
VITE_API_URL=https://api.height-quiz.example.com
```

### Useful Commands
```bash
# Local development
npm run dev

# Build Docker image
docker build -t height-quiz-api .

# Run locally with Docker
docker-compose up

# Deploy with Terraform
cd terraform/environments/dev
terraform init
terraform plan
terraform apply