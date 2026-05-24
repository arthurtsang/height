# Height Quiz API

Backend API for the height prediction quiz application.

## Features

- RESTful API for quiz sessions
- Redis-based session management
- Smart height calculation based on indirect indicators
- Rate limiting and security
- Health check endpoint
- Docker support

## Prerequisites

- Node.js 18+
- Redis 7+
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Configuration

Edit `.env` file:

```env
NODE_ENV=development
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:5173
```

## Running Locally

### With Node.js

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### With Docker

```bash
# Build image
docker build -t height-quiz-api .

# Run container
docker run -p 3000:3000 \
  -e REDIS_HOST=host.docker.internal \
  height-quiz-api
```

### With Docker Compose

```bash
# From project root
docker-compose up
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Start Quiz Session
```
POST /api/session/start

Response:
{
  "session_id": "uuid",
  "question": {
    "id": "q1",
    "text": "What's your favorite type of cuisine?",
    "options": [...]
  },
  "progress": {
    "current": 1,
    "total": 10
  }
}
```

### Submit Answer
```
POST /api/session/:sessionId/answer

Body:
{
  "questionId": "q1",
  "answerId": "opt1"
}

Response:
{
  "completed": false,
  "next_question": {...},
  "progress": {...}
}
```

### Get Result
```
GET /api/session/:sessionId/result

Response:
{
  "height": {
    "cm": 175,
    "feet": 5,
    "inches": 9,
    "display": "5'9\""
  },
  "message": "You're right in the sweet spot! 🎯",
  "share_text": "I'm 5'9\" according to this height quiz!"
}
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Helper functions
│   ├── data/            # Question bank
│   ├── app.js           # Express app
│   └── index.js         # Entry point
├── tests/               # Test files
├── Dockerfile           # Docker configuration
└── package.json         # Dependencies
```

## Development

### Code Style

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Adding New Questions

Edit `src/data/questions.json` and restart the server.

## Deployment

See `requirements/REQ-INFRA-01-aws-ecs-deployment.md` for deployment instructions.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3000 |
| REDIS_HOST | Redis hostname | localhost |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | (none) |
| CORS_ORIGIN | Allowed origin | http://localhost:5173 |
| LOG_LEVEL | Logging level | info |

## Troubleshooting

### Redis Connection Failed

Ensure Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

### Port Already in Use

Change PORT in `.env` or kill the process:
```bash
lsof -ti:3000 | xargs kill
```

## License

MIT