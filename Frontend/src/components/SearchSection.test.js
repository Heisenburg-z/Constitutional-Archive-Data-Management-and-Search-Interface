import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchSection } from './SearchSection';
import '@testing-library/jest-dom';
import { Loader2, Clock, TrendingUp, Search, X } from 'lucide-react';

describe('SearchSection Component', () => {
  const mockHandleSearchChange = jest.fn();
  const mockHandleSearchSubmit = jest.fn();
  const mockHandleSuggestionClick = jest.fn();
  const mockSetShowSuggestions = jest.fn();
  const mockSetSearchQuery = jest.fn();
  const mockSetSuggestions = jest.fn();

  const defaultProps = {
    searchQuery: '',
    handleSearchChange: mockHandleSearchChange,
    handleSearchSubmit: mockHandleSearchSubmit,
    isSearching: false,
    showSuggestions: false,
    suggestions: [],
    isFetchingSuggestions: false,
    recentSearches: ['First Amendment', 'Bill of Rights'],
    handleSuggestionClick: mockHandleSuggestionClick,
    setShowSuggestions: mockSetShowSuggestions,
    setSearchQuery: mockSetSearchQuery,
    setSuggestions: mockSetSuggestions,
  };

  it('should render the search input and button', () => {
    render(<SearchSection {...defaultProps} />);
    
    // Check if the search input is rendered
    const searchInput = screen.getByPlaceholderText('Search constitutional documents...');
    expect(searchInput).toBeInTheDocument();

    // Check if the search button is rendered
    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeInTheDocument();
  });

  it('should show the loading spinner when searching', () => {
    const props = {
      ...defaultProps,
      isSearching: true,
    };
    render(<SearchSection {...props} />);
    
    const loadingSpinner = screen.getByText('Searching...');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('should show suggestions when the search query is not empty', async () => {
    const props = {
      ...defaultProps,
      searchQuery: 'First',
      showSuggestions: true,
      suggestions: ['First Amendment'],
    };
    render(<SearchSection {...props} />);
    
    // Check if suggestions are displayed
    const suggestion = await screen.findByText('First Amendment');
    expect(suggestion).toBeInTheDocument();
  });

it('should call handleSearchChange when typing in the search input', () => {
  render(<SearchSection {...defaultProps} />);
  
  const searchInput = screen.getByPlaceholderText('Search constitutional documents...');
  fireEvent.change(searchInput, { target: { value: 'First' } });

  expect(mockHandleSearchChange).toHaveBeenCalledWith(expect.objectContaining({
    target: searchInput
  }));
  
  // Verify the input value was updated
  expect(searchInput.value).toBe('');
});

  it('should clear the search input when clicking the X button', () => {
    render(<SearchSection {...defaultProps} searchQuery="First" />);

    const clearButton = screen.getByRole('button', { name: '' }); // button with the X icon
    fireEvent.click(clearButton);

    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    expect(mockSetSuggestions).toHaveBeenCalledWith([]);
  });

  it('should call handleSuggestionClick when clicking on a suggestion', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'First',
      showSuggestions: true,
      suggestions: ['First Amendment'],
    };
    render(<SearchSection {...props} />);

    const suggestion = screen.getByText('First Amendment');
    fireEvent.click(suggestion);

    expect(mockHandleSuggestionClick).toHaveBeenCalledWith('First Amendment');
  });

  it('should show recent searches when there are no suggestions and query is empty', async () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
    };
    render(<SearchSection {...props} />);
    
    const recentSearchText = screen.getByText('Recent searches');
    expect(recentSearchText).toBeInTheDocument();

    const recentSearchItem = screen.getAllByText('First Amendment');
    expect(recentSearchItem[0]).toBeInTheDocument();
  });

  it('should show a message when no suggestions are found', async () => {
    const props = {
      ...defaultProps,
      searchQuery: 'Unknown',
      showSuggestions: true,
      suggestions: [],
    };
    render(<SearchSection {...props} />);
    
    const noSuggestionsMessage = screen.getByText('No suggestions found');
    expect(noSuggestionsMessage).toBeInTheDocument();
  });

  it('should show popular searches when there are no suggestions', async () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
    };
    render(<SearchSection {...props} />);
    
    const popularSearchText = screen.getByText('Popular searches');
    expect(popularSearchText).toBeInTheDocument();

    const popularSearchItem = screen.getAllByText('First Amendment');
    expect(popularSearchItem[0]).toBeInTheDocument();
  });
});
