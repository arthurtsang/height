import './WelcomeScreen.css';

function WelcomeScreen({ onStart, loading }) {
  return (
    <div className="welcome-screen">
      <div className="header">
        <div className="emoji">📏</div>
        <h1>Height Guesser</h1>
        <p>Can we guess your height?</p>
      </div>

      <h2>Let's find out! 🎯</h2>

      <div className="features">
        <ul>
          <li>✨ Answer fun questions</li>
          <li>🎲 No measuring required</li>
          <li>🎉 Get instant results</li>
          <li>📱 Share with friends</li>
        </ul>
      </div>

      <button 
        className="start-button" 
        onClick={onStart}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Start Quiz'}
      </button>
    </div>
  );
}

export default WelcomeScreen;

// Made with Bob
