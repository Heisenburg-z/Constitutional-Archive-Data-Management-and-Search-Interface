// tests/math.test.js
const { add } = require('../dummy');

test('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
