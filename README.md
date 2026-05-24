# Height Prediction Quiz

A fun, interactive web application that predicts your height based on seemingly random questions about your preferences and lifestyle. The app uses indirect cultural and physical indicators to make surprisingly accurate height estimations.

## 🎯 Features

- **10 Clever Questions**: Uses indirect indicators like cuisine preferences, sports interests, and lifestyle habits
- **Real-time Progress**: Visual progress bar showing quiz completion
- **Height Prediction**: Estimates height in both metric (cm) and imperial (ft/in) units
- **Confidence Score**: Shows prediction confidence level
- **Share Results**: Native share functionality or clipboard copy
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Beautiful UI**: Smooth animations and gradient backgrounds

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js 18+ with Express
- Redis for session management
- RESTful API design
- Rate limiting and security middleware

**Frontend:**
- React 18 with Vite
- Custom hooks for state management
- Axios for API communication
- CSS3 with animations

**Infrastructure:**
- Docker & Docker Compose
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
   cd protein-mastermind
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
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   ├── config/         # Configuration
│   │   └── data/           # Question bank
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API client
│   │   └── utils/         # Helper functions
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── requirements/          # Product requirements
├── designs/              # Architecture & design docs
├── docker-compose.yml    # Multi-container orchestration
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
SESSION_TTL=3600
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
Response: { status: 'ok', timestamp: '...' }
```

### Start Quiz Session
```
POST /api/session/start
Response: { sessionId: '...', question: {...} }
```

### Submit Answer
```
POST /api/session/answer
Body: { sessionId: '...', answer: '...' }
Response: { question: {...} } or { result: {...} }
```

### Get Result
```
GET /api/session/result/:sessionId
Response: { heightCm: 175, heightFt: "5'9\"", confidence: "85%" }
```

## 🎨 How It Works

### Height Estimation Algorithm

1. **Cultural Indicators** (Questions 1-3)
   - Cuisine preferences → Infer nationality
   - Sports interests → Regional patterns
   - Breakfast styles → Cultural background
   - Maps to base height ranges by region

2. **Physical Proxies** (Questions 4-10)
   - Airplane legroom comfort
   - Doorway clearance
   - Furniture fit
   - Clothing sizes
   - Adjusts base height ±15cm

3. **Final Calculation**
   - Base height from cultural indicators
   - Adjustments from physical proxies
   - Random variation (±3cm) for realism
   - Clamped to realistic range (147-208cm / 4'10"-6'10")

## 🐳 Docker Services

### Redis
- Image: `redis:7-alpine`
- Port: 6379
- Persistent storage with volume

### Backend
- Built from `./backend/Dockerfile`
- Port: 3000
- Health checks enabled
- Auto-restart on failure

### Frontend
- Built from `./frontend/Dockerfile`
- Port: 5173 (mapped to 80 in container)
- Nginx serving static files
- Health checks enabled

## 📝 Requirements & Design

- **Requirements**: See `requirements/` directory
  - REQ-API-01: Backend API requirements
  - REQ-UI-01: Frontend requirements
  - REQ-INFRA-01: Infrastructure requirements

- **Design Documents**: See `designs/` directory
  - SAD-001: Solution Architecture
  - ADD-001: Code Structure
  - Question Bank: 50-question database

## 🔒 Security Features

- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation
- Session expiration (1 hour)
- No PII collection

## 🚢 Deployment

### AWS ECS (Terraform)

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

## 🤝 Contributing

1. Follow existing code style
2. Write tests for new features
3. Update documentation
4. Test on multiple browsers
5. Ensure Docker builds succeed

## 📄 License

MIT

## 🎉 Acknowledgments

Built with ❤️ for fun. Not a medical tool - use proper measuring equipment for accurate height measurements!