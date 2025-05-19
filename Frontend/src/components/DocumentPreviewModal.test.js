// This file contains tests for the DocumentPreviewModal component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentPreviewModal from '../components/DocumentPreviewModal';

// Mock modules
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Create a more comprehensive test for the download functionality
describe('Document Download Service', () => {
  // Setup document and URL mocks
  const mockDocument = {
    name: 'Test PDF',
    title: 'Test Document',
    fileType: 'application/pdf',
    url: 'https://example.com/test.pdf',
    contentUrl: 'https://example.com/content/test.pdf'
  };

  // Mock all required global functions
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock fetch API
    global.fetch = jest.fn();
    
    // Mock document methods for anchor creation and manipulation
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn()
    };
    
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return document.createElement.mock.originalImplementation(tag);
    });
    
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
    
    // Mock window.open for fallback download
    window.open = jest.fn();
  });

  test('downloads document with direct URL when available', async () => {
    // Mock successful response
    const mockBlob = new Blob(['test content'], { type: 'application/pdf' });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValueOnce(mockBlob)
    });

    // Render the component
    const mockOnClose = jest.fn();
    render(<DocumentPreviewModal document={mockDocument} onClose={mockOnClose} />);
    
    // Trigger download
    fireEvent.click(screen.getByText('Download'));
    
    // Verify download process
    await waitFor(() => {
      // Should call fetch with the content URL
      expect(global.fetch).toHaveBeenCalledWith(mockDocument.contentUrl);
      
      // Should create blob URL
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      
      // Should create anchor element
      expect(document.createElement).toHaveBeenCalledWith('a');
      
      // Should set correct properties on anchor
      const anchor = document.createElement.mock.results[0].value;
      expect(anchor.href).toBe('blob:mock-url');
      expect(anchor.download).toMatch(/Test Document\.pdf/);
      
      // Should add anchor to DOM, click it, and remove it
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(anchor.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      
      // Should revoke blob URL
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  test('handles download error by showing error message', async () => {
    // Mock failed fetch
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    // Get toast.error mock from the import
    const { toast } = require('react-toastify');
    
    // Render component
    render(<DocumentPreviewModal document={mockDocument} onClose={jest.fn()} />);
    
    // Trigger download
    fireEvent.click(screen.getByText('Download'));
    
    // Verify error handling
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
      expect(toast.error.mock.calls[0][0]).toMatch(/Network error|Download failed/);
    });
  });

  test('handles empty blob response', async () => {
    // Mock successful response but with empty blob
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValueOnce(new Blob([], { type: 'application/pdf' }))
    });
    
    // Get toast.error mock from the import
    const { toast } = require('react-toastify');
    
    // Render component with DocumentPreviewShowcase component using the downloadDocument function
    // We're testing this functionality on DocumentPreviewModal but the same would
    // apply to the DocumentPreview component
    render(<DocumentPreviewModal document={mockDocument} onClose={jest.fn()} />);
    
    // Trigger download
    fireEvent.click(screen.getByText('Download'));
    
    // Verify behavior (no error but download should happen)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      const anchor = document.createElement.mock.results[0].value;
      expect(anchor.click).toHaveBeenCalled();
    });
  });

  test('appends SAS token when needed for Azure blob storage URLs', async () => {
    // Document with Azure blob storage URL
    const azureDoc = {
      ...mockDocument,
      contentUrl: undefined, // Only has url property
      url: 'https://ndlovu.blob.core.windows.net/constitutional-archive/test.pdf'
    };
    
    // Mock successful response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValueOnce(new Blob(['test content'], { type: 'application/pdf' }))
    });
    
    // Render component
    render(<DocumentPreviewModal document={azureDoc} onClose={jest.fn()} />);
    
    // Trigger download
    fireEvent.click(screen.getByText('Download'));
    
    // Verify SAS token was appended to URL
    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls[0][0];
      expect(fetchCall).toContain('https://ndlovu.blob.core.windows.net/constitutional-archive/test.pdf');
      expect(fetchCall).toContain('sp=racwdl');
      expect(fetchCall).toContain('sig=');
    });
  });
});

// utils.test.js
// This is a standalone test file to test color utility functions

import { getColorClasses } from '../utils/colors';

// Since getColorClasses is imported in CategoriesSection.js, we create a test for it
describe('getColorClasses utility', () => {
  test('returns the correct color classes for blue', () => {
    const blueClasses = getColorClasses('blue');
    expect(blueClasses).toEqual({
      bg: "bg-blue-100",
      hoverBg: "hover:bg-blue-200",
      border: "border-blue-300",
      text: "text-blue-800",
      badge: "bg-blue-200 text-blue-800",
      accent: "bg-blue-600"
    });
  });

  test('returns the correct color classes for green', () => {
    const greenClasses = getColorClasses('green');
    expect(greenClasses).toEqual({
      bg: "bg-green-100",
      hoverBg: "hover:bg-green-200",
      border: "border-green-300",
      text: "text-green-800",
      badge: "bg-green-200 text-green-800",
      accent: "bg-green-600"
    });
  });

  test('returns blue as default when an invalid color is provided', () => {
    const defaultClasses = getColorClasses('invalidColor');
    const blueClasses = getColorClasses('blue');
    expect(defaultClasses).toEqual(blueClasses);
  });

  test('handles all available colors', () => {
    const colors = ['blue', 'green', 'red', 'purple', 'amber', 'teal'];
    
    colors.forEach(color => {
      const colorClasses = getColorClasses(color);
      expect(colorClasses.bg).toBe(`bg-${color}-100`);
      expect(colorClasses.border).toBe(`border-${color}-300`);
      expect(colorClasses.accent).toBe(`bg-${color}-600`);
    });
  });
});