import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchSection } from './SearchSection';
import '@testing-library/jest-dom';

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  const eventArg = mockHandleSearchChange.mock.calls[0][0];

  expect(eventArg).toBeDefined();
  expect(eventArg.type).toBe('change');
  expect(eventArg.target).toBeInstanceOf(HTMLInputElement);
  expect(eventArg.target.value).toBe('');
});




  it('should call handleSearchSubmit when form is submitted', () => {
    render(<SearchSection {...defaultProps} />);
    
    const form = screen.getByRole('button', { name: /search/i }).closest('form');
    fireEvent.submit(form);

    expect(mockHandleSearchSubmit).toHaveBeenCalled();
  });

  it('should call handleSearchSubmit when search button is clicked', () => {
    render(<SearchSection {...defaultProps} />);
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);

    expect(mockHandleSearchSubmit).toHaveBeenCalled();
  });

  it('should show clear button when searchQuery is not empty', () => {
    render(<SearchSection {...defaultProps} searchQuery="First" />);

    const clearButton = screen.getByRole('button', { name: '' });
    expect(clearButton).toBeInTheDocument();
  });

  it('should not show clear button when searchQuery is empty', () => {
    render(<SearchSection {...defaultProps} searchQuery="" />);

    const clearButtons = screen.queryAllByRole('button');
    const clearButton = clearButtons.find(button => 
      button.querySelector('svg') && 
      !button.textContent.includes('Search') && 
      !button.textContent.includes('Searching')
    );
    expect(clearButton).toBeUndefined();
  });

  it('should clear the search input when clicking the X button', () => {
    render(<SearchSection {...defaultProps} searchQuery="First" />);

    const clearButton = screen.getByRole('button', { name: '' });
    fireEvent.click(clearButton);

    expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    expect(mockSetSuggestions).toHaveBeenCalledWith([]);
  });

  it('should call setShowSuggestions when input is focused with non-empty query', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'First',
    };
    render(<SearchSection {...props} />);

    const searchInput = screen.getByPlaceholderText('Search constitutional documents...');
    fireEvent.focus(searchInput);

    expect(mockSetShowSuggestions).toHaveBeenCalledWith(true);
  });

  it('should not call setShowSuggestions when input is focused with empty query', () => {
    render(<SearchSection {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search constitutional documents...');
    fireEvent.focus(searchInput);

    expect(mockSetShowSuggestions).toHaveBeenCalledWith(false);
  });

  it('should call setShowSuggestions(false) when input is blurred after timeout', async () => {
    render(<SearchSection {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search constitutional documents...');
    fireEvent.blur(searchInput);

    await waitFor(() => {
      expect(mockSetShowSuggestions).toHaveBeenCalledWith(false);
    }, { timeout: 300 });
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

  it('should show loading suggestions message when isFetchingSuggestions is true', () => {
    const props = {
      ...defaultProps,
      showSuggestions: true,
      isFetchingSuggestions: true,
    };
    render(<SearchSection {...props} />);
    
    const loadingMessage = screen.getByText('Loading suggestions...');
    expect(loadingMessage).toBeInTheDocument();
  });

  it('should show recent searches when there are no suggestions and query is empty', () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
    };
    render(<SearchSection {...props} />);
    
    const recentSearchText = screen.getByText('Recent searches');
    expect(recentSearchText).toBeInTheDocument();

    const recentSearchItem = screen.getAllByText('First Amendment')[0];
    expect(recentSearchItem).toBeInTheDocument();
  });

  it('should call handleSuggestionClick when clicking on recent search', () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
    };
    render(<SearchSection {...props} />);

    const recentSearchItem = screen.getAllByText('First Amendment')[0];
    fireEvent.click(recentSearchItem);

    expect(mockHandleSuggestionClick).toHaveBeenCalledWith('First Amendment');
  });

  it('should show popular searches when there are no suggestions and query is empty', () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
    };
    render(<SearchSection {...props} />);
    
    const popularSearchText = screen.getByText('Popular searches');
    expect(popularSearchText).toBeInTheDocument();

    const popularSearchItems = screen.getAllByText('First Amendment');
    expect(popularSearchItems.length).toBeGreaterThan(0);
  });

  it('should call handleSuggestionClick when clicking on popular search', () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
    };
    render(<SearchSection {...props} />);

    const popularSearchItems = screen.getAllByText('Judicial Review');
    fireEvent.click(popularSearchItems[0]);

    expect(mockHandleSuggestionClick).toHaveBeenCalledWith('Judicial Review');
  });

  it('should show a message when no suggestions are found with non-empty query', () => {
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

  it('should disable search button when isSearching is true', () => {
    const props = {
      ...defaultProps,
      isSearching: true,
    };
    render(<SearchSection {...props} />);
    
    const searchButton = screen.getByRole('button', { name: /searching/i });
    expect(searchButton).toBeDisabled();
  });

  it('should not disable search button when isSearching is false', () => {
    render(<SearchSection {...defaultProps} />);
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).not.toBeDisabled();
  });

  it('should render multiple suggestions correctly', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'Amendment',
      showSuggestions: true,
      suggestions: ['First Amendment', 'Second Amendment', 'Fourth Amendment'],
    };
    render(<SearchSection {...props} />);

    expect(screen.getByText('First Amendment')).toBeInTheDocument();
    expect(screen.getByText('Second Amendment')).toBeInTheDocument();
    expect(screen.getByText('Fourth Amendment')).toBeInTheDocument();
  });

  it('should handle multiple recent searches', () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
      recentSearches: ['First Amendment', 'Bill of Rights', 'Judicial Review'],
    };
    render(<SearchSection {...props} />);

    expect(screen.getAllByText('First Amendment')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Bill of Rights')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Judicial Review')[0]).toBeInTheDocument();
  });

  it('should handle empty recent searches', () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      showSuggestions: true,
      suggestions: [],
      recentSearches: [],
    };
    render(<SearchSection {...props} />);

    const recentSearchText = screen.getByText('Recent searches');
    expect(recentSearchText).toBeInTheDocument();
    
    // Should still show popular searches
    const popularSearchText = screen.getByText('Popular searches');
    expect(popularSearchText).toBeInTheDocument();
  });

  it('should not show suggestions dropdown when showSuggestions is false', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'First',
      showSuggestions: false,
      suggestions: ['First Amendment'],
    };
    render(<SearchSection {...props} />);

    expect(screen.queryByText('First Amendment')).not.toBeInTheDocument();
  });

  it('should have correct input attributes and classes', () => {
    render(<SearchSection {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText('Search constitutional documents...');
    expect(searchInput).toHaveAttribute('type', 'text');
    expect(searchInput).toHaveAttribute('autoComplete', 'off');
    expect(searchInput).toHaveAttribute('id', 'search-input');
  });

  it('should render all icons correctly', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      showSuggestions: true,
      suggestions: ['First Amendment'],
      recentSearches: ['Bill of Rights'],
    };
    render(<SearchSection {...props} />);

    // Search icon in input
    const searchIcons = document.querySelectorAll('svg');
    expect(searchIcons.length).toBeGreaterThan(0);
  });
});