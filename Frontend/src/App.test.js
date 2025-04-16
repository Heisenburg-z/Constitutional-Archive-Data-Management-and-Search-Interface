import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

//settup dummy tests 
test('renders App without crashing', () => {
  render(<App />);
});
