import React from 'react';
import './QuestionScreen.css';

const QuestionScreen = ({ question, progress, onAnswer, isLoading }) => {
  if (!question) return null;

  return (
    <div className="question-screen">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="question-content">
        <div className="question-number">
          Question {question.questionNumber} of 10
        </div>
        
        <h2 className="question-text">{question.text}</h2>

        <div className="options">
          {question.options.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => onAnswer(option.id)}
              disabled={isLoading}
            >
              <span className="option-emoji">{option.emoji || '•'}</span>
              <span className="option-text">{option.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="question-footer">
        <p className="hint">Choose the option that best describes you</p>
      </div>
    </div>
  );
};

export default QuestionScreen;

// Made with Bob
