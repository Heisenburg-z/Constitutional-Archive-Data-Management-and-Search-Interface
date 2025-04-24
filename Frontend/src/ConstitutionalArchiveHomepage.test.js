import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import ConstitutionalArchiveHomepage from './ConstitutionalArchiveHomepage';
import DocumentPreviewShowcase from './components/DocumentPreview';

// Mock the document preview component
jest.mock('./components/DocumentPreview', () => {
  return jest.fn(() => <div data-testid="document-preview-showcase">Document Preview Showcase</div>);
});

// Mock environment variables
process.env = {
  ...process.env,
  REACT_APP_API_URL: 'https://test-api.example.com',
};

// Mock fetch API
const mockFetchResponse = {
  ok: true,
  json: jest.fn().mockResolvedValue({
    '@odata.count': 2,
    value: [
      {
        metadata_storage_path: 'SGVsbG8gV29ybGQ=', // Base64 for "Hello World"
        metadata_storage_name: 'South African Constitution.pdf',
        content: 'This document contains information about property rights in the South African Constitution.',
        metadata_content_type: 'application/pdf',
        metadata_creation_date: '2023-01-15'
      },
      {
        metadata_storage_path: 'R29vZGJ5ZSBXb3JsZA==', // Base64 for "Goodbye World"
        metadata_storage_name: 'US First Amendment.docx',
        content: 'This document describes freedom of speech principles in the US Constitution.',
        metadata_content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        metadata_creation_date: '2023-02-10'
      }
    ]
  })
};

global.fetch = jest.fn(() => Promise.resolve(mockFetchResponse));

// Mock atob (base64 decoder)
global.atob = jest.fn(str => {
  if (str === 'SGVsbG8gV29ybGQ=') return 'Hello World';
  if (str === 'R29vZGJ5ZSBXb3JsZA==') return 'Goodbye World';
  return '';
});

