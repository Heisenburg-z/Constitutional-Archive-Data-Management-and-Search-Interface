// src/components/SearchResults.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SearchResults } from './index';

// Mock environment variables
process.env.REACT_APP_API_URL = 'https://test-api.example.com';

// Mock child components
jest.mock('./Tabs', () => ({
  Tabs: ({ activeTab, setActiveTab }) => (
    <div data-testid="mock-tabs">
      <span>Active tab: {activeTab}</span>
      <button onClick={() => setActiveTab('documents')}>Set Documents</button>
      <button onClick={() => setActiveTab('images')}>Set Images</button>
      <button onClick={() => setActiveTab('videos')}>Set Videos</button>
    </div>
  )
}));

jest.mock('./DocumentTab', () => ({
  DocumentTab: ({ results, query }) => (
    <div data-testid="mock-document-tab">
      <span>Document results count: {results?.length || 0}</span>
      <span>Query: {query}</span>
    </div>
  )
}));

jest.mock('./ImageTab', () => ({
  ImageTab: () => <div data-testid="mock-image-tab">Image Tab Content</div>
}));

jest.mock('./VideoTab', () => ({
  __esModule: true,
  default: ({ searchQuery, videoResults }) => (
    <div data-testid="mock-video-tab">
      <span>Video search query: {searchQuery}</span>
      <span>Video results: {videoResults ? 'Available' : 'Not available'}</span>
    </div>
  )
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon">X</div>,
  Search: () => <div data-testid="search-icon">Search</div>
}));

// Mock fetch
global.fetch = jest.fn();

describe('SearchResults Component', () => {
  const mockSearchResults = {
    query: 'test query',
    count: 5,
    results: [
      { id: '1', title: 'Test Document 1' },
      { id: '2', title: 'Test Document 2' },
      { id: '3', title: 'Test Document 3' },
      { id: '4', title: 'Test Document 4' },
      { id: '5', title: 'Test Document 5' }
    ]
  };

  const mockVideoResults = {
    results: [
      { id: '1', title: 'Test Video 1' },
      { id: '2', title: 'Test Video 2' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful fetch by default
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockVideoResults
    });
  });

  test('renders search results with correct data', async () => {
    const mockClearSearch = jest.fn();
    
    render(
      <SearchResults 
        searchResults={mockSearchResults}
        clearSearch={mockClearSearch}
        activeTab="documents"
        setActiveTab={jest.fn()}
      />
    );
    
    // Check if the search query is displayed
    expect(screen.getByText(`"${mockSearchResults.query}"`)).toBeInTheDocument();
    
    // Check if the document count is displayed
    expect(screen.getByText(`${mockSearchResults.count} documents`)).toBeInTheDocument();
    
    // Check if the tabs component is rendered
    expect(screen.getByTestId('mock-tabs')).toBeInTheDocument();
    
    // Check if the document tab is rendered by default
    expect(screen.getByTestId('mock-document-tab')).toBeInTheDocument();
    
    // Wait for the video fetch to complete
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `https://test-api.example.com/api/archives/videos/search?query=${encodeURIComponent(mockSearchResults.query)}`
      );
    });
    
    // Check if the video count is displayed after fetch
    await waitFor(() => {
      expect(screen.getByText('2 videos')).toBeInTheDocument();
    });
  });

  test('calls clearSearch when clear button is clicked', async () => {
    const mockClearSearch = jest.fn();
    
    render(
      <SearchResults 
        searchResults={mockSearchResults}
        clearSearch={mockClearSearch}
        activeTab="documents"
        setActiveTab={jest.fn()}
      />
    );
    
    // Wait for component to fully render
    await waitFor(() => {
      expect(screen.getByText('Clear Results')).toBeInTheDocument();
    });
    
    // Click the clear button
    fireEvent.click(screen.getByText('Clear Results'));
    
    // Check if clearSearch was called
    expect(mockClearSearch).toHaveBeenCalledTimes(1);
  });

  test('switches between tabs correctly', async () => {
    const mockSetActiveTab = jest.fn();
    
    render(
      <SearchResults 
        searchResults={mockSearchResults}
        clearSearch={jest.fn()}
        activeTab="documents"
        setActiveTab={mockSetActiveTab}
      />
    );
    
    // Check initial tab
    expect(screen.getByText('Active tab: documents')).toBeInTheDocument();
    
    // Switch to images tab
    fireEvent.click(screen.getByText('Set Images'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('images');
    
    // Switch to videos tab
    fireEvent.click(screen.getByText('Set Videos'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('videos');
    
    // Re-render with different active tab
    const { rerender } = render(
      <SearchResults 
        searchResults={mockSearchResults}
        clearSearch={jest.fn()}
        activeTab="images"
        setActiveTab={mockSetActiveTab}
      />
    );
    
    expect(screen.getByTestId('mock-image-tab')).toBeInTheDocument();
    
    // Re-render with videos tab
    rerender(
      <SearchResults 
        searchResults={mockSearchResults}
        clearSearch={jest.fn()}
        activeTab="videos"
        setActiveTab={mockSetActiveTab}
      />
    );
    
    expect(screen.getByTestId('mock-video-tab')).toBeInTheDocument();
  });

  test('handles video fetch failure gracefully', async () => {
    // Mock a failed fetch
    global.fetch.mockRejectedValue(new Error('Network error'));
    global.console.error = jest.fn(); // Mock console.error
    
    render(
      <SearchResults 
        searchResults={mockSearchResults}
        clearSearch={jest.fn()}
        activeTab="videos"
        setActiveTab={jest.fn()}
      />
    );
    
    // Check that video tab is rendered
    expect(screen.getByTestId('mock-video-tab')).toBeInTheDocument();
    
    // Check that the error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching video results:',
        expect.any(Error)
      );
    });
  });

  test('shows loading state while fetching videos', async () => {
    // Create a promise that won't resolve immediately
    let resolvePromise;
    const fetchPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    global.fetch.mockImplementation(() => fetchPromise);
    
    render(
      <SearchResults 
        searchResults={mockSearchResults}
        clearSearch={jest.fn()}
        activeTab="videos"
        setActiveTab={jest.fn()}
      />
    );
    
    // Check that the component is in a loading state
    expect(screen.getByText('Loading videos...')).toBeInTheDocument();
    
    // Resolve the fetch
    resolvePromise({
      ok: true,
      json: async () => mockVideoResults
    });
    
    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByText('Loading videos...')).not.toBeInTheDocument();
    });
  });

  test('handles singular count text correctly', async () => {
    const singleDocumentResult = {
      query: 'test query',
      count: 1,
      results: [{ id: '1', title: 'Single Document' }]
    };

    const singleVideoResult = {
      results: [{ id: '1', title: 'Single Video' }]
    };
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => singleVideoResult
    });
    
    render(
      <SearchResults 
        searchResults={singleDocumentResult}
        clearSearch={jest.fn()}
        activeTab="documents"
        setActiveTab={jest.fn()}
      />
    );
    
    // Check if singular form is used for document count
    expect(screen.getByText('1 document')).toBeInTheDocument();
    
    // Wait for video count to update
    await waitFor(() => {
      expect(screen.getByText('1 video')).toBeInTheDocument();
    });
  });
});