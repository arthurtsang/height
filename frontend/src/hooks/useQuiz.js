import { useState } from 'react';
import api from '../services/api';

export function useQuiz() {
  const [screen, setScreen] = useState('welcome');
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const startQuiz = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.startSession();
      setSessionId(data.session_id);
      setCurrentQuestion(data.question);
      const progressPercent = (data.progress.current / data.progress.total) * 100;
      setProgress(progressPercent);
      setScreen('question');
    } catch (err) {
      setError('Failed to start quiz. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async (answerId) => {
    if (!sessionId || !currentQuestion) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await api.submitAnswer(sessionId, currentQuestion.id, answerId);

      if (data.completed) {
        // Quiz is complete, fetch result
        const resultData = await api.getResult(sessionId);
        setResult(resultData);
        setScreen('result');
      } else {
        // More questions to go
        setCurrentQuestion(data.next_question);
        const progressPercent = (data.progress.current / data.progress.total) * 100;
        setProgress(progressPercent);
      }
    } catch (err) {
      setError('Failed to submit answer. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const restartQuiz = () => {
    setScreen('welcome');
    setSessionId(null);
    setCurrentQuestion(null);
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return {
    screen,
    sessionId,
    currentQuestion,
    progress,
    result,
    isLoading,
    error,
    startQuiz,
    submitAnswer,
    restartQuiz
  };
}

export default useQuiz;
