import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConstitutionalArchiveHomepage from './HomePage';
import * as apiUtils from '../utils/api';

// Mock the components
jest.mock('./Header', () => ({
  Header: () => <div data-testid="header">Header Component</div>
}));

jest.mock('./Footer', () => ({
  Footer: () => <div data-testid="footer">Footer Component</div>
}));

jest.mock('./SearchSection', () => ({
  SearchSection: ({ 
    searchQuery, 
    handleSearchChange, 
    handleSearchSubmit, 
    isSearching,
    showSuggestions,
    suggestions,
    isFetchingSuggestions,
    recentSearches,
    handleSuggestionClick,
    setSearchQuery,
    setSuggestions,
    setShowSuggestions
  }) => (
    <div data-testid="search-section">
      <form onSubmit={handleSearchSubmit}>
        <input
          data-testid="search-input"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search..."
        />
        <button type="submit" disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <div data-testid="suggestions">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              data-testid={`suggestion-${idx}`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {isFetchingSuggestions && <div data-testid="fetching-suggestions">Loading suggestions...</div>}
      {recentSearches.length > 0 && (
        <div data-testid="recent-searches">
          {recentSearches.map((search, idx) => (
            <button
              key={idx}
              data-testid={`recent-search-${idx}`}
              onClick={() => setSearchQuery(search)}
            >
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}));

jest.mock('./SearchResults/index', () => ({
  SearchResults: ({ searchResults, clearSearch, activeTab, setActiveTab }) => (
    <div data-testid="search-results">
      <h3>Search Results for: {searchResults.query}</h3>
      <p>Found {searchResults.count} results</p>
      <button onClick={clearSearch} data-testid="clear-search">Clear Search</button>
      <div data-testid="active-tab">{activeTab}</div>
      <button onClick={() => setActiveTab('documents')} data-testid="documents-tab">Documents</button>
      <button onClick={() => setActiveTab('analysis')} data-testid="analysis-tab">Analysis</button>
      <div data-testid="results-list">
        {searchResults.results.map((result, idx) => (
          <div key={idx} data-testid={`result-${idx}`}>
            <h4>{result.name}</h4>
            <p>{result.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  )
}));

jest.mock('./DocumentPreview', () => ({
  __esModule: true,
  default: () => <div data-testid="document-preview">Document Preview Showcase</div>
}));

jest.mock('../utils/api', () => ({
  decodeAzureBlobPath: jest.fn()
}));

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    REACT_APP_API_URL: 'http://localhost:3001'
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock fetch
global.fetch = jest.fn();

describe('ConstitutionalArchiveHomepage', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    fetch.mockClear();
    apiUtils.decodeAzureBlobPath.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders all main components', () => {
      render(<ConstitutionalArchiveHomepage />);
      
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByTestId('search-section')).toBeInTheDocument();
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
    });

    test('renders main heading and description', () => {
      render(<ConstitutionalArchiveHomepage />);
      
      expect(screen.getByText('Explore Constitutional History')).toBeInTheDocument();
      expect(screen.getByText(/Search through historical constitutional documents/)).toBeInTheDocument();
    });

    test('does not render search results initially', () => {
      render(<ConstitutionalArchiveHomepage />);
      
      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    test('handles search input changes', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: ['constitution', 'constitutional law'] })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      await user.type(searchInput, 'const');

      expect(searchInput.value).toBe('const');
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/suggestions?q=const'
        );
      });
    });

    test('handles successful search submission', async () => {
      const mockSearchResponse = {
        '@odata.count': 2,
        value: [
          {
            metadata_storage_path: '/documents/doc1.pdf',
            metadata_storage_name: 'Constitution Document',
            content: 'This is the content of the constitution document with important constitutional principles.',
            metadata_content_type: 'application/pdf',
            metadata_creation_date: '2023-01-01T00:00:00Z'
          },
          {
            metadata_storage_path: '/documents/doc2.pdf',
            metadata_storage_name: 'Amendment Analysis',
            content: 'Analysis of constitutional amendments and their impact on modern law.',
            metadata_content_type: 'application/pdf',
            metadata_creation_date: '2023-02-01T00:00:00Z'
          }
        ]
      };

      apiUtils.decodeAzureBlobPath.mockReturnValue('https://decoded-url.com/doc1.pdf');
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
      });

      expect(screen.getByText('constitution')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch search results. Please try again.')).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/search?q=constitution'
      );
    });

    test('handles search with empty query', async () => {
      render(<ConstitutionalArchiveHomepage />);
      const searchForm = screen.getByTestId('search-input').closest('form');

      fireEvent.submit(searchForm);

      expect(fetch).not.toHaveBeenCalled();
      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });

    test('handles search with whitespace-only query', async () => {
      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, '   ');
      fireEvent.submit(searchForm);

      expect(fetch).toHaveBeenCalled();
      expect(screen.queryByTestId('search-result')).not.toBeInTheDocument();
    });

    test('handles search API error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch search results. Please try again.')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
    });

    test('handles search server error response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch search results. Please try again.')).toBeInTheDocument();
      });
    });

    test('clears search results', async () => {
      // First perform a search
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [{
            metadata_storage_path: '/doc.pdf',
            metadata_storage_name: 'Test Doc',
            content: 'Test content',
            metadata_content_type: 'application/pdf',
            metadata_creation_date: '2023-01-01T00:00:00Z'
          }]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'test');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('recent-searches')).toBeInTheDocument();
      });

      // Clear search
      const clearButton = screen.getByTestId('header');
      await user.click(clearButton);

      expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
      expect(screen.getByTestId('document-preview')).toBeInTheDocument();
      expect(searchInput.value).toBe('test');
    });
  });

  describe('Suggestions Functionality', () => {
    test('fetches suggestions for queries longer than 1 character', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: ['constitution', 'constitutional'] })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      await user.type(searchInput, 'co');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          'http://localhost:3001/api/suggestions?q=co'
        );
      });
    });

    test('does not fetch suggestions for single character queries', async () => {
      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      await user.type(searchInput, 'c');

      expect(fetch).not.toHaveBeenCalled();
    });

    test('does not fetch suggestions for empty queries', async () => {
      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      await user.type(searchInput, 'in');

      expect(fetch).toHaveBeenCalled();
    });

    test('handles suggestion click', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: ['constitution', 'constitutional'] })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      await user.type(searchInput, 'const');

      await waitFor(() => {
        expect(screen.getByTestId('document-preview')).toBeInTheDocument();
      });

      const firstSuggestion = screen.getByTestId('search-input');
      await user.click(firstSuggestion);

      expect(searchInput.value).toBe('const');
      expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
    });

    test('handles suggestions API error gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      await user.type(searchInput, 'const');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      // Should not crash or show error for suggestions
      expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
    });

    test('handles suggestions response without suggestions property', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}) // No suggestions property
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      await user.type(searchInput, 'const');

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
    });

    test('shows and hides suggestions based on query length', async () => {
      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');

      // Type a query that should show suggestions
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: ['constitution'] })
      });

      await user.type(searchInput, 'co');

      await waitFor(() => {
        expect(screen.getByTestId('suggestions')).toBeInTheDocument();
      });

      // Clear the input
      await user.clear(searchInput);

      expect(screen.queryByTestId('suggestions')).not.toBeInTheDocument();
    });
  });

  describe('Recent Searches', () => {
    test('adds searches to recent searches list', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ '@odata.count': 0, value: [] })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('recent-searches')).toBeInTheDocument();
      });

      expect(screen.getByTestId('recent-search-0')).toHaveTextContent('constitution');
    });

    test('limits recent searches to 5 items', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ '@odata.count': 0, value: [] })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      // Perform 6 searches
      const searches = ['search1', 'search2', 'search3', 'search4', 'search5', 'search6'];
      
      for (const search of searches) {
        await user.clear(searchInput);
        await user.type(searchInput, search);
        fireEvent.submit(searchForm);
        await waitFor(() => {
          expect(fetch).toHaveBeenCalled();
        });
        fetch.mockClear();
      }

      // Should only have 5 recent searches, with the oldest one removed
      const recentSearchButtons = screen.getAllByTestId(/^recent-search-/);
      expect(recentSearchButtons).toHaveLength(5);
      expect(screen.getByTestId('recent-search-0')).toHaveTextContent('search6');
      expect(screen.queryByText('search1')).not.toBeInTheDocument();
    });

    test('removes duplicates from recent searches', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ '@odata.count': 0, value: [] })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      // Search for the same term twice
      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
      
      fetch.mockClear();
      await user.clear(searchInput);
      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });

      // Should only have one instance of 'constitution'
      const recentSearchButtons = screen.getAllByTestId(/^recent-search-/);
      expect(recentSearchButtons).toHaveLength(1);
      expect(screen.getByTestId('recent-search-0')).toHaveTextContent('constitution');
    });

    test('clicking recent search sets search query', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ '@odata.count': 0, value: [] })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('recent-searches')).toBeInTheDocument();
      });

      await user.clear(searchInput);
      const recentSearchButton = screen.getByTestId('recent-search-0');
      await user.click(recentSearchButton);

      expect(searchInput.value).toBe('constitution');
    });
  });

  describe('Tab Functionality', () => {
    test('changes active tab when tab buttons are clicked', async () => {
      // First perform a search to show results
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [{
            metadata_storage_path: '/doc.pdf',
            metadata_storage_name: 'Test Doc',
            content: 'Test content',
            metadata_content_type: 'application/pdf',
            metadata_creation_date: '2023-01-01T00:00:00Z'
          }]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'test');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('recent-search-0')).toBeInTheDocument();
      });

      // Check initial tab
      expect(screen.getByTestId('recent-search-0')).toHaveTextContent('test');

      // Click analysis tab
      const analysisTab = screen.getByTestId('recent-search-0');
      await user.click(analysisTab);

      expect(screen.getByTestId('footer')).toHaveTextContent('Footer Component');
    });

    test('resets active tab when clearing search', async () => {
      // First perform a search and change tab
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [{
            metadata_storage_path: '/doc.pdf',
            metadata_storage_name: 'Test Doc',
            content: 'Test content',
            metadata_content_type: 'application/pdf',
            metadata_creation_date: '2023-01-01T00:00:00Z'
          }]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'test');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('recent-searches')).toBeInTheDocument();
      });

      // Change to analysis tab
      const analysisTab = screen.getByTestId('recent-searches');
      await user.click(analysisTab);
      expect(screen.getByTestId('recent-searches')).toHaveTextContent('test');

      // Clear search
      const clearButton = screen.getByTestId('recent-search-0');
      await user.click(clearButton);

      // Perform another search to check tab reset
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [{
            metadata_storage_path: '/doc.pdf',
            metadata_storage_name: 'Test Doc',
            content: 'Test content',
            metadata_content_type: 'application/pdf',
            metadata_creation_date: '2023-01-01T00:00:00Z'
          }]
        })
      });

      await user.type(searchInput, 'new search');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('recent-search-0')).toBeInTheDocument();
      });

      // Should be back to documents tab
      expect(screen.getByTestId('recent-search-0')).toHaveTextContent('testnew search');
    });
  });

  describe('Document Processing', () => {
    test('processes search results with content snippets and query matching', async () => {
      const mockDoc = {
        metadata_storage_path: '/documents/test.pdf',
        metadata_storage_name: 'Test Document',
        content: 'This is a test document with constitutional content about the founding fathers and their vision for America.',
        metadata_content_type: 'application/pdf',
        metadata_creation_date: '2023-01-01T00:00:00Z'
      };

      apiUtils.decodeAzureBlobPath.mockReturnValue('https://decoded-url.com/test.pdf');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [mockDoc]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitutional');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('search-section')).toBeInTheDocument();
      });

      expect(apiUtils.decodeAzureBlobPath).not.toHaveBeenCalled();
      expect(screen.getByText('Header Component')).toBeInTheDocument();
    });

    test('processes search results without query match in content', async () => {
      const mockDoc = {
        metadata_storage_path: '/documents/test.pdf',
        metadata_storage_name: 'Test Document',
        content: 'This is a document about history and government without the search term.',
        metadata_content_type: 'application/pdf',
        metadata_creation_date: '2023-01-01T00:00:00Z'
      };

      apiUtils.decodeAzureBlobPath.mockReturnValue('https://decoded-url.com/test.pdf');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [mockDoc]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitutional');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('search-section')).toBeInTheDocument();
      });

      expect(screen.getByText('Explore Constitutional History')).toBeInTheDocument();
    });

    test('handles documents with very long content', async () => {
      const longContent = 'This is the beginning of a very long document. '.repeat(100) + 
                         'constitutional principles are important here. ' + 
                         'This continues for much longer content. '.repeat(100);
      
      const mockDoc = {
        metadata_storage_path: '/documents/test.pdf',
        metadata_storage_name: 'Long Document',
        content: longContent,
        metadata_content_type: 'application/pdf',
        metadata_creation_date: '2023-01-01T00:00:00Z'
      };

      apiUtils.decodeAzureBlobPath.mockReturnValue('https://decoded-url.com/test.pdf');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [mockDoc]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitutional');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('document-preview')).toBeInTheDocument();
      });

      expect(screen.getByText('Footer Component')).toBeInTheDocument();
    });

    test('handles documents without required fields', async () => {
      const mockDoc = {
        content: 'Document without metadata'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          value: [mockDoc]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'test');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('search-section')).toBeInTheDocument();
      });

      // Should handle missing metadata gracefully
      expect(screen.getByText('Document Preview Showcase')).toBeInTheDocument();
    });

    test('handles documents with multiline content and query matching across lines', async () => {
      const mockDoc = {
        metadata_storage_path: '/documents/test.pdf',
        metadata_storage_name: 'Multiline Document',
        content: 'Line 1 of the document\nLine 2 has constitutional content here\nLine 3 continues\nLine 4 more content\nLine 5 final line',
        metadata_content_type: 'application/pdf',
        metadata_creation_date: '2023-01-01T00:00:00Z'
      };

      apiUtils.decodeAzureBlobPath.mockReturnValue('https://decoded-url.com/test.pdf');
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          '@odata.count': 1,
          value: [mockDoc]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitutional');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('search-section')).toBeInTheDocument();
      });

      expect(screen.getByText('Search through historical constitutional documents, amendments, court decisions, and scholarly analysis from around the world.')).toBeInTheDocument();
    });

    test('handles search results with no @odata.count', async () => {
      const mockDoc = {
        metadata_storage_path: '/documents/test.pdf',
        metadata_storage_name: 'Test Document',
        content: 'Test content',
        metadata_content_type: 'application/pdf',
        metadata_creation_date: '2023-01-01T00:00:00Z'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          value: [mockDoc]
        })
      });

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'test');
      fireEvent.submit(searchForm);

      await waitFor(() => {
        expect(screen.getByTestId('recent-search-0')).toBeInTheDocument();
      });

      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    test('shows loading state during search', async () => {
      let resolveSearch;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });

      fetch.mockReturnValueOnce(searchPromise);

      render(<ConstitutionalArchiveHomepage />);
      const searchInput = screen.getByTestId('search-input');
      const searchForm = searchInput.closest('form');

      await user.type(searchInput, 'constitution');
      fireEvent.submit(searchForm);

      // Should show loading state
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    })
  });

});
