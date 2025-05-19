// src/components/Dashboard/__tests__/AllDocumentsView.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AllDocumentsView from './AllDocumentsView';

// Mock the DocumentCard component
jest.mock('./DocumentCard', () => {
  return function MockDocumentCard(props) {
    return (
      <div data-testid="document-card" onClick={() => props.handlePreviewDocument(props.doc)}>
        {props.doc.name}
      </div>
    );
  };
});

describe('AllDocumentsView Component', () => {
  // Mock data for component props
  const mockDocuments = [
    {
      _id: 'doc1',
      name: 'Test Document 1',
      fileType: 'pdf',
      type: 'Report',
      fileSize: 1024,
      createdAt: '2025-05-01T12:00:00Z',
      updatedAt: '2025-05-02T14:30:00Z'
    },
    {
      _id: 'doc2',
      name: 'Test Document 2',
      fileType: 'docx',
      type: 'Contract',
      fileSize: 2048,
      createdAt: '2025-05-03T10:15:00Z',
      updatedAt: '2025-05-03T16:45:00Z'
    }
  ];

  // Mock functions for component props
  const mockProps = {
    setCurrentView: jest.fn(),
    searchQuery: '',
    handleSearch: jest.fn(),
    filteredDocuments: mockDocuments,
    downloadingDocs: {},
    handlePreviewDocument: jest.fn(),
    handleEditMetadata: jest.fn(),
    handleDownloadDocument: jest.fn(),
    setDocumentToDelete: jest.fn(),
    isDeleting: false
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders section title and back button', () => {
    render(<AllDocumentsView {...mockProps} />);
    
    // Check if the section title is rendered
    expect(screen.getByText('All Documents')).toBeInTheDocument();
    
    // Check if back button is rendered
    expect(screen.getByText('Back to Featured View')).toBeInTheDocument();
  });

  test('calls setCurrentView with "featured" when back button is clicked', () => {
    render(<AllDocumentsView {...mockProps} />);
    
    // Find and click the back button
    const backButton = screen.getByText('Back to Featured View');
    fireEvent.click(backButton);
    
    // Check if setCurrentView was called with 'featured'
    expect(mockProps.setCurrentView).toHaveBeenCalledWith('featured');
  });

  test('renders search input with correct value', () => {
    const searchProps = {
      ...mockProps,
      searchQuery: 'test search'
    };
    
    render(<AllDocumentsView {...searchProps} />);
    
    // Find the search input and check its value
    const searchInput = screen.getByPlaceholderText('Search documents...');
    expect(searchInput.value).toBe('test search');
  });

  test('calls handleSearch when search input changes', () => {
    render(<AllDocumentsView {...mockProps} />);
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search documents...');
    
    // Simulate typing in the search input
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    
    // Check if handleSearch was called
    expect(mockProps.handleSearch).toHaveBeenCalled();
  });

  test('renders document cards for each filtered document', () => {
    render(<AllDocumentsView {...mockProps} />);
    
    // Check if document cards are rendered for each document
    const documentCards = screen.getAllByTestId('document-card');
    expect(documentCards.length).toBe(2);
    
    // Check if document names are displayed
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Test Document 2')).toBeInTheDocument();
  });

  test('displays "No documents found" when no documents are available', () => {
    const noDocsProps = {
      ...mockProps,
      filteredDocuments: []
    };
    
    render(<AllDocumentsView {...noDocsProps} />);
    
    // Check if "No documents found" message is displayed
    expect(screen.getByText('No documents found')).toBeInTheDocument();
    
    // Check that no document cards are rendered
    expect(screen.queryAllByTestId('document-card').length).toBe(0);
  });

  test('calls handlePreviewDocument when a document card is clicked', () => {
    render(<AllDocumentsView {...mockProps} />);
    
    // Find and click the first document card
    const documentCards = screen.getAllByTestId('document-card');
    fireEvent.click(documentCards[0]);
    
    // Check if handlePreviewDocument was called with the correct document
    expect(mockProps.handlePreviewDocument).toHaveBeenCalledWith(mockDocuments[0]);
  });

  test('passes necessary props to DocumentCard components', () => {
    // Using a simplified mock implementation to verify prop passing
    jest.unmock('../DocumentCard');
    jest.mock('../DocumentCard', () => {
      return function MockDocumentCard(props) {
        // Expose the props for testing
        return (
          <div data-testid="document-card-props">
            <div data-testid="document-card-doc">{props.doc._id}</div>
            <div data-testid="document-card-downloading">{JSON.stringify(props.downloadingDocs)}</div>
            <div data-testid="document-card-is-deleting">{props.isDeleting.toString()}</div>
          </div>
        );
      };
    });
    
    // Re-require the component to use the updated mock
    jest.resetModules();
    const AllDocumentsViewFresh = require('../AllDocumentsView').default;
    
    render(<AllDocumentsViewFresh {...mockProps} />);
    
    // Check if necessary props are passed to DocumentCard
    const docIdElements = screen.getAllByTestId('document-card-doc');
    expect(docIdElements[0].textContent).toBe('doc1');
    expect(docIdElements[1].textContent).toBe('doc2');
    
    const isDeleteElements = screen.getAllByTestId('document-card-is-deleting');
    expect(isDeleteElements[0].textContent).toBe('false');
    
    // Clean up
    jest.unmock('../DocumentCard');
  });

  test('renders search icon in search input', () => {
    const { container } = render(<AllDocumentsView {...mockProps} />);
    
    // Find the search input container
    const searchContainer = screen.getByPlaceholderText('Search documents...').parentElement;
    
    // Check if search icon is present
    const searchIcon = searchContainer.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });

  test('applies correct CSS classes for styling', () => {
    const { container } = render(<AllDocumentsView {...mockProps} />);
    
    // Check if the main document container has the correct classes
    const documentContainer = screen.getByText('All Documents').closest('section');
    expect(documentContainer).toBeInTheDocument();
    
    // Check search input styling
    const searchInput = screen.getByPlaceholderText('Search documents...');
    expect(searchInput).toHaveClass('rounded-lg');
    expect(searchInput).toHaveClass('focus:ring-blue-500');
    expect(searchInput).toHaveClass('focus:border-blue-500');
    
    // Check documents container styling
    const documentsContainer = screen.getAllByTestId('document-card')[0].parentElement;
    expect(documentsContainer).toHaveClass('grid');
    expect(documentsContainer).toHaveClass('gap-6');
  });
});