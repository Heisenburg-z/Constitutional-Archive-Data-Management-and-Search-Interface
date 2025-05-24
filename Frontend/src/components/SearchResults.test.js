import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchResults } from './SearchResults';
import * as colorUtils from '../utils/colors';

// Mock the color utils
jest.mock('../utils/colors', () => ({
  getColorClasses: jest.fn(),
  escapeRegExp: jest.fn()
}));

describe('SearchResults Component', () => {
  const mockClearSearch = jest.fn();
  
  const mockSearchResults = {
    query: 'constitution',
    count: 2,
    results: [
      {
        id: '1',
        name: 'US Constitution',
        snippet: 'We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common Defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.',
        url: 'https://example.com/constitution.pdf',
        type: 'application/pdf',
        date: '2023-01-15T10:30:00.000Z'
      },
      {
        id: '2',
        name: 'Constitutional Amendment I',
        snippet: 'Congress shall make no law respecting an establishment of religion, or prohibiting the free exercise thereof; or abridging the freedom of speech, or of the press; or the right of the people peaceably to assemble, and to petition the Government for a redress of grievances.',
        url: 'https://example.com/amendment1.html',
        type: 'text/html',
        date: '2023-02-20T14:45:00.000Z'
      }
    ]
  };

  const mockColorClasses = {
    border: 'border-blue-500',
    bg: 'bg-blue-100',
    accent: 'bg-blue-600',
    badge: 'bg-blue-200 text-blue-800'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    colorUtils.getColorClasses.mockReturnValue(mockColorClasses);
    colorUtils.escapeRegExp.mockImplementation((str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  });

  describe('Rendering', () => {
    test('renders search results header with query and count', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('Results for:')).toBeInTheDocument();
      expect(screen.getByText('"constitution"')).toBeInTheDocument();
      expect(screen.getByText('2 results')).toBeInTheDocument();
    });

    test('renders singular result count when count is 1', () => {
      const singleResult = { ...mockSearchResults, count: 1, results: [mockSearchResults.results[0]] };
      render(<SearchResults searchResults={singleResult} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('1 result')).toBeInTheDocument();
    });

    test('renders all search results', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('US Constitution')).toBeInTheDocument();
      expect(screen.getByText('Constitutional Amendment I')).toBeInTheDocument();
    });

    test('renders search result snippets with highlighted query terms', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      const snippets = screen.getAllByText(/We the People|Congress shall make/);
      expect(snippets.length).toBeGreaterThan(0);
    });

    test('renders clear results button', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByRole('button', { name: /clear results/i })).toBeInTheDocument();
    });
  });

  describe('Document Categories and Icons', () => {
    test('displays PDF document category and icon for PDF files', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('PDF Document')).toBeInTheDocument();
      expect(screen.getByText('📄')).toBeInTheDocument();
    });

    test('displays Web Document category and icon for HTML files', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('Web Document')).toBeInTheDocument();
      expect(screen.getByText('🌐')).toBeInTheDocument();
    });

    test('displays Amendment category for amendment documents', () => {
      const amendmentResult = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          name: 'Amendment XV - Voting Rights',
          type: 'text/plain' // Non-specific type so name takes precedence
        }]
      };
      
      render(<SearchResults searchResults={amendmentResult} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('Amendment')).toBeInTheDocument();
    });

    test('displays Word Document category for Word files', () => {
      const wordResult = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          name: 'Document.docx'
        }]
      };
      
      render(<SearchResults searchResults={wordResult} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('Word Document')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    test('displays Constitution category for constitution documents', () => {
      const constitutionResult = {
        ...mockSearchResults,
        count: 1,
        results: [{
          id: '1',
          name: 'State Constitution Document',
          snippet: 'This is a state constitution document.',
          url: 'https://example.com/constitution.pdf',
          type: 'text/plain'
        }]
      };
      
      render(<SearchResults searchResults={constitutionResult} clearSearch={mockClearSearch} />);
      
      // Look for the Constitution category badge specifically by finding all instances and checking for the badge
      const constitutionElements = screen.getAllByText('Constitution');
      const categoryBadge = constitutionElements.find(el => 
        el.closest('.rounded-full') && el.closest('.text-xs')
      );
      expect(categoryBadge).toBeInTheDocument();
    });

    test('displays Chapter category for chapter documents', () => {
      const chapterResult = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          name: 'Chapter 1 - Introduction',
          type: 'text/plain'
        }]
      };
      
      render(<SearchResults searchResults={chapterResult} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('Chapter')).toBeInTheDocument();
    });

    test('displays Schedule category for schedule documents', () => {
      const scheduleResult = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          name: 'Schedule A - Definitions',
          type: 'text/plain'
        }]
      };
      
      render(<SearchResults searchResults={scheduleResult} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('Schedule')).toBeInTheDocument();
    });

    test('displays default Document category and icon for unknown file types', () => {
      const unknownResult = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          type: 'unknown/type',
          name: 'Unknown File'
        }]
      };
      
      render(<SearchResults searchResults={unknownResult} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('Document')).toBeInTheDocument();
      expect(screen.getByText('📁')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    // test('displays formatted date when date is provided', () => {
    //   render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
    //   expect(screen.getByText(/Last modified: \d{1,2}\/\d{1,2}\/\d{4}/)).toBeInTheDocument();
    // });

    test('handles missing date gracefully', () => {
      const noDateResults = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          date: null
        }]
      };
      
      render(<SearchResults searchResults={noDateResults} clearSearch={mockClearSearch} />);
      
      expect(screen.queryByText(/Last modified:/)).not.toBeInTheDocument();
    });

    test('handles invalid date gracefully', () => {
      const invalidDateResults = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          date: 'invalid-date'
        }]
      };
      
      render(<SearchResults searchResults={invalidDateResults} clearSearch={mockClearSearch} />);
      
      // Should not crash and might show Invalid Date or nothing
      expect(screen.getByText('US Constitution')).toBeInTheDocument();
    });
  });

  describe('Search Query Highlighting', () => {
    test('highlights search query terms in snippets', () => {
      colorUtils.escapeRegExp.mockReturnValue('constitution');
      
      const highlightResults = {
        query: 'constitution',
        count: 1,
        results: [{
          id: '1',
          name: 'Test Document',
          snippet: 'This is about the constitution and constitutional law.',
          url: 'https://example.com/test.pdf',
          type: 'application/pdf'
        }]
      };
      
      render(<SearchResults searchResults={highlightResults} clearSearch={mockClearSearch} />);
      
      // Check that the escapeRegExp function was called
      expect(colorUtils.escapeRegExp).toHaveBeenCalledWith('constitution');
    });

    test('handles case-insensitive highlighting', () => {
      const caseInsensitiveResults = {
        query: 'CONSTITUTION',
        count: 1,
        results: [{
          id: '1',
          name: 'Test Document',
          snippet: 'This constitution and Constitution should be highlighted.',
          url: 'https://example.com/test.pdf',
          type: 'application/pdf'
        }]
      };
      
      render(<SearchResults searchResults={caseInsensitiveResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('constitution')).toBeInTheDocument();
    });
  });

  describe('Color Coding', () => {
    test('applies different colors to different results', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      // Should call getColorClasses for each result with different colors
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('blue');
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('green');
    });

    test('cycles through colors for multiple results', () => {
      const manyResults = {
        ...mockSearchResults,
        count: 7,
        results: Array.from({ length: 7 }, (_, i) => ({
          id: String(i + 1),
          name: `Document ${i + 1}`,
          snippet: 'Test snippet',
          url: `https://example.com/doc${i + 1}.pdf`,
          type: 'application/pdf'
        }))
      };
      
      render(<SearchResults searchResults={manyResults} clearSearch={mockClearSearch} />);
      
      // Should cycle through colors (blue, green, red, purple, amber, teal, blue again)
      const expectedColors = ['blue', 'green', 'red', 'purple', 'amber', 'teal', 'blue'];
      expectedColors.forEach(color => {
        expect(colorUtils.getColorClasses).toHaveBeenCalledWith(color);
      });
    });
  });

  describe('User Interactions', () => {
    test('calls clearSearch when clear button is clicked', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      const clearButton = screen.getByRole('button', { name: /clear results/i });
      fireEvent.click(clearButton);
      
      expect(mockClearSearch).toHaveBeenCalledTimes(1);
    });

    test('renders clickable document links', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      const viewButtons = screen.getAllByText('View Document');
      expect(viewButtons).toHaveLength(2);
      
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveAttribute('href', 'https://example.com/constitution.pdf');
      expect(links[1]).toHaveAttribute('href', 'https://example.com/amendment1.html');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty search results', () => {
      const emptyResults = {
        query: 'nonexistent',
        count: 0,
        results: []
      };
      
      render(<SearchResults searchResults={emptyResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('0 results')).toBeInTheDocument();
      expect(screen.getByText('"nonexistent"')).toBeInTheDocument();
    });

    test('handles results without URLs', () => {
      const noUrlResults = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          url: ''
        }]
      };
      
      render(<SearchResults searchResults={noUrlResults} clearSearch={mockClearSearch} />);
      
      const link = screen.getAllByRole('link')[0];
      expect(link).toHaveAttribute('href', '');
    });

    test('handles results without snippets', () => {
      const noSnippetResults = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          snippet: ''
        }]
      };
      
      render(<SearchResults searchResults={noSnippetResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('US Constitution')).toBeInTheDocument();
    });

    test('handles very long document names', () => {
      const longNameResults = {
        ...mockSearchResults,
        results: [{
          ...mockSearchResults.results[0],
          name: 'This is a very long document name that should be truncated properly to avoid layout issues'
        }]
      };
      
      render(<SearchResults searchResults={longNameResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByText('This is a very long document name that should be truncated properly to avoid layout issues')).toBeInTheDocument();
    });

    test('handles special characters in query highlighting', () => {
      const specialCharResults = {
        query: 'test[regex]',
        count: 1,
        results: [{
          id: '1',
          name: 'Test Document',
          snippet: 'This contains test[regex] special characters.',
          url: 'https://example.com/test.pdf',
          type: 'application/pdf'
        }]
      };
      
      render(<SearchResults searchResults={specialCharResults} clearSearch={mockClearSearch} />);
      
      expect(colorUtils.escapeRegExp).toHaveBeenCalledWith('test[regex]');
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA roles and labels', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      expect(screen.getByRole('button', { name: /clear results/i })).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(2);
    });

    test('provides meaningful link text', () => {
      render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      const viewDocumentLinks = screen.getAllByText('View Document');
      expect(viewDocumentLinks).toHaveLength(2);
    });
  });

  describe('Responsive Layout', () => {
    test('applies responsive grid classes', () => {
      const { container } = render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      const gridContainer = container.querySelector('.grid-cols-1.lg\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('Animation and Styling', () => {
    test('applies animation classes', () => {
      const { container } = render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      const animatedSection = container.querySelector('.animate-fade-in');
      expect(animatedSection).toBeInTheDocument();
    });

    test('applies hover and transition classes', () => {
      const { container } = render(<SearchResults searchResults={mockSearchResults} clearSearch={mockClearSearch} />);
      
      const hoverElements = container.querySelectorAll('.hover\\:shadow-xl');
      expect(hoverElements.length).toBeGreaterThan(0);
    });
  });
});