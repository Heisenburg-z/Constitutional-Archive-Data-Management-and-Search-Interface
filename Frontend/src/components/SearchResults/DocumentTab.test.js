import { render, screen } from '@testing-library/react';
import { DocumentTab } from './DocumentTab';
import '@testing-library/jest-dom';

const mockResults = [
  {
    id: '1',
    name: 'Amendment 1',
    type: 'application/pdf',
    date: '2023-06-01T00:00:00.000Z',
    snippet: 'An amendment to the previous act...',
    url: '/doc/1',
  },
  {
    id: '2',
    name: 'Schedule Overview',
    type: 'application/html',
    date: '2023-07-01T00:00:00.000Z',
    snippet: 'This schedule outlines responsibilities...',
    url: '/doc/2',
  },
];

describe('DocumentTab', () => {
  it('renders multiple DocumentCard components', () => {
    render(<DocumentTab results={mockResults} query="schedule" />);
    expect(screen.getByText(/Amendment 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Schedule Overview/i)).toBeInTheDocument();
  });
});
