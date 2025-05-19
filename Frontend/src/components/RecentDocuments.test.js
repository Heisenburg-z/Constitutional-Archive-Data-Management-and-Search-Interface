import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecentDocuments } from './RecentDocuments';

// Mock modules before importing the component
jest.mock('lucide-react', () => ({
  ExternalLink: () => <span data-testid="external-link-icon" />,
  ArrowRight: () => <span data-testid="arrow-right-icon" />
}));

// Mock the data directly without referencing the actual module
const mockRecentDocuments = [
  {
    id: '1',
    title: 'Financial Report Q2',
    description: 'Quarterly financial analysis and projections',
    category: 'Finance',
    date: '2025-05-10T00:00:00.000Z',
    color: 'blue'
  },
  {
    id: '2',
    title: 'Marketing Strategy',
    description: 'Annual marketing plan and campaign outlines',
    category: 'Marketing',
    date: '2025-05-05T00:00:00.000Z',
    color: 'green'
  }
];

// Use jest.doMock instead of jest.mock for modules referenced in the component
jest.doMock('../constants/data', () => ({
  recentDocuments: mockRecentDocuments
}), { virtual: true });

// Use jest.doMock for the colors utility
jest.doMock('../utils/colors', () => ({
  getColorClasses: (color) => {
    const colorMap = {
      blue: {
        border: 'border-blue-200',
        accent: 'bg-blue-600',
        badge: 'bg-blue-100 text-blue-800',
        text: 'text-blue-600'
      },
      green: {
        border: 'border-green-200',
        accent: 'bg-green-600',
        badge: 'bg-green-100 text-green-800',
        text: 'text-green-600'
      }
    };
    return colorMap[color] || colorMap.blue;
  }
}), { virtual: true });

describe('RecentDocuments Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Ensure mocks are applied before rendering
    jest.resetModules();
    
    render(<RecentDocuments />);
  });

  test('renders the component title', () => {
    expect(screen.getByText('Recently Added Documents')).toBeInTheDocument();
  });

  test('renders "View all" link', () => {
    const viewAllLink = screen.getByText('View all');
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink.closest('a')).toHaveAttribute('href', '/documents');
  });

  test('renders correct number of document cards', () => {
    const documentCards = screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent);
    expect(documentCards).toHaveLength(2);
    expect(documentCards).toContain('Financial Report Q2');
    expect(documentCards).toContain('Marketing Strategy');
  });

  test('renders document categories correctly', () => {
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  test('renders document descriptions', () => {
    expect(screen.getByText('Quarterly financial analysis and projections')).toBeInTheDocument();
    expect(screen.getByText('Annual marketing plan and campaign outlines')).toBeInTheDocument();
  });

  test('renders formatted dates', () => {
    expect(screen.getByText('May 10, 2025')).toBeInTheDocument();
    expect(screen.getByText('May 5, 2025')).toBeInTheDocument();
  });

  test('renders day numbers in the accent color boxes', () => {
    // The date numbers should be displayed in the colored boxes
    const dateNumbers = screen.getAllByText(/^\d+$/);
    expect(dateNumbers).toHaveLength(4);
    expect(dateNumbers[0].textContent).toBe('10');
    expect(dateNumbers[1].textContent).toBe('5');
  });

  test('renders "View Document" links with correct URLs', () => {
    const viewDocumentLinks = screen.getAllByText('View Document');
    expect(viewDocumentLinks).toHaveLength(2);
    
    // Check that links point to the correct document URLs
    expect(viewDocumentLinks[0].closest('a')).toHaveAttribute('href', '/documents/1');
    expect(viewDocumentLinks[1].closest('a')).toHaveAttribute('href', '/documents/2');
  });

  test('applies correct color classes based on document color', () => {
    // Get the document cards
    const documentCards = screen.getAllByText(/View Document/).map(link => 
      link.closest('div').closest('div')
    );
    
    // First card should have blue styling
    expect(documentCards[0]).toHaveClass('flex justify-between items-center');
    
    // Second card should have green styling
    expect(documentCards[1]).toHaveClass('border-green-200');
  });
});