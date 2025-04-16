import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

//dummy tests coverage
test('renders App without crashing', () => {
  render(<App />);
});
