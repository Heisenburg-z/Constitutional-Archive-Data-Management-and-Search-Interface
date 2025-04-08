import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello message', () => {
  render(<App />);
  const messageElement = screen.getByText(/hello patzers!/i);
  expect(messageElement).toBeInTheDocument();
});