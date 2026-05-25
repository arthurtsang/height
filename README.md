# Height Prediction Quiz

A sophisticated, interactive web application that predicts your height using statistical inference and real-world data. The app uses subtle questions about preferences, lifestyle, and demographics to determine your nationality, age, sex, and height category through Bayesian probability analysis.

## 🎯 Features

- **Statistical Adaptive Questioning**: Uses Bayesian inference and information gain to select the most informative questions
- **Multi-Attribute Tracking**: Simultaneously determines nationality, sex, age group, and height deviation
- **Real-World Data**: Based on actual statistics from 20+ countries including average heights, food preferences, and cultural patterns
- **Smart Question Selection**: Dynamically chooses questions that maximize information gain across all attributes
- **Confidence-Based Termination**: Quiz continues until reaching 90% confidence on demographics and 85% on height
- **Smart Hints**: Shows contextual hints when confidence reaches 70%+
- **Fun Facts**: Explains how your answers led to the prediction
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Beautiful UI**: Smooth animations, progress indicators, and gradient backgrounds

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js 18+ with Express
- Redis for session management (with in-memory fallback)
- Bayesian inference engine
- Information gain calculation
- RESTful API design
- Rate limiting and security middleware

**Frontend:**
- React 18 with Vite
- Custom hooks for state management
- Axios for API communication
- CSS3 with animations
- Smart progress indicators

**Infrastructure:**
- Docker & Docker Compose
- Vercel deployment
- Multi-stage builds for optimization
- Health checks and auto-restart
- Nginx for frontend serving

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git

