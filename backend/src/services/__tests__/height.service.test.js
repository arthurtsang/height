const heightService = require('../height.service');

describe('heightService', () => {
  describe('calculateHeight', () => {
    test('should calculate height with base height and adjustments', () => {
      const answers = [
        { baseHeight: 175, score: 0 }, // nationality question
        { score: 5 },  // physical indicator
        { score: -3 }, // social indicator
        { score: 2 },  // shopping
        { score: 0 },  // fun question
        { score: 4 },  // vehicle
        { score: -2 }  // furniture
      ];

      const result = heightService.calculateHeight(answers);
      
      // Base height 175 + adjustments (5-3+2+0+4-2 = 6) + random (-3 to +3)
      // Result is just a number (cm), not an object
      expect(result).toBeGreaterThanOrEqual(175 + 6 - 3);
      expect(result).toBeLessThanOrEqual(175 + 6 + 3);
      expect(typeof result).toBe('number');
    });

    test('should clamp height to minimum 147cm', () => {
      const answers = [
        { baseHeight: 150, score: 0 },
        { score: -20 },
        { score: -20 },
        { score: -20 },
        { score: -20 },
        { score: -20 },
        { score: -20 }
      ];

      const result = heightService.calculateHeight(answers);
      expect(result).toBeGreaterThanOrEqual(147);
    });

    test('should clamp height to maximum 208cm', () => {
      const answers = [
        { baseHeight: 183, score: 0 },
        { score: 20 },
        { score: 20 },
        { score: 20 },
        { score: 20 },
        { score: 20 },
        { score: 20 }
      ];

      const result = heightService.calculateHeight(answers);
      expect(result).toBeLessThanOrEqual(208);
    });

    test('should handle answers with only base height', () => {
      const answers = [
        { baseHeight: 170, score: 0 }
      ];

      const result = heightService.calculateHeight(answers);
      expect(result).toBeGreaterThanOrEqual(167); // 170 - 3
      expect(result).toBeLessThanOrEqual(173); // 170 + 3
    });

    test('should sum all adjustment scores correctly', () => {
      const answers = [
        { baseHeight: 175, score: 0 },
        { score: 10 },
        { score: -5 },
        { score: 3 },
        { score: -2 },
        { score: 4 },
        { score: 0 }
      ];

      const result = heightService.calculateHeight(answers);
      // Total adjustments: 10-5+3-2+4 = 10
      // Expected range: 175 + 10 - 3 to 175 + 10 + 3 = 182 to 188
      expect(result).toBeGreaterThanOrEqual(182);
      expect(result).toBeLessThanOrEqual(188);
    });
  });

  describe('generateMessage', () => {
    test('should return message for tall height >= 185cm', () => {
      const message = heightService.generateMessage(190);
      expect(message).toBeTruthy();
      expect(typeof message).toBe('string');
    });

    test('should return message for average height 165-184cm', () => {
      const message = heightService.generateMessage(175);
      expect(message).toBeTruthy();
      expect(typeof message).toBe('string');
    });

    test('should return message for short height < 165cm', () => {
      const message = heightService.generateMessage(160);
      expect(message).toBeTruthy();
      expect(typeof message).toBe('string');
    });

    test('should return message for edge case at 185cm', () => {
      const message = heightService.generateMessage(185);
      expect(message).toBeTruthy();
    });

    test('should return message for edge case at 165cm', () => {
      const message = heightService.generateMessage(165);
      expect(message).toBeTruthy();
    });
  });

  describe('getHeightCategory', () => {
    test('should categorize heights correctly', () => {
      expect(heightService.getHeightCategory(150)).toBe('petite');
      expect(heightService.getHeightCategory(160)).toBe('below average');
      expect(heightService.getHeightCategory(170)).toBe('average');
      expect(heightService.getHeightCategory(180)).toBe('above average');
      expect(heightService.getHeightCategory(190)).toBe('tall');
    });
  });
});

// Made with Bob
