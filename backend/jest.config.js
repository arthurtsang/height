module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/app.js',
    '!src/config/*.js',
    '!src/routes/**/*.js',
    '!src/controllers/**/*.js',
    '!src/middleware/**/*.js',
    '!src/services/redis.service.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    },
    './src/services/height.service.js': {
      branches: 70,
      functions: 85,
      lines: 70,
      statements: 70
    },
    './src/services/question.service.js': {
      branches: 90,
      functions: 100,
      lines: 90,
      statements: 90
    },
    './src/services/session.service.js': {
      branches: 100,
      functions: 75,
      lines: 90,
      statements: 90
    },
    './src/utils/**/*.js': {
      branches: 75,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  verbose: true,
  testTimeout: 10000
};

// Made with Bob
