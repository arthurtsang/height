import React from 'react';
import useQuiz from './hooks/useQuiz';
import WelcomeScreen from './components/WelcomeScreen/WelcomeScreen';
import QuestionScreen from './components/QuestionScreen/QuestionScreen';
import ResultScreen from './components/ResultScreen/ResultScreen';
import './App.css';

function App() {
  const {
    screen,
    currentQuestion,
    progress,
    confidenceBreakdown,
    hints,
    result,
    error,
    isLoading,
    startQuiz,
    submitAnswer,
    restartQuiz
  } = useQuiz();

  return (
    <div className="app">
      <div className="container">
        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{error}</span>
          </div>
        )}

        {screen === 'welcome' && (
          <WelcomeScreen onStart={startQuiz} isLoading={isLoading} />
        )}

        {screen === 'question' && (
          <QuestionScreen
            question={currentQuestion}
            progress={progress}
            confidenceBreakdown={confidenceBreakdown}
            hints={hints}
            onAnswer={submitAnswer}
            isLoading={isLoading}
          />
        )}

        {screen === 'result' && (
          <ResultScreen result={result} onRestart={restartQuiz} />
        )}
      </div>

      <footer className="app-footer">
        <p>Made with ❤️ for fun • Not a medical tool</p>
      </footer>
    </div>
  );
}

export default App;

// Made with Bob
