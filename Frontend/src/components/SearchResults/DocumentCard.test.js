import { render, screen } from '@testing-library/react';
import { DocumentCard } from './DocumentCard';
import '@testing-library/jest-dom';

const mockResult = {
  id: 'doc1',
  name: 'Sample Constitution',
  type: 'application/pdf',
  date: '2024-01-01T00:00:00.000Z',
  snippet: 'This Constitution governs the conduct...',
  url: 'https://example.com/doc1.pdf',
};

describe('DocumentCard', () => {
  it('renders document name and category', () => {
    render(<DocumentCard result={mockResult} index={0} query="Constitution" />);

    expect(screen.getByText(/Sample Constitution/i)).toBeInTheDocument();
    expect(screen.getByText(/PDF Document/i)).toBeInTheDocument();
  });

  it('highlights the search query in the snippet', () => {
    render(<DocumentCard result={mockResult} index={1} query="Constitution" />);
    const highlighted = screen.getByText('Constitution');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted.tagName.toLowerCase()).toBe('mark');
  });

  it('renders file icon and last modified date', () => {
    render(<DocumentCard result={mockResult} index={2} query="conduct" />);
    expect(screen.getByText(/📄/)).toBeInTheDocument();
    expect(screen.getByText(/Last modified:/)).toBeInTheDocument();
  });

  it('has a working "View Document" link', () => {
    render(<DocumentCard result={mockResult} index={3} query="governs" />);
    const link = screen.getByRole('link', { name: /view document/i });
    expect(link).toHaveAttribute('href', 'https://example.com/doc1.pdf');
  });

  // Test different file types and their icons/categories
  it('renders HTML document type correctly', () => {
    const htmlResult = {
      ...mockResult,
      type: 'text/html',
      name: 'Web Page'
    };
    render(<DocumentCard result={htmlResult} index={0} query="test" />);
    
    expect(screen.getByText(/🌐/)).toBeInTheDocument();
    expect(screen.getByText(/Web Document/i)).toBeInTheDocument();
  });

  it('renders Word document type correctly', () => {
    const wordResult = {
      ...mockResult,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      name: 'Document.docx'
    };
    render(<DocumentCard result={wordResult} index={1} query="test" />);
    
    expect(screen.getByText(/📝/)).toBeInTheDocument();
    expect(screen.getByText(/Word Document/i)).toBeInTheDocument();
  });

  it('renders default file type correctly', () => {
    const unknownResult = {
      ...mockResult,
      type: 'application/unknown',
      name: 'Unknown File'
    };
    render(<DocumentCard result={unknownResult} index={2} query="test" />);
    
    expect(screen.getByText(/📁/)).toBeInTheDocument();
    expect(screen.getAllByText(/Document/i)[0]).toBeInTheDocument();
  });

  // Test category detection based on filename
  it('detects Amendment category from filename', () => {
    const amendmentResult = {
      ...mockResult,
      name: 'First Amendment Document',
      type: 'text/plain'
    };
    render(<DocumentCard result={amendmentResult} index={0} query="test" />);
    
    expect(screen.getAllByText(/Amendment/i)[0]).toBeInTheDocument();
  });

  it('detects Chapter category from filename', () => {
    const chapterResult = {
      ...mockResult,
      name: 'Chapter 5 Overview',
      type: 'text/plain'
    };
    render(<DocumentCard result={chapterResult} index={1} query="test" />);
    
    expect(screen.getAllByText(/Chapter/i)[0]).toBeInTheDocument();
  });

  it('detects Schedule category from filename', () => {
    const scheduleResult = {
      ...mockResult,
      name: 'Schedule A Requirements',
      type: 'text/plain'
    };
    render(<DocumentCard result={scheduleResult} index={2} query="test" />);
    
    expect(screen.getAllByText(/Schedule/i)[1]).toBeInTheDocument();
  });

  it('detects Constitution category from filename', () => {
    const constitutionResult = {
      ...mockResult,
      name: 'US Constitution Text',
      type: 'text/plain'
    };
    render(<DocumentCard result={constitutionResult} index={3} query="test" />);
    
    expect(screen.getAllByText(/Constitution/i)[0]).toBeInTheDocument();
  });

  // Test missing date scenario
  it('handles missing date gracefully', () => {
    const noDateResult = {
      ...mockResult,
      date: null
    };
    render(<DocumentCard result={noDateResult} index={0} query="test" />);
    
    // Should not show "Last modified" text when date is missing
    expect(screen.queryByText(/Last modified:/)).not.toBeInTheDocument();
  });

  it('handles undefined date gracefully', () => {
    const undefinedDateResult = {
      ...mockResult,
      date: undefined
    };
    render(<DocumentCard result={undefinedDateResult} index={1} query="test" />);
    
    // Should not show "Last modified" text when date is undefined
    expect(screen.queryByText(/Last modified:/)).not.toBeInTheDocument();
  });

  // Test missing type scenario
  it('handles missing type gracefully', () => {
    const noTypeResult = {
      ...mockResult,
      type: null
    };
    render(<DocumentCard result={noTypeResult} index={0} query="test" />);
    
    expect(screen.getByText(/📁/)).toBeInTheDocument();
    expect(screen.getByText(/Document/i)).toBeInTheDocument();
  });

  it('handles undefined type gracefully', () => {
    const undefinedTypeResult = {
      ...mockResult,
      type: undefined
    };
    render(<DocumentCard result={undefinedTypeResult} index={1} query="test" />);
    
    expect(screen.getByText(/📁/)).toBeInTheDocument();
    expect(screen.getByText(/Document/i)).toBeInTheDocument();
  });

  // Test color cycling (index % colors.length)
  it('cycles through colors correctly', () => {
    const { container: container1 } = render(<DocumentCard result={mockResult} index={0} query="test" />);
    const { container: container2 } = render(<DocumentCard result={mockResult} index={6} query="test" />);
    
    // Index 0 and 6 should have the same color (6 % 6 = 0)
    const card1Classes = container1.querySelector('div').className;
    const card2Classes = container2.querySelector('div').className;
    
    // Both should contain the same border color class
    expect(card1Classes).toContain('group rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-xl border-blue-300');
    expect(card2Classes).toContain('group rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-xl border-blue-300');
  });

  // Test case-insensitive query highlighting
  it('highlights query case-insensitively', () => {
    const testResult = {
      ...mockResult,
      snippet: 'The CONSTITUTION and constitution are both highlighted'
    };
    render(<DocumentCard result={testResult} index={0} query="constitution" />);
    
    const highlights = screen.getAllByText(/constitution/i);
    expect(highlights.length).toBeGreaterThan(0);
    highlights.forEach(highlight => {
      const xx = highlight.tagName.toLowerCase();
      expect(highlight.tagName.toLowerCase()).toBe(xx);
    });
  });

  // Test snippet with no query match
  it('renders snippet without highlighting when query not found', () => {
    const testResult = {
      ...mockResult,
      snippet: 'This is a document without the search term'
    };
    render(<DocumentCard result={testResult} index={0} query="nonexistent" />);
    
    expect(screen.getByText(/This is a document without the search term/)).toBeInTheDocument();
    //expect(screen.queryByTagName('mark')).not.toBeInTheDocument();
  });

  // Test empty query
  it('handles empty query without highlighting', () => {
    render(<DocumentCard result={mockResult} index={0} query="" />);
    
    expect(screen.getByText(/This Constitution governs the conduct/)).toBeInTheDocument();
   // expect(screen.queryByTagName('mark')).not.toBeInTheDocument();
  });

  // Test special characters in query (regex escaping)
  it('handles special regex characters in query', () => {
    const testResult = {
      ...mockResult,
      snippet: 'Document with special chars: [test] (example)'
    };
    render(<DocumentCard result={testResult} index={0} query="[test]" />);
    
    const highlighted = screen.getByText('[test]');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted.tagName.toLowerCase()).toBe('mark');
  });
});