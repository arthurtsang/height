const questionService = require('../question.service');

describe('questionService', () => {
  describe('selectQuestionsForSession', () => {
    test('should return array of question IDs', () => {
      const questions = questionService.selectQuestionsForSession();
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
    });

    test('should return unique question IDs', () => {
      const questions = questionService.selectQuestionsForSession();
      const uniqueQuestions = new Set(questions);
      expect(uniqueQuestions.size).toBe(questions.length);
    });

    test('should return different questions on multiple calls', () => {
      const questions1 = questionService.selectQuestionsForSession();
      const questions2 = questionService.selectQuestionsForSession();
      
      // At least some questions should be different (not guaranteed all different due to randomness)
      const allSame = questions1.every((q, i) => q === questions2[i]);
      expect(allSame).toBe(false);
    });
  });

  describe('getQuestionById', () => {
    test('should return question for valid ID', () => {
      const question = questionService.getQuestionById('q1');
      expect(question).toBeDefined();
      expect(question.id).toBe('q1');
      expect(question.text).toBeDefined();
      expect(question.options).toBeDefined();
    });

    test('should throw error for invalid ID', () => {
      expect(() => {
        questionService.getQuestionById('invalid_id');
      }).toThrow('Question not found');
    });

    test('should return question with all required fields', () => {
      const question = questionService.getQuestionById('q2');
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('text');
      expect(question).toHaveProperty('category');
      expect(question).toHaveProperty('options');
      expect(Array.isArray(question.options)).toBe(true);
    });
  });

  describe('getAnswerDetails', () => {
    test('should return answer details with score for physical indicator', () => {
      const answer = questionService.getAnswerDetails('q2', 'opt1');
      expect(answer).toBeDefined();
      expect(answer.questionId).toBe('q2');
      expect(answer.answerId).toBe('opt1');
      expect(answer.score).toBeDefined();
      expect(typeof answer.score).toBe('number');
    });

    test('should return answer details with baseHeight for nationality question', () => {
      const answer = questionService.getAnswerDetails('q1', 'opt1');
      expect(answer).toBeDefined();
      expect(answer.questionId).toBe('q1');
      expect(answer.answerId).toBe('opt1');
      expect(answer.baseHeight).toBeDefined();
      expect(typeof answer.baseHeight).toBe('number');
    });

    test('should throw error for invalid question ID', () => {
      expect(() => {
        questionService.getAnswerDetails('invalid_q', 'opt1');
      }).toThrow('Question not found');
    });

    test('should throw error for invalid answer ID', () => {
      expect(() => {
        questionService.getAnswerDetails('q2', 'invalid_opt');
      }).toThrow('Answer not found');
    });

    test('should return correct score for different options', () => {
      const answer1 = questionService.getAnswerDetails('q2', 'opt1');
      const answer2 = questionService.getAnswerDetails('q2', 'opt4');
      
      // Different options should have different scores
      expect(answer1.score).not.toBe(answer2.score);
    });
  });

  describe('formatQuestionForResponse', () => {
    test('should format question without scores/baseHeight', () => {
      const question = questionService.getQuestionById('q2');
      const formatted = questionService.formatQuestionForResponse(question);
      
      expect(formatted.id).toBe(question.id);
      expect(formatted.text).toBe(question.text);
      expect(formatted.category).toBe(question.category);
      expect(formatted.options).toBeDefined();
      
      // Check that scores are removed from options
      formatted.options.forEach(option => {
        expect(option).not.toHaveProperty('score');
        expect(option).not.toHaveProperty('baseHeight');
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('text');
      });
    });

    test('should format nationality question without baseHeight', () => {
      const question = questionService.getQuestionById('q1');
      const formatted = questionService.formatQuestionForResponse(question);
      
      formatted.options.forEach(option => {
        expect(option).not.toHaveProperty('baseHeight');
        expect(option).toHaveProperty('id');
        expect(option).toHaveProperty('text');
      });
    });

    test('should preserve question structure', () => {
      const question = questionService.getQuestionById('q3');
      const formatted = questionService.formatQuestionForResponse(question);
      
      expect(formatted.id).toBe(question.id);
      expect(formatted.text).toBe(question.text);
      expect(formatted.category).toBe(question.category);
      expect(formatted.options.length).toBe(question.options.length);
    });
  });

  describe('getTotalQuestions', () => {
    test('should return total number of questions', () => {
      const total = questionService.getTotalQuestions();
      expect(typeof total).toBe('number');
      expect(total).toBeGreaterThan(0);
    });
  });
});

// Made with Bob
