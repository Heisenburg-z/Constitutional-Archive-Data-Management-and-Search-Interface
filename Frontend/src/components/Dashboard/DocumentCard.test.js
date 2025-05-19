// src/components/Dashboard/__tests__/DocumentCard.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentCard from './DocumentCard';

// Mock the fileUtils dependency 
jest.mock('../../utils/fileUtils', () => ({
  getFileIcon: jest.fn(() => <span data-testid="mock-file-icon" />)
}));

describe('DocumentCard Component', () => {
  // Mock document data
  const mockDoc = {
    _id: 'doc123',
    name: 'Test Document',
    fileType: 'pdf',
    type: 'Report',
    fileSize: 2048, // 2KB
    createdAt: '2025-05-01T12:00:00Z'
  };

  // Mock functions for the component's props
  const mockProps = {
    doc: mockDoc,
    downloadingDocs: {},
    handlePreviewDocument: jest.fn(),
    handleEditMetadata: jest.fn(),
    handleDownloadDocument: jest.fn(),
    setDocumentToDelete: jest.fn(),
    isDeleting: false
  };

  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  test('renders document information correctly', () => {
    render(<DocumentCard {...mockProps} />);
    
    // Check document name is displayed
    expect(screen.getByText('Test Document')).toBeInTheDocument();
    
    // Check document type is displayed
    expect(screen.getByText('Report')).toBeInTheDocument();
    
    // Check date is formatted correctly
    expect(screen.getByText(new Date(mockDoc.createdAt).toLocaleDateString())).toBeInTheDocument();
    
    // Check file size is calculated and displayed correctly
    expect(screen.getByText('2.00 KB')).toBeInTheDocument();
  });

  test('renders file icon correctly', () => {
    render(<DocumentCard {...mockProps} />);
    
    // Check if the mocked file icon is rendered
    expect(screen.getByTestId('mock-file-icon')).toBeInTheDocument();
  });

  test('calls handlePreviewDocument when Preview button is clicked', () => {
    render(<DocumentCard {...mockProps} />);
    
    // Find and click the Preview button
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);
    
    // Check if the handlePreviewDocument function was called with the document
    expect(mockProps.handlePreviewDocument).toHaveBeenCalledTimes(1);
    expect(mockProps.handlePreviewDocument).toHaveBeenCalledWith(mockDoc);
  });

  test('calls handleEditMetadata when Edit button is clicked', () => {
    render(<DocumentCard {...mockProps} />);
    
    // Find and click the Edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    
    // Check if the handleEditMetadata function was called with the document
    expect(mockProps.handleEditMetadata).toHaveBeenCalledTimes(1);
    expect(mockProps.handleEditMetadata).toHaveBeenCalledWith(mockDoc);
  });

  test('calls handleDownloadDocument when Download button is clicked', () => {
    render(<DocumentCard {...mockProps} />);
    
    // Find and click the Download button
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    // Check if the handleDownloadDocument function was called with the document
    expect(mockProps.handleDownloadDocument).toHaveBeenCalledTimes(1);
    expect(mockProps.handleDownloadDocument).toHaveBeenCalledWith(mockDoc);
  });

  test('calls setDocumentToDelete when Delete button is clicked', () => {
    render(<DocumentCard {...mockProps} />);
    
    // Find and click the Delete button
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    // Check if the setDocumentToDelete function was called with the document id
    expect(mockProps.setDocumentToDelete).toHaveBeenCalledTimes(1);
    expect(mockProps.setDocumentToDelete).toHaveBeenCalledWith(mockDoc._id);
  });

  test('shows downloading state when the document is being downloaded', () => {
    const downloadingProps = {
      ...mockProps,
      downloadingDocs: { [mockDoc._id]: true }
    };
    
    render(<DocumentCard {...downloadingProps} />);
    
    // Check if the "Downloading" text is shown instead of "Download"
    expect(screen.getByText('Downloading')).toBeInTheDocument();
    expect(screen.queryByText('Download')).not.toBeInTheDocument();
    
    // Check if the spinner is shown
    const spinner = screen.getByText('Downloading').previousSibling;
    expect(spinner).toHaveClass('animate-spin');
  });

  test('disables Download button when document is downloading', () => {
    const downloadingProps = {
      ...mockProps,
      downloadingDocs: { [mockDoc._id]: true }
    };
    
    render(<DocumentCard {...downloadingProps} />);
    
    // Find the Download button and check if it's disabled
    const downloadingText = screen.getByText('Downloading');
    const downloadButton = downloadingText.closest('button');
    expect(downloadButton).toBeDisabled();
  });

  test('disables Delete button when isDeleting is true', () => {
    const deletingProps = {
      ...mockProps,
      isDeleting: true
    };
    
    render(<DocumentCard {...deletingProps} />);
    
    // Find the Delete button and check if it's disabled
    const deleteButton = screen.getByText('Delete').closest('button');
    expect(deleteButton).toBeDisabled();
  });

  test('handles unknown file size correctly', () => {
    const docWithoutSize = {
      ...mockDoc,
      fileSize: null
    };
    
    render(<DocumentCard {...mockProps} doc={docWithoutSize} />);
    
    // Check if "Unknown size" is displayed when fileSize is null
    expect(screen.getByText('Unknown size')).toBeInTheDocument();
  });

  test('applies hover styling classes', () => {
    const { container } = render(<DocumentCard {...mockProps} />);
    
    // Check if the main container has hover classes
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('hover:shadow-md');
    expect(mainDiv).toHaveClass('transition-shadow');
    
    // Check if buttons have hover text color classes
    const previewButton = screen.getByText('Preview');
    expect(previewButton).toHaveClass('hover:text-blue-800');
    
    const editButton = screen.getByText('Edit');
    expect(editButton).toHaveClass('hover:text-purple-800');
    
    const downloadButton = screen.getByText('Download');
    expect(downloadButton).toHaveClass('hover:text-green-800');
    
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toHaveClass('hover:text-red-800');
  });
});