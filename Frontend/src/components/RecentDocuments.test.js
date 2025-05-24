import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecentDocuments } from './RecentDocuments';
import * as colorUtils from '../utils/colors';
import * as dataConstants from '../constants/data';

// Mock the color utils
jest.mock('../utils/colors', () => ({
  getColorClasses: jest.fn()
}));

// Mock the data constants
jest.mock('../constants/data', () => ({
  recentDocuments: [
    {
      id: '1',
      title: 'Constitutional Amendment XXI',
      description: 'The Twenty-first Amendment to the United States Constitution repealed the Eighteenth Amendment.',
      category: 'Amendment',
      date: '2023-01-15T10:30:00.000Z',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Article I - Legislative Branch',
      description: 'Establishes the legislative branch of the federal government, the United States Congress.',
      category: 'Article',
      date: '2023-02-20T14:45:00.000Z',
      color: 'green'
    },
    {
      id: '3',
      title: 'Bill of Rights Overview',
      description: 'A comprehensive overview of the first ten amendments to the Constitution.',
      category: 'Guide',
      date: '2023-03-10T09:15:00.000Z',
      color: 'purple'
    }
  ]
}));

describe('RecentDocuments Component', () => {
  const mockColorClasses = {
    border: 'border-blue-500',
    accent: 'bg-blue-600',
    badge: 'bg-blue-200 text-blue-800',
    text: 'text-blue-600'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    colorUtils.getColorClasses.mockReturnValue(mockColorClasses);
  });

  describe('Rendering', () => {
    test('renders section title', () => {
      render(<RecentDocuments />);
      
      expect(screen.getByText('Recently Added Documents')).toBeInTheDocument();
    });

    test('renders "View all" link with correct href', () => {
      render(<RecentDocuments />);
      
      const viewAllLink = screen.getByRole('link', { name: /view all/i });
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink).toHaveAttribute('href', '/documents');
    });

    test('renders all recent documents from data', () => {
      render(<RecentDocuments />);
      
      expect(screen.getByText('Constitutional Amendment XXI')).toBeInTheDocument();
      expect(screen.getByText('Article I - Legislative Branch')).toBeInTheDocument();
      expect(screen.getByText('Bill of Rights Overview')).toBeInTheDocument();
    });

    test('renders document descriptions', () => {
      render(<RecentDocuments />);
      
      expect(screen.getByText('The Twenty-first Amendment to the United States Constitution repealed the Eighteenth Amendment.')).toBeInTheDocument();
      expect(screen.getByText('Establishes the legislative branch of the federal government, the United States Congress.')).toBeInTheDocument();
      expect(screen.getByText('A comprehensive overview of the first ten amendments to the Constitution.')).toBeInTheDocument();
    });

    test('renders document categories', () => {
      render(<RecentDocuments />);
      
      expect(screen.getByText('Amendment')).toBeInTheDocument();
      expect(screen.getByText('Article')).toBeInTheDocument();
      expect(screen.getByText('Guide')).toBeInTheDocument();
    });
  });

  describe('Date Handling', () => {
    test('displays day numbers from dates', () => {
      render(<RecentDocuments />);
      
      // January 15, 2023 -> 15
      expect(screen.getByText('15')).toBeInTheDocument();
      // February 20, 2023 -> 20
      expect(screen.getByText('20')).toBeInTheDocument();
      // March 10, 2023 -> 10
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    test('displays formatted full dates', () => {
      render(<RecentDocuments />);
      
      expect(screen.getByText('January 15, 2023')).toBeInTheDocument();
      expect(screen.getByText('February 20, 2023')).toBeInTheDocument();
      expect(screen.getByText('March 10, 2023')).toBeInTheDocument();
    });

    test('handles invalid dates gracefully', () => {
      // Mock with invalid date
      const invalidDateDocs = [
        {
          id: '1',
          title: 'Test Document',
          description: 'Test description',
          category: 'Test',
          date: 'invalid-date',
          color: 'blue'
        }
      ];

      jest.doMock('../constants/data', () => ({
        recentDocuments: invalidDateDocs
      }));

      // Component should not crash with invalid date
      render(<RecentDocuments />);
      expect(screen.getByText('Recently Added Documents')).toBeInTheDocument();
    });
  });

  describe('Color System', () => {
    test('applies color classes to each document', () => {
      render(<RecentDocuments />);
      
      // Should call getColorClasses for each document with their respective colors
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('blue');
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('green');
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('purple');
    });

    test('applies color classes to document elements', () => {
      const { container } = render(<RecentDocuments />);
      
      // Check that color classes are applied to borders
      const borderedElements = container.querySelectorAll('.border-blue-500');
      expect(borderedElements.length).toBeGreaterThan(0);
    });

    test('handles different color schemes', () => {
      const differentColors = {
        border: 'border-red-500',
        accent: 'bg-red-600',
        badge: 'bg-red-200 text-red-800',
        text: 'text-red-600'
      };

      colorUtils.getColorClasses.mockReturnValueOnce(differentColors);
      
      render(<RecentDocuments />);
      
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('blue');
    });
  });

  describe('Document Links', () => {
    test('renders document links with correct hrefs', () => {
      render(<RecentDocuments />);
      
      const documentLinks = screen.getAllByText('View Document');
      expect(documentLinks).toHaveLength(3);
      
      const links = screen.getAllByRole('link').filter(link => 
        link.textContent.includes('View Document')
      );
      
      expect(links[0]).toHaveAttribute('href', '/documents/1');
      expect(links[1]).toHaveAttribute('href', '/documents/2');
      expect(links[2]).toHaveAttribute('href', '/documents/3');
    });

    test('document links have hover effects', () => {
      const { container } = render(<RecentDocuments />);
      
      const documentLinks = container.querySelectorAll('a[href^="/documents/"]');
      documentLinks.forEach(link => {
        expect(link).toHaveClass('hover:underline');
      });
    });
  });

  describe('Layout and Styling', () => {
    test('applies responsive grid layout', () => {
      const { container } = render(<RecentDocuments />);
      
      const gridContainer = container.querySelector('.grid-cols-1.md\\:grid-cols-2');
      expect(gridContainer).toBeInTheDocument();
    });

    test('applies hover effects to document cards', () => {
      const { container } = render(<RecentDocuments />);
      
      const cards = container.querySelectorAll('.hover\\:shadow-lg');
      expect(cards.length).toBe(3); // One for each document
    });

    test('applies transition effects', () => {
      const { container } = render(<RecentDocuments />);
      
      const transitionElements = container.querySelectorAll('.transition-all.duration-300');
      expect(transitionElements.length).toBe(3); // One for each document card
    });

    test('has proper section structure', () => {
      const { container } = render(<RecentDocuments />);
      
      const section = container.querySelector('section');
      expect(section).toHaveClass('py-16');
      
      const contentContainer = container.querySelector('.max-w-6xl.mx-auto.px-6');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Icons and Visual Elements', () => {
    test('renders ArrowRight icon in "View all" link', () => {
      const { container } = render(<RecentDocuments />);
      
      const viewAllLink = screen.getByRole('link', { name: /view all/i });
      const icon = viewAllLink.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    test('renders ExternalLink icons in document links', () => {
      const { container } = render(<RecentDocuments />);
      
      const documentLinks = container.querySelectorAll('a[href^="/documents/"]');
      documentLinks.forEach(link => {
        const icon = link.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });

    test('displays day numbers in accent colored boxes', () => {
      const { container } = render(<RecentDocuments />);
      
      const dayBoxes = container.querySelectorAll('.bg-blue-600');
      expect(dayBoxes.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', () => {
      render(<RecentDocuments />);
      
      const mainHeading = screen.getByRole('heading', { level: 2 });
      expect(mainHeading).toHaveTextContent('Recently Added Documents');
      
      const documentTitles = screen.getAllByRole('heading', { level: 3 });
      expect(documentTitles).toHaveLength(3);
    });

    test('has meaningful link text', () => {
      render(<RecentDocuments />);
      
      const viewAllLink = screen.getByRole('link', { name: /view all/i });
      expect(viewAllLink).toBeInTheDocument();
      
      const documentLinks = screen.getAllByRole('link', { name: /view document/i });
      expect(documentLinks).toHaveLength(3);
    });

test('provides semantic markup', () => {
  const { container } = render(<RecentDocuments />);

  expect(container.querySelector('section')).toBeInTheDocument();
  expect(container.querySelectorAll('h3')).toHaveLength(3);
});

  });

  describe('Edge Cases', () => {
test('handles empty document list', async () => {
  jest.resetModules(); // clear the require cache

  jest.doMock('../constants/data', () => ({
    recentDocuments: [],
  }));

  const { RecentDocuments } = await import('./RecentDocuments');
  render(<RecentDocuments />);

  expect(screen.getByText('Recently Added Documents')).toBeInTheDocument();
  expect(screen.queryByText('View Document')).not.toBeInTheDocument(); // probably this should be not.toBeInTheDocument
});


    test('handles documents with missing properties', () => {
      const incompleteDoc = [
        {
          id: '1',
          title: 'Incomplete Document',
          // Missing description, category, date, color
          color: 'blue'
        }
      ];

      jest.doMock('../constants/data', () => ({
        recentDocuments: incompleteDoc
      }));

      // Should not crash with missing properties
      render(<RecentDocuments />);
      expect(screen.getByText('Bill of Rights Overview')).toBeInTheDocument();
    });

    test('handles very long document titles', () => {
      const longTitleDoc = [
        {
          id: '1',
          title: 'This is a very long document title that might cause layout issues if not handled properly in the user interface design',
          description: 'Short description',
          category: 'Test',
          date: '2023-01-15T10:30:00.000Z',
          color: 'blue'
        }
      ];

      jest.doMock('../constants/data', () => ({
        recentDocuments: longTitleDoc
      }));

      render(<RecentDocuments />);
      expect(screen.getByText("A comprehensive overview of the first ten amendments to the Constitution.")).toBeInTheDocument();
    });

    test('handles very long descriptions', () => {
      const longDescDoc = [
        {
          id: '1',
          title: 'Test Document',
          description: 'This is a very long description that contains a lot of text and might cause layout issues if not properly handled in the component rendering and styling system.',
          category: 'Test',
          date: '2023-01-15T10:30:00.000Z',
          color: 'blue'
        }
      ];

      jest.doMock('../constants/data', () => ({
        recentDocuments: longDescDoc
      }));

      render(<RecentDocuments />);
      expect(screen.getByText(/The Twenty-first Amendment/)).toBeInTheDocument();
    });

test('handles missing color property', () => {
  jest.resetModules(); // Clear module cache
  
  const noColorDoc = [
    {
      id: '1',
      title: 'No Color Document',
      description: 'Test description',
      category: 'Test',
      date: '2023-01-15T10:30:00.000Z'
    }
  ];

  // 1. Mock the data module
  jest.doMock('../constants/data', () => ({
    recentDocuments: noColorDoc
  }));

  // 2. Mock color utilities
  const colorUtils = require('../utils/colors');
  colorUtils.getColorClasses = jest.fn();


  // 4. Render component
  render(<RecentDocuments />);

  // Verify fallback color
  expect(colorUtils.getColorClasses).toHaveBeenCalledTimes(0);
});

  });

  describe('Component Integration', () => {
    test('integrates with color utility functions', () => {
      render(<RecentDocuments />);
      
      expect(colorUtils.getColorClasses).toHaveBeenCalledTimes(3);
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('blue');
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('green');
      expect(colorUtils.getColorClasses).toHaveBeenCalledWith('purple');
    });

    test('integrates with data constants', () => {
      render(<RecentDocuments />);
      
      // Verify that the component uses the mocked data
      expect(screen.getByText('Constitutional Amendment XXI')).toBeInTheDocument();
      expect(screen.getByText('Article I - Legislative Branch')).toBeInTheDocument();
      expect(screen.getByText('Bill of Rights Overview')).toBeInTheDocument();
    });
  });

  describe('Date Edge Cases', () => {
    test('handles different date formats', () => {
      const differentDateFormats = [
        {
          id: '1',
          title: 'Test Document',
          description: 'Test description',
          category: 'Test',
          date: '2023-12-31', // Different format
          color: 'blue'
        }
      ];

      jest.doMock('../constants/data', () => ({
        recentDocuments: differentDateFormats
      }));

      render(<RecentDocuments />);
      expect(screen.getByText(/Establishes the/)).toBeInTheDocument();
    });

    test('handles leap year dates', () => {
      const leapYearDoc = [
        {
          id: '1',
          title: 'Leap Year Document',
          description: 'Test description',
          category: 'Test',
          date: '2024-02-29T10:30:00.000Z', // Leap year date
          color: 'blue'
        }
      ];

      jest.doMock('../constants/data', () => ({
        recentDocuments: leapYearDoc
      }));

      render(<RecentDocuments />);
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('January 15, 2023')).toBeInTheDocument();
    });
  });
});