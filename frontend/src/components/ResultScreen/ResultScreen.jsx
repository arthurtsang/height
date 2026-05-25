import React, { useState, useEffect } from 'react';
import './ResultScreen.css';

const ResultScreen = ({ result, onRestart }) => {
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFunFacts, setShowFunFacts] = useState(false);

  useEffect(() => {
    // Animate result reveal
    const timer = setTimeout(() => setShowResult(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = async () => {
    const shareText = result.share_text || `I just discovered my height using the Height Prediction Quiz! 📏✨`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Height Prediction Quiz',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (!result) return null;

  return (
    <div className="result-screen">
      <div className="result-header">
        <div className="result-emoji">🎉</div>
        <h1>Your Height Prediction</h1>
        <p>Based on your answers, we predict you are...</p>
      </div>

      <div className={`result-reveal ${showResult ? 'show' : ''}`}>
        <div className="height-display">
          <div className="height-metric">
            <span className="height-value">{result.height?.cm}</span>
            <span className="height-unit">cm</span>
          </div>
          <div className="height-divider">or</div>
          <div className="height-imperial">
            <span className="height-value">{result.height?.display}</span>
          </div>
        </div>

        {result.message && (
          <div className="result-message">
            <p>{result.message}</p>
          </div>
        )}
        
        {result.nationality && result.confidence && result.relativeHeight && (
          <div className="confidence-message">
            <p>
              🎯 I'm <strong>{result.confidence}% confident</strong> you're{' '}
              <strong>{result.relativeHeight}</strong> height for a{' '}
              <strong>{result.nationality}</strong>!
            </p>
          </div>
        )}
        
        {result.demographics && (
          <div className="demographics-info">
            <p>
              Detected: <strong>{result.demographics.sex}</strong> • <strong>{result.demographics.ageGroup}</strong>
            </p>
          </div>
        )}
      </div>

      {result.funFacts && result.funFacts.length > 0 && (
        <div className="fun-facts-section">
          <button
            className="fun-facts-toggle"
            onClick={() => setShowFunFacts(!showFunFacts)}
          >
            <span className="toggle-icon">{showFunFacts ? '▼' : '▶'}</span>
            <span className="toggle-text">How we figured it out</span>
            <span className="fun-icon">🔍</span>
          </button>
          
          {showFunFacts && (
            <div className="fun-facts-content">
              <ul className="fun-facts-list">
                {result.funFacts.map((fact, index) => (
                  <li key={index} className="fun-fact-item">
                    <span className="fact-bullet">💡</span>
                    <span className="fact-text">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="result-actions">
        <button className="share-button" onClick={handleShare}>
          {copied ? '✓ Copied!' : '📤 Share Result'}
        </button>
        <button className="restart-button" onClick={onRestart}>
          🔄 Try Again
        </button>
      </div>

      <div className="result-footer">
        <p className="disclaimer">
          This is a fun prediction based on indirect indicators. 
          For accurate measurements, please use proper measuring tools! 📏
        </p>
      </div>
    </div>
  );
};

export default ResultScreen;

// Made with Bob
