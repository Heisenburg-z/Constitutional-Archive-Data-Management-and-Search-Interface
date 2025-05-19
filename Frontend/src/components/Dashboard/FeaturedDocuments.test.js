// src/components/Dashboard/__tests__/FeaturedDocuments.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FeaturedDocuments from './FeaturedDocuments';

// Mock the file utils
jest.mock('../../utils/fileUtils', () => ({
  getFileIcon: jest.fn(() => <span data-testid="mock-file-icon" />),
  formatFileSize: jest.fn((size) => `${size} KB`)
}));

describe('FeaturedDocuments Component', () => {
  // Mock data for component props
  const mockRecentUploads = [
    {
      _id: 'doc1',
      name: 'Test Document 1',
      fileType: 'pdf',
      type: 'Report',
      fileSize: 1024,
      createdAt: '2025-05-01T12:00:00Z',
      updatedAt: '2025-05-02T14:30:00Z',
      contentUrl: 'https://example.com/doc1'
    },
    {
      _id: 'doc2',
      name: 'Test Document 2',
      fileType: 'docx',
      type: 'Contract',
      fileSize: 2048,
      createdAt: '2025-05-03T10:15:00Z',
      updatedAt: '2025-05-03T16:45:00Z',
      contentUrl: 'https://example.com/doc2'
    }
  ];

  // Mock functions for component props
  const mockProps = {
    recentUploads: mockRecentUploads,
    currentDocIndex: 0,
    nextDocument: jest.fn(),
    prevDocument: jest.fn(),
    goToDocumentIndex: jest.fn(),
    handleDownloadDocument: jest.fn(),
    handleEditMetadata: jest.fn(),
    setDocumentToDelete: jest.fn(),
    downloadingDocs: {},
    isDeleting: false,
    setShowUploadModal: jest.fn()
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders correctly with documents', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Check if title is rendered
    expect(screen.getByText('Featured Documents')).toBeInTheDocument();
    
    // Check if current document is displayed
    expect(screen.getByText('Test Document 1')).toBeInTheDocument();
    expect(screen.getByText('Report')).toBeInTheDocument();
    //expect(screen.getByText('1024 KB')).toBeInTheDocument();
    
    // Check if action buttons are rendered
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('New Upload')).toBeInTheDocument();
  });

  test('returns null when no documents are available', () => {
    const { container } = render(
      <FeaturedDocuments {...mockProps} recentUploads={[]} />
    );
    
    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  test('calls nextDocument when next button is clicked', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Find and click the next button (using aria-label)
    const nextButton = screen.getByLabelText('Go to next document');
    fireEvent.click(nextButton);
    
    expect(mockProps.nextDocument).toHaveBeenCalledTimes(1);
  });

  test('calls prevDocument when previous button is clicked', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Find and click the previous button
    const prevButton = screen.getByLabelText('Go to previous document');
    fireEvent.click(prevButton);
    
    expect(mockProps.prevDocument).toHaveBeenCalledTimes(1);
  });

  test('calls goToDocumentIndex when document indicator is clicked', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Find and click the second document indicator
    const docIndicators = screen.getAllByLabelText(/Go to document \d+/);
    fireEvent.click(docIndicators[1]); // Second document indicator
    
    expect(mockProps.goToDocumentIndex).toHaveBeenCalledWith(1);
  });

  test('calls handleDownloadDocument when Download button is clicked', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Find and click the Download button
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    expect(mockProps.handleDownloadDocument).toHaveBeenCalledWith(mockRecentUploads[0]);
  });

  test('calls handleEditMetadata when Edit button is clicked', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Find and click the Edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    expect(mockProps.handleEditMetadata).toHaveBeenCalledWith(mockRecentUploads[0]);
  });

  test('calls setDocumentToDelete when Delete button is clicked', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Find and click the Delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockProps.setDocumentToDelete).toHaveBeenCalledWith('doc1');
  });

  test('calls setShowUploadModal when New Upload button is clicked', () => {
    render(<FeaturedDocuments {...mockProps} />);
    
    // Find and click the New Upload button
    const uploadButton = screen.getByText('New Upload');
    fireEvent.click(uploadButton);
    
    expect(mockProps.setShowUploadModal).toHaveBeenCalledWith(true);
  });

  test('shows downloading state when a document is being downloaded', () => {
    const downloadingProps = {
      ...mockProps,
      downloadingDocs: { doc1: true }
    };
    
    render(<FeaturedDocuments {...downloadingProps} />);
    
    expect(screen.getByText('Downloading...')).toBeInTheDocument();
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
  });

  test('applies different gradients based on file type', () => {
    // Testing with PDF file type first
    const { rerender } = render(<FeaturedDocuments {...mockProps} />);
    
    // Check that PDF has the correct gradient class
    const gradientDiv = screen.getByText('Report').closest('div');
    expect(gradientDiv).toHaveClass('from-red-500');
    expect(gradientDiv).toHaveClass('to-pink-600');
    
    // Test with DOCX file type (switching to second document)
    rerender(<FeaturedDocuments {...mockProps} currentDocIndex={1} />);
    
    // Check that DOCX has the correct gradient class
    const newGradientDiv = screen.getByText('Contract').closest('div');
    expect(newGradientDiv).toHaveClass('from-blue-500');
    expect(newGradientDiv).toHaveClass('to-indigo-600');
  });

  test('disables download button when contentUrl is missing', () => {
    const propsWithoutUrl = {
      ...mockProps,
      recentUploads: [
        {
          ...mockRecentUploads[0],
          contentUrl: null
        }
      ]
    };
    
    render(<FeaturedDocuments {...propsWithoutUrl} />);
    
    const downloadButton = screen.getByText('Download');
    expect(downloadButton.closest('button')).toBeDisabled();
  });

  test('disables delete button when isDeleting is true', () => {
    const deletingProps = {
      ...mockProps,
      isDeleting: true
    };
    
    render(<FeaturedDocuments {...deletingProps} />);
    
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton.closest('button')).toBeDisabled();
  });
});