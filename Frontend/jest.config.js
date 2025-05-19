// jest.config.js
module.exports = {
  // Use the setupTests.js file for test environment setup
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Set test environment to jsdom (browser-like)
  testEnvironment: 'jsdom',
  
  // File patterns to include in tests
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}'
  ],
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Mock file imports
  moduleNameMapper: {
    // Mock CSS imports
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    // Mock image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    "^axios$": "<rootDir>/node_modules/axios/dist/axios.js"
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  
  // Directories to ignore for coverage
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__mocks__/',
    '/config/',
    '/context/',
    '/services/',
    'src/index.(js|ts)x?',
    'src/App.(js|ts)x?',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Display individual test results during test run
  verbose: true,
  
  // Watch mode configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Add test result reporter
  reporters: ['default'],
  
  // Automatically clear mock calls and instances between tests
  clearMocks: true,
};