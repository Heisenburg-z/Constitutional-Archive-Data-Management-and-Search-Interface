import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

//dummy tests
test('renders App without crashing', () => {
  render(<App />);
});
