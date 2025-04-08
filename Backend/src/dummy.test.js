const assert = require('assert');
const { add } = require('./dummy');

describe('Dummy Test', () => {
  it('should add two numbers', () => {
    assert.strictEqual(add(2, 3), 5);
  });
});
