import React from 'react';
import './QuestionScreen.css';

const QuestionScreen = ({ question, progress, confidenceBreakdown, hints, onAnswer, isLoading }) => {
  if (!question) return null;

  // Generate smart hints based on confidence levels and determined values
  const generateHintText = () => {
    if (!confidenceBreakdown || !hints) return null;
    
    const { nationality, sex, age } = confidenceBreakdown;
    const { nationality: countryCode, sex: determinedSex, ageGroup } = hints;
    
    const countryNames = {
      US: 'American', GB: 'British', JP: 'Japanese', CN: 'Chinese',
      IN: 'Indian', DE: 'German', FR: 'French', IT: 'Italian',
      ES: 'Spanish', BR: 'Brazilian', MX: 'Mexican', CA: 'Canadian',
      AU: 'Australian', NL: 'Dutch', SE: 'Swedish', NO: 'Norwegian',
      RU: 'Russian', TR: 'Turkish', KR: 'Korean', PL: 'Polish'
    };
    
    const ageMap = {
      child: 'a kid',
      teen: 'a teenager',
      adult: 'an adult',
      senior: 'a senior'
    };
    
    const parts = [];
    
    // Nationality hint (show at 70%+)
    if (nationality >= 70 && countryCode) {
      const countryName = countryNames[countryCode] || countryCode;
      const confidence = nationality >= 90 ? "I'm pretty sure" : "Looks like";
      parts.push(`${confidence} you're ${countryName}`);
    }
    
    // Demographics hints (show at 70%+)
    const demographics = [];
    if (age >= 70 && ageGroup) {
      demographics.push(ageMap[ageGroup] || ageGroup);
    }
    if (sex >= 70 && determinedSex) {
      demographics.push(determinedSex);
    }
    
    if (demographics.length > 0 && parts.length > 0) {
      parts[0] += ` ${demographics.join(' ')}`;
    }
    
    return parts.length > 0 ? parts.join(' ') : null;
  };

  const hintText = generateHintText();

  return (
    <div className="question-screen">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.max(progress, 10)}%` }}>
          <span className="progress-text">
            {progress < 30 ? `Question ${question.questionNumber || 1}` : `${Math.round(progress)}%`}
          </span>
        </div>
      </div>
      
      {hintText && (
        <div className="smart-hint">
          <span className="hint-icon">🤔</span>
          <span className="hint-text">{hintText}</span>
        </div>
      )}

      <div className="question-content">
        <div className="question-number">
          Question {question.questionNumber}
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
