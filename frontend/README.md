# Height Prediction Quiz - Frontend

A fun, interactive web application that predicts your height based on seemingly random questions about your preferences and lifestyle.

## Features

- 🎯 10 carefully crafted questions using indirect indicators
- 📊 Real-time progress tracking
- 🎨 Beautiful, responsive UI with smooth animations
- 📱 Mobile-friendly design
- 🔄 Session-based quiz flow
- 📤 Share results functionality

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Styling with animations
- **Axios** - HTTP client for API communication

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see `../backend/README.md`)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── WelcomeScreen/   # Landing page
│   │   ├── QuestionScreen/  # Quiz questions
│   │   └── ResultScreen/    # Height prediction result
│   ├── hooks/               # Custom React hooks
│   │   └── useQuiz.js       # Quiz state management
│   ├── services/            # API services
│   │   └── api.js           # Backend API client
│   ├── App.jsx              # Main app component
│   ├── App.css              # App-level styles
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies
```

## How It Works

### Quiz Flow

1. **Welcome Screen**: User starts the quiz
2. **Question Screen**: User answers 10 questions with progress tracking
3. **Result Screen**: Height prediction is displayed with confidence level

### State Management

The `useQuiz` custom hook manages the entire quiz state:

```javascript
const {
  screen,           // Current screen: 'welcome' | 'question' | 'result'
  currentQuestion,  // Current question data
  progress,         // Progress percentage (0-100)
  result,          // Final height prediction
  error,           // Error message if any
  isLoading,       // Loading state
  startQuiz,       // Start new quiz session
  submitAnswer,    // Submit answer and get next question
  restartQuiz      // Reset and start over
} = useQuiz();
```

### API Integration

The frontend communicates with the backend API through three endpoints:

- `POST /api/session/start` - Start new quiz session
- `POST /api/session/answer` - Submit answer and get next question
- `GET /api/session/result/:sessionId` - Get final height prediction

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000` |
| `VITE_ENV` | Environment name | `development` |

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Responsive Design

The application is fully responsive with breakpoints at:
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## Accessibility

- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast compliance

## Troubleshooting

### API Connection Issues

If you see "Failed to connect to server":
1. Ensure backend is running on the correct port
2. Check `VITE_API_URL` in `.env`
3. Verify CORS is enabled in backend

### Build Errors

If build fails:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Clear Vite cache: `rm -rf node_modules/.vite`

## Contributing

1. Follow the existing code style
2. Test on multiple browsers
3. Ensure responsive design works
4. Update documentation as needed

## License

MIT