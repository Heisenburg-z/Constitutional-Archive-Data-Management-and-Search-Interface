import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentPreviewShowcase from './DocumentPreview';

// Mock fetch API
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'blob:mockurl');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement for download
const mockAnchorElement = {
  href: '',
  download: '',
  click: jest.fn(),
};
document.createElement = jest.fn(() => mockAnchorElement);

describe('DocumentPreviewShowcase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for fetch
    global.fetch.mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['mock pdf content'], { type: 'application/pdf' })
    });
  });

  it('renders featured documents section initially', () => {
    render(<DocumentPreviewShowcase />);
    
    // Check if the main title is rendered
    expect(screen.getByText('Featured Constitutional Documents')).toBeInTheDocument();
    
    // Check if the first document is displayed by default
    expect(screen.getByText('Constitution Tenth Amendment Act')).toBeInTheDocument();
    
    // Check if navigation UI is present
    expect(screen.getByLabelText('Go to document 1')).toBeInTheDocument();
    expect(screen.getByText('View Full Document')).toBeInTheDocument();
  });

  it('navigates between featured documents with arrows', () => {
    render(<DocumentPreviewShowcase />);
    
    // First document should be visible
    expect(screen.getByText('Constitution Tenth Amendment Act')).toBeInTheDocument();
    
    // Click next arrow
    const nextButton = screen.getByRole('button', { name: '' }).nextSibling;
    fireEvent.click(nextButton);
    
    // Second document should now be visible
    expect(screen.getByText('Chapter 1: Founding Provisions')).toBeInTheDocument();
    
    // Click previous arrow
    const prevButton = screen.getByRole('button', { name: '' });
    fireEvent.click(prevButton);
    
    // First document should be visible again
    expect(screen.getByText('Constitution Tenth Amendment Act')).toBeInTheDocument();
  });

  it('navigates to specific document using indicator dots', () => {
    render(<DocumentPreviewShowcase />);
    
    // Go to third document directly
    const thirdDot = screen.getByLabelText('Go to document 3');
    fireEvent.click(thirdDot);
    
    // Third document should be visible
    expect(screen.getByText('Chapter 2: Bill of Rights')).toBeInTheDocument();
  });

  it('toggles between featured and all documents views', () => {
    render(<DocumentPreviewShowcase />);
    
    // Initially in featured view
    expect(screen.getByText('Browse All Documents')).toBeInTheDocument();
    
    // Toggle to all documents view
    fireEvent.click(screen.getByText('Browse All Documents'));
    
    // Should now show all documents view
    expect(screen.getByText('All Documents')).toBeInTheDocument();
    expect(screen.getByText('Back to Featured View')).toBeInTheDocument();
    
    // Toggle back to featured view
    fireEvent.click(screen.getByText('Back to Featured View'));
    
    // Should be back to featured view
    expect(screen.getByText('Browse All Documents')).toBeInTheDocument();
  });

  it('opens and closes document details modal', () => {
    render(<DocumentPreviewShowcase />);
    
    // Open modal for current document
    fireEvent.click(screen.getByText('Details'));
    
    // Modal should be visible
    expect(screen.getByText('Related Information')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    
    // Modal should be closed
    expect(screen.queryByText('Related Information')).not.toBeInTheDocument();
  });

  it('filters documents when searching in all documents view', () => {
    render(<DocumentPreviewShowcase />);
    
    // Switch to all documents view
    fireEvent.click(screen.getByText('Browse All Documents'));
    
    // All 6 documents should be visible
    expect(screen.getAllByText('View Document').length).toBe(6);
    
    // Search for "Bill of Rights"
    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Bill of Rights' } });
    
    // Only one document should remain
    expect(screen.getAllByText('View Document').length).toBe(1);
    expect(screen.getByText('Chapter 2: Bill of Rights')).toBeInTheDocument();
    
    // Clear search
    fireEvent.change(searchInput, { target: { value: '' } });
    
    // All documents should be visible again
    expect(screen.getAllByText('View Document').length).toBe(6);
  });

  it('attempts to download document successfully', async () => {
    render(<DocumentPreviewShowcase />);
    
    // Click download button
    fireEvent.click(screen.getByText('Download'));
    
    // Check if download is in progress
    expect(screen.getByText('Downloading...')).toBeInTheDocument();
    
    // Wait for download to complete
    await waitFor(() => {
      expect(screen.getByText('Download successful!')).toBeInTheDocument();
    });
    
    // Verify download was triggered
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(mockAnchorElement.download).toBe('Constitution_Tenth_Amendment_Act.pdf');
  });

  it('handles download failure gracefully', async () => {
    // Mock fetch to fail
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    global.fetch.mockRejectedValueOnce(new Error('Proxy error'));
    
    // Mock window.open for fallback
    const originalOpen = window.open;
    window.open = jest.fn();
    
    render(<DocumentPreviewShowcase />);
    
    // Click download button
    fireEvent.click(screen.getByText('Download'));
    
    // Wait for download to fail
    await waitFor(() => {
      expect(screen.getByText('Download failed. Try again.')).toBeInTheDocument();
    });
    
    // Check if fallback was used
    expect(window.open).toHaveBeenCalled();
    
    // Restore original window.open
    window.open = originalOpen;
  });

  it('prevents clicking download button during download', async () => {
    // Use a slow resolving promise to simulate a long download
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          blob: async () => new Blob(['mock pdf content'], { type: 'application/pdf' })
        }), 100)
      )
    );
    
    render(<DocumentPreviewShowcase />);
    
    // Click download button
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    // Button should be disabled while downloading
    expect(downloadButton.closest('button')).toBeDisabled();
    
    // Wait for download to complete
    await waitFor(() => {
      expect(screen.getByText('Download successful!')).toBeInTheDocument();
    });
    
    // Button should be enabled again
    expect(downloadButton.closest('button')).not.toBeDisabled();
  });

  it('handles empty blobs during download', async () => {
    // Mock fetch to return empty blob
    global.fetch.mockResolvedValueOnce({
      ok: true,
      blob: async () => new Blob([], { type: 'application/pdf' })
    });
    
    render(<DocumentPreviewShowcase />);
    
    // Click download button
    fireEvent.click(screen.getByText('Download'));
    
    // Wait for download to fail
    await waitFor(() => {
      expect(screen.getByText('Download failed. Try again.')).toBeInTheDocument();
    });
  });

  it('applies correct color classes based on document color', () => {
    render(<DocumentPreviewShowcase />);
    
    // First document should have blue color scheme
    expect(screen.getByText('Constitution Tenth Amendment Act').closest('div')).toHaveClass('bg-blue-100');
    
    // Go to second document
    fireEvent.click(screen.getByLabelText('Go to document 2'));
    
    // Second document should have green color scheme
    expect(screen.getByText('Chapter 1: Founding Provisions').closest('div')).toHaveClass('bg-green-100');
  });
});