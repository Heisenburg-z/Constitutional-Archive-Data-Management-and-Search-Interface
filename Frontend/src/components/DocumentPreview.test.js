import { render, screen, fireEvent, within } from '@testing-library/react';
import DocumentPreviewShowcase from './DocumentPreview';
import { BookMarked, ExternalLink, Download, Info, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  BookMarked: () => <div>BookMarkedIcon</div>,
  ExternalLink: () => <div>ExternalLinkIcon</div>,
  Download: () => <div>DownloadIcon</div>,
  Info: () => <div>InfoIcon</div>,
  X: () => <div>XIcon</div>,
  ChevronLeft: () => <div>ChevronLeftIcon</div>,
  ChevronRight: () => <div>ChevronRightIcon</div>,
  Search: () => <div>SearchIcon</div>,
}));

describe('DocumentPreviewShowcase', () => {
  const featuredDocuments = [
    {
      id: 1,
      title: "Constitution Tenth Amendment Act",
      description: "Test description 1",
      url: "http://test.com/doc1.pdf",
      category: "Amendments",
      country: "South Africa",
      date: "2023",
      color: "blue",
      previewText: "Test preview text 1",
    },
    {
      id: 2,
      title: "Chapter 1: Founding Provisions",
      description: "Test description 2",
      url: "http://test.com/doc2.pdf",
      category: "Chapters",
      country: "South Africa",
      date: "1996",
      color: "green",
      previewText: "Test preview text 2",
    }
  ];

  beforeEach(() => {
    // Mock the featuredDocuments if they're imported from another file
    jest.mock('./featuredDocuments', () => ({
      featuredDocuments: featuredDocuments
    }));
  });

  it('renders the component with initial featured document', () => {
    render(<DocumentPreviewShowcase />);
    
    expect(screen.getByText('Featured Constitutional Documents')).toBeInTheDocument();
    expect(screen.getByText('Constitution Tenth Amendment Act')).toBeInTheDocument();
    expect(screen.getByText('Amendments')).toBeInTheDocument();
    expect(screen.getByText('Test preview text 1')).toBeInTheDocument();
  });

  it('navigates between documents using next/prev buttons', () => {
    render(<DocumentPreviewShowcase />);
    
    // Click next button
    fireEvent.click(screen.getByLabelText('Go to next document'));
    expect(screen.getByText('Chapter 1: Founding Provisions')).toBeInTheDocument();
    
    // Click prev button
    fireEvent.click(screen.getByLabelText('Go to previous document'));
    expect(screen.getByText('Constitution Tenth Amendment Act')).toBeInTheDocument();
  });

  it('navigates using the dot indicators', () => {
    render(<DocumentPreviewShowcase />);
    
    // Get all dot indicators
    const dots = screen.getAllByRole('button', { name: /Go to document/ });
    fireEvent.click(dots[1]);
    
    expect(screen.getByText('Chapter 1: Founding Provisions')).toBeInTheDocument();
  });

  it('toggles between featured view and all documents view', () => {
    render(<DocumentPreviewShowcase />);
    
    // Click browse all button
    const browseButton = screen.getByText('Browse All Documents');
    fireEvent.click(browseButton);
    
    // Should show search and all documents
    expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
    expect(screen.getByText('All Documents')).toBeInTheDocument();
    
    // Click back button
    const backButton = screen.getByText('Back to Featured View');
    fireEvent.click(backButton);
    
    // Should show featured view again
    expect(screen.getByText('Featured Constitutional Documents')).toBeInTheDocument();
  });

  it('filters documents when searching', () => {
    render(<DocumentPreviewShowcase />);
    
    // Switch to all documents view
    fireEvent.click(screen.getByText('Browse All Documents'));
    
    // Type in search
    const searchInput = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(searchInput, { target: { value: 'Amendment' } });
    
    // Should only show matching documents
    expect(screen.getByText('Constitution Tenth Amendment Act')).toBeInTheDocument();
    expect(screen.queryByText('Chapter 1: Founding Provisions')).not.toBeInTheDocument();
  });

  it('opens and closes the document details modal', () => {
    render(<DocumentPreviewShowcase />);
    
    // Click details button
    fireEvent.click(screen.getByText('Details'));
    
    // Modal should open with document details
    expect(screen.getByText('Document Preview')).toBeInTheDocument();
    expect(screen.getByText('Related Information')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(screen.getByText('XIcon'));
    expect(screen.queryByText('Document Preview')).not.toBeInTheDocument();
  });

  // Add to your existing test file
it('renders document preview with all props', () => {
    render(<DocumentPreviewShowcase />);
    expect(screen.getByText('Explore Constitutional History')).toBeInTheDocument();
  });
  
  it('shows loading state during searches', async () => {
    render(<DocumentPreviewShowcase />);
    
    fireEvent.click(screen.getByText('Browse All Documents'));
    const input = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(input, { target: { value: 'Amendment' } });
    
    // Add mock API delay handling if needed
    expect(await screen.findByText('Constitution Tenth Amendment Act')).toBeInTheDocument();
  });
  
  it('handles empty search results', async () => {
    render(<DocumentPreviewShowcase />);
    
    fireEvent.click(screen.getByText('Browse All Documents'));
    const input = screen.getByPlaceholderText('Search documents...');
    fireEvent.change(input, { target: { value: 'NonExistent' } });
    
    expect(await screen.findByText('No documents found')).toBeInTheDocument(); // Add this UI element
  });

  it('downloads document when download button is clicked', () => {
    render(<DocumentPreviewShowcase />);
    
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
    
    // Click download button
    fireEvent.click(screen.getByText('Download'));
    
    // Should update window.location.href
    expect(window.location.href).toBe('http://test.com/doc1.pdf');
  });

  it('shows correct document when clicked in all documents view', () => {
    render(<DocumentPreviewShowcase />);
    
    // Switch to all documents view
    fireEvent.click(screen.getByText('Browse All Documents'));
    
    // Click on second document's details button
    const allDetailsButtons = screen.getAllByText('Details');
    fireEvent.click(allDetailsButtons[1]);
    
    // Modal should show second document
    expect(screen.getByText('Chapter 1: Founding Provisions')).toBeInTheDocument();
  });
});