const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  async startSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  async submitAnswer(sessionId, questionId, answerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questionId, answerId })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  }

  async getResult(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/result`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting result:', error);
      throw error;
    }
  }
}

export default new ApiService();

// Made with Bob
