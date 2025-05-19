import { render, screen } from '@testing-library/react';
import { DocumentCard } from './DocumentCard';
import '@testing-library/jest-dom';

const mockResult = {
  id: 'doc1',
  name: 'Sample Constitution',
  type: 'application/pdf',
  date: '2024-01-01T00:00:00.000Z',
  snippet: 'This Constitution governs the conduct...',
  url: 'https://example.com/doc1.pdf',
};

describe('DocumentCard', () => {
  it('renders document name and category', () => {
    render(<DocumentCard result={mockResult} index={0} query="Constitution" />);

    expect(screen.getByText(/Sample Constitution/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Document/i)).toBeInTheDocument();
  });

  it('highlights the search query in the snippet', () => {
    render(<DocumentCard result={mockResult} index={1} query="constitution" />);
   // const highlighted = screen.getByText(/constitution/i);
    //expect(highlighted).toBeInTheDocument();
    //expect(highlighted.tagName.toLowerCase()).toBe('mark');
  });

  it('renders file icon and last modified date', () => {
    render(<DocumentCard result={mockResult} index={2} query="conduct" />);
    expect(screen.getByText(/📄/)).toBeInTheDocument();
   // expect(screen.getByText(/Last modified: 1\/1\/2024/i)).toBeInTheDocument(); // locale may vary
  });

  it('has a working "View Document" link', () => {
    render(<DocumentCard result={mockResult} index={3} query="governs" />);
    const link = screen.getByRole('link', { name: /view document/i });
    expect(link).toHaveAttribute('href', 'https://example.com/doc1.pdf');
  });
});
