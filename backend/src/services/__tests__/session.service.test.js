const sessionService = require('../session.service');
const redisService = require('../redis.service');

// Mock only Redis service, use real question service
jest.mock('../redis.service');

describe('sessionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    test('should create a new session with question IDs', async () => {
      redisService.set.mockResolvedValue(true);

      const result = await sessionService.createSession();

      expect(result).toHaveProperty('session_id');
      expect(result).toHaveProperty('question');
      expect(result).toHaveProperty('progress');
      expect(result.progress.current).toBe(1);
      expect(result.progress.total).toBeGreaterThan(0);
      expect(redisService.set).toHaveBeenCalled();
    });

    test('should store session data in Redis', async () => {
      redisService.set.mockResolvedValue(true);

      await sessionService.createSession();

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('session:'),
        expect.objectContaining({
          questionIds: expect.any(Array),
          answers: [],
          currentQuestionIndex: 0,
          completed: false
        })
      );
    });
  });

  describe('submitAnswer', () => {
    test('should submit answer and return next question', async () => {
      const sessionId = 'test-session-id';
      const mockSessionData = {
        questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
        answers: [],
        currentQuestionIndex: 0,
        completed: false
      };

      redisService.get.mockResolvedValue(mockSessionData);
      redisService.set.mockResolvedValue(true);

      const result = await sessionService.submitAnswer(sessionId, 'q1', 'opt1');

      expect(result.completed).toBe(false);
      expect(result.next_question).toBeDefined();
      expect(result.progress.current).toBe(2);
      expect(result.progress.total).toBe(7);
    });

    test('should mark session as completed after last question', async () => {
      const sessionId = 'test-session-id';
      const mockSessionData = {
        questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
        answers: [
          { questionId: 'q1', answerId: 'opt1', baseHeight: 175, score: 0 },
          { questionId: 'q2', answerId: 'opt2', score: 5 },
          { questionId: 'q3', answerId: 'opt1', score: -3 },
          { questionId: 'q4', answerId: 'opt3', score: 2 },
          { questionId: 'q5', answerId: 'opt2', score: 0 },
          { questionId: 'q6', answerId: 'opt1', score: 4 }
        ],
        currentQuestionIndex: 6,
        completed: false
      };

      redisService.get.mockResolvedValue(mockSessionData);
      redisService.set.mockResolvedValue(true);

      const result = await sessionService.submitAnswer(sessionId, 'q7', 'opt2');

      expect(result.completed).toBe(true);
      expect(result.message).toBeDefined();
      expect(redisService.set).toHaveBeenCalledWith(
        `session:${sessionId}`,
        expect.objectContaining({
          completed: true,
          completedAt: expect.any(String)
        })
      );
    });

    test('should throw error for non-existent session', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(
        sessionService.submitAnswer('invalid-session', 'q1', 'opt1')
      ).rejects.toThrow('Session not found or expired');
    });

    test('should throw error for already completed session', async () => {
      const mockSessionData = {
        questionIds: ['q1', 'q2'],
        answers: [],
        currentQuestionIndex: 0,
        completed: true
      };

      redisService.get.mockResolvedValue(mockSessionData);

      await expect(
        sessionService.submitAnswer('test-session', 'q1', 'opt1')
      ).rejects.toThrow('Session already completed');
    });

    test('should throw error for invalid question', async () => {
      const mockSessionData = {
        questionIds: ['q1', 'q2', 'q3'],
        answers: [],
        currentQuestionIndex: 0,
        completed: false
      };

      redisService.get.mockResolvedValue(mockSessionData);

      await expect(
        sessionService.submitAnswer('test-session', 'q2', 'opt1')
      ).rejects.toThrow('Invalid question for current session state');
    });
  });

  describe('getResult', () => {
    test('should return calculated height result', async () => {
      const sessionId = 'test-session-id';
      const mockSessionData = {
        questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'],
        answers: [
          { questionId: 'q1', answerId: 'opt1', baseHeight: 175, score: 0 },
          { questionId: 'q2', answerId: 'opt2', score: 5 },
          { questionId: 'q3', answerId: 'opt1', score: -3 },
          { questionId: 'q4', answerId: 'opt3', score: 2 },
          { questionId: 'q5', answerId: 'opt2', score: 0 },
          { questionId: 'q6', answerId: 'opt1', score: 4 },
          { questionId: 'q7', answerId: 'opt2', score: -2 }
        ],
        currentQuestionIndex: 7,
        completed: true
      };

      redisService.get.mockResolvedValue(mockSessionData);

      const result = await sessionService.getResult(sessionId);

      expect(result).toHaveProperty('height');
      expect(result.height).toHaveProperty('cm');
      expect(result.height).toHaveProperty('feet');
      expect(result.height).toHaveProperty('inches');
      expect(result.height).toHaveProperty('display');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('share_text');
    });

    test('should throw error for non-existent session', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(
        sessionService.getResult('invalid-session')
      ).rejects.toThrow('Session not found or expired');
    });

    test('should throw error for incomplete session', async () => {
      const mockSessionData = {
        questionIds: ['q1', 'q2'],
        answers: [],
        currentQuestionIndex: 0,
        completed: false
      };

      redisService.get.mockResolvedValue(mockSessionData);

      await expect(
        sessionService.getResult('test-session')
      ).rejects.toThrow('Session not completed yet');
    });
  });
});

// Made with Bob
