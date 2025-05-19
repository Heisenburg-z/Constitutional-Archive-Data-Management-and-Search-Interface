import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResults } from './SearchResults'; // Make sure the import path is correct
import userEvent from '@testing-library/user-event';

// Mocking the `getColorClasses` utility function
jest.mock('../utils/colors', () => ({
  getColorClasses: jest.fn(() => ({
    border: 'border-blue-500',
    bg: 'bg-blue-100',
    accent: 'bg-blue-200',
    badge: 'bg-blue-300',
  })),
  escapeRegExp: jest.fn((str) => str),
}));

describe('SearchResults Component', () => {
  const mockClearSearch = jest.fn();

  const searchResults = {
    query: 'test',
    count: 2,
    results: [
      {
        id: 1,
        name: 'Test Document 1',
        type: 'pdf',
        snippet: 'This is a test snippet with the word test in it.',
        date: '2025-05-01',
        url: '#',
      },
      {
        id: 2,
        name: 'Test Document 2',
        type: 'html',
        snippet: 'Another test snippet with the word test.',
        date: '2025-06-01',
        url: '#',
      },
    ],
  };

  it('renders search results correctly', () => {
    render(<SearchResults searchResults={searchResults} clearSearch={mockClearSearch} />);

    // Check if the query is displayed correctly
    expect(screen.getByText(/Results for: "test"/i)).toBeInTheDocument();
    
    // Check if the number of results is displayed correctly
    expect(screen.getByText('2 results')).toBeInTheDocument();
    
    // Check if both results are displayed
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
    
    // Check if file icons are displayed correctly
    expect(screen.getByText('📄')).toBeInTheDocument(); // For PDF
    expect(screen.getByText('🌐')).toBeInTheDocument(); // For HTML
  });

  it('calls clearSearch when the "Clear Results" button is clicked', () => {
    render(<SearchResults searchResults={searchResults} clearSearch={mockClearSearch} />);

    // Click the "Clear Results" button
    userEvent.click(screen.getByText(/Clear Results/i));

    // Check if the mock function was called
    expect(mockClearSearch).toHaveBeenCalledTimes(1);
  });

  it('displays the correct file category', () => {
    render(<SearchResults searchResults={searchResults} clearSearch={mockClearSearch} />);

    // Check if the file categories are correct
    expect(screen.getByText('PDF Document')).toBeInTheDocument(); // For PDF
    expect(screen.getByText('Web Document')).toBeInTheDocument(); // For HTML
  });

  it('renders the highlighted search term in snippets', () => {
    render(<SearchResults searchResults={searchResults} clearSearch={mockClearSearch} />);
    
    // Check if the search term 'test' is highlighted in the snippets
    const highlightedText = screen.getByText(/test/i);
    expect(highlightedText).toHaveClass('bg-yellow-200');
  });
});
