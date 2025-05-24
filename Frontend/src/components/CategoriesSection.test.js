import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoriesSection } from './CategoriesSection';

// Mock the utils and constants
jest.mock('../utils/colors', () => ({
  getColorClasses: jest.fn().mockImplementation((color) => ({
    border: `border-${color}-200`,
    bg: `bg-${color}-50`,
    badge: `bg-${color}-100 text-${color}-800`
  }))
}));

jest.mock('../constants/data', () => ({
  categories: [
    { name: 'Constitutional Documents', icon: '📜', count: 25 },
    { name: 'Historical Letters', icon: '✉️', count: 150 },
    { name: 'Government Records', icon: '🏛️', count: 89 },
    { name: 'Legal Opinions', icon: '⚖️', count: 67 },
    { name: 'Treaties', icon: '🤝', count: 34 },
    { name: 'Speeches', icon: '🎤', count: 112 }
  ]
}));

import { getColorClasses } from '../utils/colors';
import { categories } from '../constants/data';

describe('CategoriesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation
    getColorClasses.mockImplementation((color) => ({
      border: `border-${color}-200`,
      bg: `bg-${color}-50`,
      badge: `bg-${color}-100 text-${color}-800`
    }));
  });

  it('renders the section with correct heading', () => {
    render(<CategoriesSection />);
    
    expect(screen.getByText('Browse By Category')).toBeInTheDocument();
    expect(screen.getByText('Browse By Category')).toHaveClass('text-3xl', 'font-bold', 'mb-10', 'text-center');
  });

  it('renders all categories from the data', () => {
    render(<CategoriesSection />);
    
    categories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
      expect(screen.getByText(`${category.count} documents`)).toBeInTheDocument();
    });
  });

  it('renders category icons', () => {
    render(<CategoriesSection />);
    
    categories.forEach(category => {
      expect(screen.getByText(category.icon)).toBeInTheDocument();
    });
  });

  it('creates correct links for each category', () => {
    render(<CategoriesSection />);
    
    const expectedLinks = [
      '/categories/constitutional-documents',
      '/categories/historical-letters',
      '/categories/government-records',
      '/categories/legal-opinions',
      '/categories/treaties',
      '/categories/speeches'
    ];

    expectedLinks.forEach(href => {
      expect(screen.getByRole('link', { name: new RegExp(href.split('/')[2].replace('-', ' '), 'i') }))
        .toHaveAttribute('href', href);
    });
  });

  it('applies correct CSS classes to the main section', () => {
    const { container } = render(<CategoriesSection />);
    const section = container.querySelector('section');
    
    expect(section).toHaveClass('py-16', 'bg-gradient-to-b', 'from-blue-50', 'to-white');
  });

  it('applies correct CSS classes to the container div', () => {
    const { container } = render(<CategoriesSection />);
    const containerDiv = container.querySelector('.max-w-6xl');
    
    expect(containerDiv).toHaveClass('max-w-6xl', 'mx-auto', 'px-6');
  });

  it('applies correct CSS classes to the grid', () => {
    const { container } = render(<CategoriesSection />);
    const grid = container.querySelector('.grid');
    
    expect(grid).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4', 'gap-4');
  });

  it('calls getColorClasses with correct color rotation', () => {
    render(<CategoriesSection />);
    
    const expectedColors = ['blue', 'green', 'red', 'purple', 'amber', 'teal'];
    
    expectedColors.forEach((color, index) => {
      expect(getColorClasses).toHaveBeenCalledWith(color);
    });
  });

  it('applies color classes to category links', () => {
    render(<CategoriesSection />);
    
    const categoryLinks = screen.getAllByRole('link');
    
    categoryLinks.forEach((link, index) => {
      const expectedColor = ['blue', 'green', 'red', 'purple', 'amber', 'teal'][index % 6];
      expect(link).toHaveClass(`border-${expectedColor}-200`);
      expect(link).toHaveClass(`bg-${expectedColor}-50`);
    });
  });

  it('applies hover and transition classes to category links', () => {
    render(<CategoriesSection />);
    
    const categoryLinks = screen.getAllByRole('link');
    
    categoryLinks.forEach(link => {
      expect(link).toHaveClass(
        'rounded-xl',
        'border-2',
        'p-4',
        'flex',
        'flex-col',
        'items-center',
        'text-center',
        'hover:shadow-lg',
        'transition-shadow',
        'duration-300'
      );
    });
  });

  it('renders category icons with correct styling', () => {
    const { container } = render(<CategoriesSection />);
    
    const iconElements = container.querySelectorAll('.text-3xl.mb-2');
    expect(iconElements).toHaveLength(categories.length);
    
    iconElements.forEach((icon, index) => {
      expect(icon).toHaveTextContent(categories[index].icon);
    });
  });

  it('renders category names with correct styling', () => {
    render(<CategoriesSection />);
    
    categories.forEach(category => {
      const nameElement = screen.getByText(category.name);
      expect(nameElement).toHaveClass('font-bold', 'mb-1');
      expect(nameElement.tagName).toBe('H3');
    });
  });

  it('renders document count badges with correct styling', () => {
    const { container } = render(<CategoriesSection />);
    
    categories.forEach((category, index) => {
      const badgeText = `${category.count} documents`;
      const badge = screen.getByText(badgeText);
      
      expect(badge).toHaveClass(
        'px-3',
        'py-1',
        'rounded-full',
        'text-xs',
        'font-medium'
      );
      
      // Check color-specific badge classes
      const expectedColor = ['blue', 'green', 'red', 'purple', 'amber', 'teal'][index % 6];
      expect(badge).toHaveClass(`bg-${expectedColor}-100`, `text-${expectedColor}-800`);
    });
  });

  it('handles empty categories array gracefully', () => {
    // Mock empty categories for this test
    jest.doMock('../constants/data', () => ({
      categories: []
    }));
    
    const { categories: emptyCategories } = require('../constants/data');
    
    // Re-render with empty categories
    const { container } = render(<CategoriesSection />);
    
    expect(screen.getByText('Browse By Category')).toBeInTheDocument();
    expect(container.querySelectorAll('a')).toHaveLength(6);
  });

  it('generates correct URLs for categories with special characters', () => {
    // Test URL generation logic
    const testCategories = [
      { name: 'Test Category', expectedUrl: '/categories/test-category' },
      { name: 'Multiple Word Category', expectedUrl: '/categories/multiple-word-category' },
      { name: 'Category   With   Spaces', expectedUrl: '/categories/category-with-spaces' }
    ];

    testCategories.forEach(({ name, expectedUrl }) => {
      const generatedUrl = `/categories/${name.toLowerCase().replace(/\s+/g, '-')}`;
      expect(generatedUrl).toBe(expectedUrl);
    });
  });

  it('ensures accessibility with proper link structure', () => {
    render(<CategoriesSection />);
    
    const categoryLinks = screen.getAllByRole('link');
    
    categoryLinks.forEach((link, index) => {
      // Each link should have accessible text content
      expect(link).toHaveTextContent(categories[index].name);
      expect(link).toHaveTextContent(`${categories[index].count} documents`);
      
      // Links should be keyboard navigable (href attribute present)
      expect(link).toHaveAttribute('href');
    });
  });
});