describe('ConstitutionalArchiveHomepage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders main sections when no search results', () => {
    render(<ConstitutionalArchiveHomepage />);
    
    // Check main header is rendered
    expect(screen.getByText('Constitutional Archive')).toBeInTheDocument();
    expect(screen.getByText('Explore Constitutional History')).toBeInTheDocument();
    
    // Check search form is rendered
    expect(screen.getByPlaceholderText(/Search constitutional documents/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument();
    
    // Check main sections are rendered
    expect(screen.getByTestId('document-preview-showcase')).toBeInTheDocument();
    expect(screen.getByText('Featured Collections')).toBeInTheDocument();
    expect(screen.getByText('Recently Added Documents')).toBeInTheDocument();
    expect(screen.getByText('Browse By Category')).toBeInTheDocument();
    
    // Check featured collections are rendered
    expect(screen.getByText('South African Constitution')).toBeInTheDocument();
    expect(screen.getByText('European Constitutional History')).toBeInTheDocument();
    expect(screen.getByText('United States Amendments')).toBeInTheDocument();
    
    // Check footer is rendered
    expect(screen.getByText('© 2025 Constitutional Archive. All rights reserved.')).toBeInTheDocument();
  });

  test('updates search query when user types', () => {
    render(<ConstitutionalArchiveHomepage />);
    
    const searchInput = screen.getByLabelText('Search constitutional documents');
    userEvent.type(searchInput, 'property rights');
    
    expect(searchInput).toHaveValue('property rights');
  });

  test('performs search and displays results', async () => {
    render(<ConstitutionalArchiveHomepage />);
    
    // Enter search query
    const searchInput = screen.getByLabelText('Search constitutional documents');
    await userEvent.type(searchInput, 'property rights');
    
    // Submit search form
    const searchButton = screen.getByRole('button', { name: /Search/ });
    fireEvent.click(searchButton);
    
    // Check loading state
    expect(screen.getByText('Searching...')).toBeInTheDocument();
    
    // Wait for results to be displayed
    await waitFor(() => {
      expect(screen.getByText('Results for:')).toBeInTheDocument();
      expect(screen.getByText('"property rights"')).toBeInTheDocument();
      expect(screen.getByText('2 results')).toBeInTheDocument();
    });
    
    // Check that API was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'https://test-api.example.com/api/search?q=property%20rights'
    );
    
    // Check that document results are displayed
    expect(screen.getByText('South African Constitution.pdf')).toBeInTheDocument();
    expect(screen.getByText('US First Amendment.docx')).toBeInTheDocument();
    
    // Check that section contents are hidden when search results are shown
    expect(screen.queryByText('Featured Collections')).not.toBeInTheDocument();
    expect(screen.queryByText('Recently Added Documents')).not.toBeInTheDocument();
    expect(screen.queryByTestId('document-preview-showcase')).not.toBeInTheDocument();
  });

  test('handles search with empty query', async () => {
    render(<ConstitutionalArchiveHomepage />);
    
    const searchButton = screen.getByRole('button', { name: /Search/ });
    fireEvent.click(searchButton);
    
    // Check that API was not called
    expect(global.fetch).not.toHaveBeenCalled();
    
    // Check that main content is still displayed
    expect(screen.getByText('Featured Collections')).toBeInTheDocument();
  });

  test('shows error message when search fails', async () => {
    // Set up fetch to reject
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(<ConstitutionalArchiveHomepage />);
    
    // Enter search query and submit
    const searchInput = screen.getByLabelText('Search constitutional documents');
    await userEvent.type(searchInput, 'property rights');
    
    const searchButton = screen.getByRole('button', { name: /Search/ });
    fireEvent.click(searchButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch search results. Please try again.')).toBeInTheDocument();
    });
  });

  test('clears search results when X button is clicked', async () => {
    render(<ConstitutionalArchiveHomepage />);
    
    // Perform search
    const searchInput = screen.getByLabelText('Search constitutional documents');
    await userEvent.type(searchInput, 'property rights');
    
    const searchButton = screen.getByRole('button', { name: /Search/ });
    fireEvent.click(searchButton);
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('Results for:')).toBeInTheDocument();
    });
    
    // Clear results
    const clearButton = screen.getByText('Clear Results');
    fireEvent.click(clearButton);
    
    // Check that main content is displayed again
    expect(screen.getByText('Featured Collections')).toBeInTheDocument();
    expect(screen.queryByText('Results for:')).not.toBeInTheDocument();
  });

  test('clears search input when X button is clicked', async () => {
    render(<ConstitutionalArchiveHomepage />);
    
    // Enter search query
    const searchInput = screen.getByLabelText('Search constitutional documents');
    await userEvent.type(searchInput, 'property rights');
    
    // Clear input using X button
    const clearInputButton = screen.getByRole('button', { 'name': '' });
    fireEvent.click(clearInputButton);
    
    expect(searchInput).toHaveValue('');
  });

  test('handles non-OK server response', async () => {
    // Set up fetch to return a non-OK response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    });
    
    render(<ConstitutionalArchiveHomepage />);
    
    // Enter search query and submit
    const searchInput = screen.getByLabelText('Search constitutional documents');
    await userEvent.type(searchInput, 'property rights');
    
    const searchButton = screen.getByRole('button', { name: /Search/ });
    fireEvent.click(searchButton);
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch search results. Please try again.')).toBeInTheDocument();
    });
  });

  test('correctly decodes Azure blob paths', async () => {
    render(<ConstitutionalArchiveHomepage />);
    
    // Perform search
    const searchInput = screen.getByLabelText('Search constitutional documents');
    await userEvent.type(searchInput, 'property rights');
    
    const searchButton = screen.getByRole('button', { name: /Search/ });
    fireEvent.click(searchButton);
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('South African Constitution.pdf')).toBeInTheDocument();
    });
    
    // Check that links have correct decoded URLs
    const links = screen.getAllByText('View Document');
    expect(links[0].closest('a')).toHaveAttribute('href', 'Hello World');
    expect(links[1].closest('a')).toHaveAttribute('href', 'Goodbye World');
  });

  test('displays Document Preview showcase component', () => {
    render(<ConstitutionalArchiveHomepage />);
    
    expect(DocumentPreviewShowcase).toHaveBeenCalled();
    expect(screen.getByTestId('document-preview-showcase')).toBeInTheDocument();
  });

  test('highlights search terms in results', async () => {
    // Set up fetch to return content with the search term
    mockFetchResponse.json.mockResolvedValueOnce({
      '@odata.count': 1,
      value: [{
        metadata_storage_path: 'SGVsbG8gV29ybGQ=',
        metadata_storage_name: 'Document.pdf',
        content: 'This document discusses property rights in detail.',
        metadata_content_type: 'application/pdf',
        metadata_creation_date: '2023-01-15'
      }]
    });
    
    render(<ConstitutionalArchiveHomepage />);
    
    // Perform search
    const searchInput = screen.getByLabelText('Search constitutional documents');
    await userEvent.type(searchInput, 'property rights');
    
    const searchButton = screen.getByRole('button', { name: /Search/ });
    fireEvent.click(searchButton);
    
    // Wait for results
    await waitFor(() => {
      // Check for the highlighted text
      const mark = screen.getByText('property rights');
      expect(mark.tagName).toBe('MARK');
    });
  });
});