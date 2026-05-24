/**
 * Tests for Inference Service
 * 
 * Tests Bayesian inference, information gain calculation,
 * and question selection algorithms.
 */

const inferenceService = require('../inference.service');

describe('InferenceService', () => {
  describe('initializeUniformDistribution', () => {
    test('creates uniform distribution for given countries', () => {
      const countries = ['US', 'GB', 'JP'];
      const distribution = inferenceService.initializeUniformDistribution(countries);
      
      expect(Object.keys(distribution)).toHaveLength(3);
      expect(distribution.US).toBeCloseTo(1/3, 5);
      expect(distribution.GB).toBeCloseTo(1/3, 5);
      expect(distribution.JP).toBeCloseTo(1/3, 5);
    });

    test('probabilities sum to 1.0', () => {
      const countries = ['US', 'GB', 'JP', 'CN', 'IN'];
      const distribution = inferenceService.initializeUniformDistribution(countries);
      
      const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
    });
  });

  describe('bayesianUpdate', () => {
    test('updates probabilities based on country weights', () => {
      const currentDist = {
        'US': 0.33,
        'GB': 0.33,
        'JP': 0.34
      };
      
      const countryWeights = {
        'US': 0.28,  // Pizza popular in US
        'GB': 0.20,
        'JP': 0.05   // Pizza less popular in Japan
      };
      
      const newDist = inferenceService.bayesianUpdate(currentDist, countryWeights);
      
      // US should have higher probability now
      expect(newDist.US).toBeGreaterThan(currentDist.US);
      // JP should have lower probability
      expect(newDist.JP).toBeLessThan(currentDist.JP);
    });

    test('probabilities sum to 1.0 after update', () => {
      const currentDist = {
        'US': 0.5,
        'GB': 0.3,
        'JP': 0.2
      };
      
      const countryWeights = {
        'US': 0.40,
        'GB': 0.30,
        'JP': 0.10
      };
      
      const newDist = inferenceService.bayesianUpdate(currentDist, countryWeights);
      const sum = Object.values(newDist).reduce((a, b) => a + b, 0);
      
      expect(sum).toBeCloseTo(1.0, 10);
    });

    test('handles missing country weights with default', () => {
      const currentDist = {
        'US': 0.5,
        'GB': 0.5
      };
      
      const countryWeights = {
        'US': 0.40
        // GB missing - should use default 0.01
      };
      
      const newDist = inferenceService.bayesianUpdate(currentDist, countryWeights);
      
      // Should still work and sum to 1.0
      const sum = Object.values(newDist).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 10);
      
      // US should have much higher probability due to GB's low default
      expect(newDist.US).toBeGreaterThan(0.9);
    });

    test('consistent answers increase confidence', () => {
      let dist = inferenceService.initializeUniformDistribution(['US', 'GB', 'JP', 'CN']);
      
      // Simulate multiple US-favoring answers
      const usAnswers = [
        { 'US': 0.85, 'GB': 0.65, 'JP': 0.25, 'CN': 0.20 },  // Car transport
        { 'US': 0.37, 'GB': 0.05, 'JP': 0.02, 'CN': 0.02 },  // Football
        { 'US': 0.28, 'GB': 0.20, 'JP': 0.05, 'CN': 0.03 }   // Pizza
      ];
      
      for (const weights of usAnswers) {
        dist = inferenceService.bayesianUpdate(dist, weights);
      }
      
      // US should have very high probability
      expect(dist.US).toBeGreaterThan(0.80);
      expect(dist.US).toBeGreaterThan(dist.GB);
      expect(dist.US).toBeGreaterThan(dist.JP);
      expect(dist.US).toBeGreaterThan(dist.CN);
    });
  });

  describe('calculateEntropy', () => {
    test('uniform distribution has maximum entropy', () => {
      const uniformDist = {
        'US': 0.25,
        'GB': 0.25,
        'JP': 0.25,
        'CN': 0.25
      };
      
      const entropy = inferenceService.calculateEntropy(uniformDist);
      
      // Maximum entropy for 4 options = log2(4) = 2
      expect(entropy).toBeCloseTo(2.0, 5);
    });

    test('certain distribution has zero entropy', () => {
      const certainDist = {
        'US': 1.0,
        'GB': 0.0,
        'JP': 0.0,
        'CN': 0.0
      };
      
      const entropy = inferenceService.calculateEntropy(certainDist);
      
      expect(entropy).toBeCloseTo(0.0, 5);
    });

    test('entropy decreases as certainty increases', () => {
      const dist1 = { 'US': 0.25, 'GB': 0.25, 'JP': 0.25, 'CN': 0.25 };
      const dist2 = { 'US': 0.50, 'GB': 0.20, 'JP': 0.20, 'CN': 0.10 };
      const dist3 = { 'US': 0.80, 'GB': 0.10, 'JP': 0.05, 'CN': 0.05 };
      
      const entropy1 = inferenceService.calculateEntropy(dist1);
      const entropy2 = inferenceService.calculateEntropy(dist2);
      const entropy3 = inferenceService.calculateEntropy(dist3);
      
      expect(entropy1).toBeGreaterThan(entropy2);
      expect(entropy2).toBeGreaterThan(entropy3);
    });
  });

  describe('calculateInformationGain', () => {
    test('calculates positive information gain for discriminating question', () => {
      const currentDist = {
        'US': 0.4,
        'GB': 0.3,
        'JP': 0.3
      };
      
      const question = {
        id: 'q1',
        options: [
          {
            id: 'opt1',
            text: 'Pizza',
            countryWeights: { 'US': 0.28, 'GB': 0.20, 'JP': 0.05 }
          },
          {
            id: 'opt2',
            text: 'Noodles',
            countryWeights: { 'US': 0.04, 'GB': 0.08, 'JP': 0.35 }
          }
        ]
      };
      
      const ig = inferenceService.calculateInformationGain(question, currentDist);
      
      // Should have positive information gain
      expect(ig).toBeGreaterThan(0);
    });

    test('information gain is zero for certain distribution', () => {
      const certainDist = {
        'US': 1.0,
        'GB': 0.0,
        'JP': 0.0
      };
      
      const question = {
        id: 'q1',
        options: [
          {
            id: 'opt1',
            countryWeights: { 'US': 0.28, 'GB': 0.20, 'JP': 0.05 }
          }
        ]
      };
      
      const ig = inferenceService.calculateInformationGain(question, certainDist);
      
      // No information gain when already certain
      expect(ig).toBeCloseTo(0, 1);
    });

    test('high-discriminating questions have higher IG', () => {
      const currentDist = {
        'US': 0.5,
        'JP': 0.5
      };
      
      // High discrimination: very different weights
      const highDiscrimQ = {
        id: 'q1',
        options: [
          { id: 'opt1', countryWeights: { 'US': 0.85, 'JP': 0.25 } },
          { id: 'opt2', countryWeights: { 'US': 0.15, 'JP': 0.75 } }
        ]
      };
      
      // Low discrimination: similar weights
      const lowDiscrimQ = {
        id: 'q2',
        options: [
          { id: 'opt1', countryWeights: { 'US': 0.50, 'JP': 0.48 } },
          { id: 'opt2', countryWeights: { 'US': 0.50, 'JP': 0.52 } }
        ]
      };
      
      const highIG = inferenceService.calculateInformationGain(highDiscrimQ, currentDist);
      const lowIG = inferenceService.calculateInformationGain(lowDiscrimQ, currentDist);
      
      expect(highIG).toBeGreaterThan(lowIG);
    });
  });

  describe('getConfidence', () => {
    test('returns maximum probability', () => {
      const dist = {
        'US': 0.70,
        'GB': 0.20,
        'JP': 0.10
      };
      
      const confidence = inferenceService.getConfidence(dist);
      
      expect(confidence).toBe(0.70);
    });

    test('returns 1.0 for certain distribution', () => {
      const dist = {
        'US': 1.0,
        'GB': 0.0,
        'JP': 0.0
      };
      
      const confidence = inferenceService.getConfidence(dist);
      
      expect(confidence).toBe(1.0);
    });
  });

  describe('getTopCountries', () => {
    test('returns top N countries by probability', () => {
      const dist = {
        'US': 0.50,
        'GB': 0.30,
        'JP': 0.15,
        'CN': 0.05
      };
      
      const top3 = inferenceService.getTopCountries(dist, 3);
      
      expect(top3).toHaveLength(3);
      expect(top3[0].country).toBe('US');
      expect(top3[0].probability).toBe(0.50);
      expect(top3[1].country).toBe('GB');
      expect(top3[2].country).toBe('JP');
    });

    test('defaults to top 3 if N not specified', () => {
      const dist = {
        'US': 0.40,
        'GB': 0.30,
        'JP': 0.20,
        'CN': 0.10
      };
      
      const top = inferenceService.getTopCountries(dist);
      
      expect(top).toHaveLength(3);
    });
  });

  describe('getMostLikelyCountry', () => {
    test('returns country with highest probability', () => {
      const dist = {
        'US': 0.30,
        'GB': 0.50,
        'JP': 0.20
      };
      
      const mostLikely = inferenceService.getMostLikelyCountry(dist);
      
      expect(mostLikely).toBe('GB');
    });
  });

  describe('selectNextQuestion', () => {
    test('selects question with highest information gain', () => {
      const currentDist = {
        'US': 0.5,
        'JP': 0.5
      };
      
      const questions = [
        {
          id: 'q1',
          category: 'food',
          options: [
            { id: 'opt1', countryWeights: { 'US': 0.85, 'JP': 0.25 } },
            { id: 'opt2', countryWeights: { 'US': 0.15, 'JP': 0.75 } }
          ]
        },
        {
          id: 'q2',
          category: 'sports',
          options: [
            { id: 'opt1', countryWeights: { 'US': 0.50, 'JP': 0.48 } },
            { id: 'opt2', countryWeights: { 'US': 0.50, 'JP': 0.52 } }
          ]
        }
      ];
      
      const selected = inferenceService.selectNextQuestion(questions, currentDist);
      
      // Should select q1 (higher discrimination)
      expect(selected.id).toBe('q1');
    });

    test('avoids recently used categories', () => {
      const currentDist = {
        'US': 0.5,
        'JP': 0.5
      };
      
      const questions = [
        {
          id: 'q1',
          category: 'food',
          options: [
            { id: 'opt1', countryWeights: { 'US': 0.80, 'JP': 0.30 } }
          ]
        },
        {
          id: 'q2',
          category: 'sports',
          options: [
            { id: 'opt1', countryWeights: { 'US': 0.75, 'JP': 0.35 } }
          ]
        }
      ];
      
      const recentCategories = ['food', 'food'];
      
      const selected = inferenceService.selectNextQuestion(
        questions, 
        currentDist, 
        recentCategories
      );
      
      // Should prefer sports to avoid repeating food
      expect(selected.category).toBe('sports');
    });

    test('throws error if no questions available', () => {
      const currentDist = { 'US': 1.0 };
      
      expect(() => {
        inferenceService.selectNextQuestion([], currentDist);
      }).toThrow('No available questions');
    });
  });

  describe('calculateCategoryDiversityBonus', () => {
    test('gives full bonus for unused category', () => {
      const bonus = inferenceService.calculateCategoryDiversityBonus('food', []);
      expect(bonus).toBe(1.0);
    });

    test('gives reduced bonus for recently used category', () => {
      const bonus1 = inferenceService.calculateCategoryDiversityBonus('food', ['food']);
      const bonus2 = inferenceService.calculateCategoryDiversityBonus('food', ['food', 'food']);
      const bonus3 = inferenceService.calculateCategoryDiversityBonus('food', ['food', 'food', 'food']);
      
      expect(bonus1).toBe(0.5);
      expect(bonus2).toBe(0.2);
      expect(bonus3).toBe(0.0);
    });
  });

  describe('calculateRecencyPenalty', () => {
    test('gives no penalty for unused category', () => {
      const penalty = inferenceService.calculateRecencyPenalty('food', ['sports', 'climate']);
      expect(penalty).toBe(0);
    });

    test('gives heavy penalty for last question category', () => {
      const penalty = inferenceService.calculateRecencyPenalty('food', ['sports', 'food']);
      expect(penalty).toBe(0.8);
    });

    test('gives medium penalty for 2nd to last', () => {
      const penalty = inferenceService.calculateRecencyPenalty('food', ['food', 'sports']);
      expect(penalty).toBe(0.4);
    });

    test('gives light penalty for 3rd to last', () => {
      const penalty = inferenceService.calculateRecencyPenalty('food', ['food', 'sports', 'climate']);
      expect(penalty).toBe(0.2);
    });
  });

  describe('updateHeightCategoryProbabilities', () => {
    test('centers on average for zero adjustment', () => {
      const probs = inferenceService.updateHeightCategoryProbabilities(0);
      
      // Average should have highest probability
      expect(probs.average).toBeGreaterThan(probs.above);
      expect(probs.average).toBeGreaterThan(probs.below);
    });

    test('centers on way_above for large positive adjustment', () => {
      const probs = inferenceService.updateHeightCategoryProbabilities(20);
      
      // way_above should have highest probability
      expect(probs.way_above).toBeGreaterThan(probs.above);
      expect(probs.way_above).toBeGreaterThan(probs.average);
    });

    test('centers on way_below for large negative adjustment', () => {
      const probs = inferenceService.updateHeightCategoryProbabilities(-20);
      
      // way_below should have highest probability
      expect(probs.way_below).toBeGreaterThan(probs.below);
      expect(probs.way_below).toBeGreaterThan(probs.average);
    });

    test('probabilities sum to 1.0', () => {
      const probs = inferenceService.updateHeightCategoryProbabilities(5);
      const sum = Object.values(probs).reduce((a, b) => a + b, 0);
      
      expect(sum).toBeCloseTo(1.0, 10);
    });
  });

  describe('getFinalHeightCategory', () => {
    test('returns category with highest probability', () => {
      const probs = {
        'way_below': 0.05,
        'below': 0.10,
        'average': 0.20,
        'above': 0.50,
        'way_above': 0.15
      };
      
      const category = inferenceService.getFinalHeightCategory(probs);
      
      expect(category).toBe('above');
    });
  });

  describe('Integration: Full Quiz Flow', () => {
    test('simulates complete nationality determination', () => {
      // Start with uniform distribution
      const countries = ['US', 'GB', 'JP'];
      let dist = inferenceService.initializeUniformDistribution(countries);
      
      // Simulate US-typical answers
      const usAnswers = [
        { 'US': 0.85, 'GB': 0.65, 'JP': 0.25 },  // Car
        { 'US': 0.37, 'GB': 0.05, 'JP': 0.02 },  // Football
        { 'US': 0.28, 'GB': 0.20, 'JP': 0.05 },  // Pizza
        { 'US': 0.65, 'GB': 0.30, 'JP': 0.25 }   // Coffee
      ];
      
      for (const weights of usAnswers) {
        dist = inferenceService.bayesianUpdate(dist, weights);
      }
      
      const confidence = inferenceService.getConfidence(dist);
      const mostLikely = inferenceService.getMostLikelyCountry(dist);
      
      // Should confidently identify US
      expect(mostLikely).toBe('US');
      expect(confidence).toBeGreaterThan(0.90);
    });

    test('simulates complete height determination', () => {
      let totalAdjustment = 0;
      
      // Simulate tall person answers
      const tallAnswers = [10, 8, 12, 9, 11];  // All positive adjustments
      
      for (const adjustment of tallAnswers) {
        totalAdjustment += adjustment;
      }
      
      const probs = inferenceService.updateHeightCategoryProbabilities(totalAdjustment);
      const category = inferenceService.getFinalHeightCategory(probs);
      const confidence = Math.max(...Object.values(probs));
      
      // Should identify as tall
      expect(['above', 'way_above']).toContain(category);
      expect(confidence).toBeGreaterThan(0.70);
    });
  });
});

// Made with Bob