### Running with Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd height
   ```

2. **Start all services**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Health Check: http://localhost:3000/api/health

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services**
   ```bash
   docker-compose down
   ```

### Running Locally (Development)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Start Redis first: redis-server
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 📁 Project Structure

```
.
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   │   ├── session.service.js      # Session & quiz management
│   │   │   ├── question.service.js     # Question selection & IG
│   │   │   ├── inference.service.js    # Bayesian inference
│   │   │   ├── height.service.js       # Height calculation
│   │   │   └── redis.service.js        # Session storage
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   ├── config/         # Configuration
│   │   └── data/           # Question bank & country statistics
│   ├── scripts/            # Data collection scripts
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── WelcomeScreen/
│   │   │   ├── QuestionScreen/
│   │   │   └── ResultScreen/
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API client
│   │   └── utils/         # Helper functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── requirements/          # Product requirements
│   ├── REQ-API-01-height-quiz-backend.md
│   ├── REQ-API-02-adaptive-height-quiz.md
│   ├── REQ-API-03-statistical-adaptive-quiz.md
│   ├── REQ-UI-01-height-prediction-website.md
│   └── REQ-INFRA-01-aws-ecs-deployment.md
│
├── designs/              # Architecture & design docs
│   ├── SAD-001-height-prediction-app.md
│   ├── SAD-002-adaptive-height-quiz.md
│   ├── SAD-003-statistical-adaptive-quiz.md
│   ├── ADD-001-code-structure.md
│   └── question-bank-enhanced.json
│
├── docker-compose.yml    # Multi-container orchestration
├── vercel.json          # Vercel deployment config
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```env
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:5173
SESSION_TTL=7200
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                 # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage   # With coverage report
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📊 API Endpoints

### Health Check
```
GET /api/health
Response: { status: 'ok', timestamp: '...', redis: 'connected' }
```

### Start Quiz Session
```
POST /api/session/start
Response: { 
  sessionId: '...', 
  next_question: {...},
  progress: { current: 1, total: 25, ... }
}
```

### Submit Answer
```
POST /api/session/answer
Body: { sessionId: '...', questionId: '...', answerId: '...' }
Response: { 
  completed: false,
  next_question: {...},
  progress: { 
    current: 2, 
    averageConfidence: 45,
    confidenceBreakdown: { nationality: 60, sex: 40, age: 35, height: 45 },
    hints: { nationality: 'US', sex: 'male', ageGroup: 'adult' }
  }
}
```

### Get Result
```
GET /api/session/result/:sessionId
Response: { 
  height: { cm: 175, feet: 5, inches: 9, display: "5'9\"", category: 'average' },
  nationality: 'United States',
  confidence: 87,
  demographics: { sex: 'male', ageGroup: 'adult' },
  confidenceBreakdown: { nationality: 92, sex: 95, age: 88, height: 85 },
  funFacts: [...],
  insights: {...}
}
```

## 🎨 How It Works

### Statistical Adaptive Algorithm

The system uses a sophisticated multi-attribute Bayesian inference approach:

#### 1. **Initialization**
- Creates probability distributions for 4 attributes:
  - **Nationality**: 20 countries with equal prior (5% each)
  - **Sex**: Male/Female with 50/50 prior
  - **Age Group**: Child/Teen/Adult/Senior with equal priors
  - **Height Deviation**: Way Below/Below/Average/Above/Way Above with equal priors

#### 2. **Question Selection (Information Gain)**
- For each available question, calculates information gain across ALL attributes
- Selects question with highest maximum information gain
- Avoids recently asked categories for variety
- Uses entropy reduction to measure information value

#### 3. **Bayesian Update**
- Each answer has weights for multiple countries (0-100 scale)
- Converts weights to probabilities (normalized)
- Updates all attribute distributions using Bayes' theorem
- Calculates confidence as: `1 - entropy / max_entropy`

#### 4. **Termination Criteria**
- Quiz continues until ALL thresholds met OR max 25 questions:
  - Nationality: 90% confidence
  - Sex: 90% confidence
  - Age Group: 90% confidence
  - Height Deviation: 85% confidence

#### 5. **Height Calculation**
- Base height from: Country + Sex + Age Group statistics
- Adjustment from: Height deviation category
  - Way Below: -15cm
  - Below: -7.5cm
  - Average: 0cm
  - Above: +7.5cm
  - Way Above: +15cm
- Final height = Base + Adjustment

### Real-World Data Sources

The system uses actual statistics from:
- **Height Data**: WHO, CDC, national health surveys
- **Food Preferences**: Google Trends, cultural surveys
- **Sports Popularity**: International sports federations
- **Cultural Patterns**: Academic research, demographic studies

See `backend/scripts/DATA_SOURCES.md` for complete source list.

## 🐳 Docker Services

### Redis
- Image: `redis:7-alpine`
- Port: 6379
- Persistent storage with volume
- Session TTL: 2 hours with auto-refresh

### Backend
- Built from `./backend/Dockerfile`
- Port: 3000
- Health checks enabled
- Auto-restart on failure
- In-memory fallback if Redis unavailable

### Frontend
- Built from `./frontend/Dockerfile`
- Port: 5173 (mapped to 80 in container)
- Nginx serving static files
- Health checks enabled

## 📝 Requirements & Design

- **Requirements**: See `requirements/` directory
  - REQ-API-01: Original backend API
  - REQ-API-02: Adaptive questioning system
  - REQ-API-03: Statistical adaptive quiz (current)
  - REQ-UI-01: Frontend requirements
  - REQ-INFRA-01: AWS ECS deployment
  - REQ-INFRA-02: Docker & Vercel deployment

- **Design Documents**: See `designs/` directory
  - SAD-001: Original solution architecture
  - SAD-002: Adaptive height quiz design
  - SAD-003: Statistical adaptive quiz (current)
  - ADD-001: Code structure
  - question-bank-enhanced.json: 50+ questions with multi-country weights

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation
- Session expiration (2 hours with auto-refresh)
- No PII collection
- Trust proxy for Vercel deployment

## 🚢 Deployment

### Vercel (Current)

The app is deployed on Vercel with:
- Frontend: Static site deployment
- Backend: Serverless functions via `/api` route
- Redis: Upstash Redis (serverless)

See `VERCEL_SETUP.md` and `INFRASTRUCTURE.md` for details.

### AWS ECS (Alternative)

Infrastructure as Code is available in `requirements/REQ-INFRA-01-aws-ecs-deployment.md`

### Manual Deployment

1. Build images:
   ```bash
   docker-compose build
   ```

2. Push to registry:
   ```bash
   docker tag <image> <registry>/<image>:tag
   docker push <registry>/<image>:tag
   ```

3. Deploy to your platform of choice

## 🛠️ Data Collection

To update country statistics with fresh data:

```bash
cd backend/scripts
npm install
node collect-country-statistics.js
```

This will:
- Fetch latest data from public APIs
- Update `backend/src/data/country-statistics.json`
- Preserve manual adjustments in question weights

## 🤝 Contributing

1. Follow existing code style
2. Write tests for new features
3. Update documentation
4. Test on multiple browsers
5. Ensure Docker builds succeed
6. Run `npm test` before committing

## 📄 License

MIT

## 🎉 Acknowledgments

Built with ❤️ using real-world statistical data and Bayesian inference. Not a medical tool - use proper measuring equipment for accurate height measurements!

### Key Technologies
- Bayesian Inference for probability updates
- Information Gain (Entropy Reduction) for question selection
- Multi-attribute simultaneous tracking
- Real-world statistical data from 20+ countries