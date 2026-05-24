const heightConverter = require('../heightConverter');

describe('heightConverter', () => {
  describe('cmToFeetInches', () => {
    test('should convert 172cm to 5 feet 8 inches', () => {
      const result = heightConverter.cmToFeetInches(172);
      expect(result.feet).toBe(5);
      expect(result.inches).toBe(8);
    });

    test('should convert 183cm to 6 feet 0 inches', () => {
      const result = heightConverter.cmToFeetInches(183);
      expect(result.feet).toBe(6);
      expect(result.inches).toBe(0);
    });

    test('should convert 157cm to 5 feet 2 inches', () => {
      const result = heightConverter.cmToFeetInches(157);
      expect(result.feet).toBe(5);
      expect(result.inches).toBe(2);
    });

    test('should convert 200cm to 6 feet 7 inches', () => {
      const result = heightConverter.cmToFeetInches(200);
      expect(result.feet).toBe(6);
      expect(result.inches).toBe(7);
    });

    test('should handle edge case of 0cm', () => {
      const result = heightConverter.cmToFeetInches(0);
      expect(result.feet).toBe(0);
      expect(result.inches).toBe(0);
    });

    test('should round inches to nearest whole number', () => {
      const result = heightConverter.cmToFeetInches(175);
      expect(result.feet).toBe(5);
      expect(result.inches).toBe(9);
    });
  });

  describe('formatHeight', () => {
    test('should format height with cm and imperial', () => {
      const result = heightConverter.formatHeight(172);
      expect(result.cm).toBe(172);
      expect(result.feet).toBe(5);
      expect(result.inches).toBe(8);
      expect(result.display).toBe('5\'8"');
    });

    test('should format height for 6 feet exactly', () => {
      const result = heightConverter.formatHeight(183);
      expect(result.cm).toBe(183);
      expect(result.feet).toBe(6);
      expect(result.inches).toBe(0);
      expect(result.display).toBe('6\'0"');
    });

    test('should format height for very tall person', () => {
      const result = heightConverter.formatHeight(208);
      expect(result.cm).toBe(208);
      expect(result.feet).toBe(6);
      expect(result.inches).toBe(10);
      expect(result.display).toBe('6\'10"');
    });

    test('should format height for shorter person', () => {
      const result = heightConverter.formatHeight(147);
      expect(result.cm).toBe(147);
      expect(result.feet).toBe(4);
      expect(result.inches).toBe(10);
      expect(result.display).toBe('4\'10"');
    });
  });
});

// Made with Bob
