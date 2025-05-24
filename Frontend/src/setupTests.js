import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
// Ensure DOM is available
if (typeof document === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM();
  global.document = dom.window.document;
  global.window = dom.window;
}

fetchMock.enableMocks();
// jest.setup.js
// This file can be used to configure Jest globally
// Mock for window.URL
// Can be included in your setupTests.js file
if (typeof window !== 'undefined') {
  window.URL.createObjectURL = jest.fn(() => 'mocked-url');
  window.URL.revokeObjectURL = jest.fn();
}

// Silence React 18 console errors about act() warnings during testing
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
      /Warning: The current testing environment is not configured to support act/.test(args[0]) ||
      /Error: Not implemented: navigation/.test(args[0])
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock for fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Silence act() warnings globally
const eoriginalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    eoriginalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock window.open
global.open = jest.fn();

// Mock URL constructor and methods
global.URL = class URL {
  constructor(url) {
    this.href = url;
  }
  static createObjectURL = jest.fn(() => 'mock-blob-url');
  static revokeObjectURL = jest.fn();
};

// Mock Blob constructor
global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts;
    this.options = options;
    this.size = parts.reduce((acc, part) => acc + part.length, 0);
  }
};

// Suppress console errors for cleaner test output


afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  // Clear any timers
  jest.clearAllTimers();
});
// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});