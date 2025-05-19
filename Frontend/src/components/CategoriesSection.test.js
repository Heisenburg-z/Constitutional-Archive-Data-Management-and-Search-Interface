import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoriesSection } from '../CategoriesSection';
import { categories } from '../constants/data';
import { getColorClasses } from '../utils/colors';

// Mock the constants and utils
jest.mock('../constants/data', () => ({
  categories: [
    { name: 'Constitutional Law', icon: '⚖️', count: 120 },
    { name: 'Human Rights', icon: '🌍', count: 85 },
    { name: 'Historical Documents', icon: '📜', count: 63 },
    { name: 'International Treaties', icon: '🌐', count: 45 }
  ]
}));

jest.mock('../utils/colors', () => ({
  getColorClasses: jest.fn().mockImplementation(color => {
    const colorMap = {
      blue: { 
        border: 'border-blue-300', 
        bg: 'bg-blue-50', 
        badge: 'bg-blue-100 text-blue-800' 
      },
      green: { 
        border: 'border-green-300', 
        bg: 'bg-green-50', 
        badge: 'bg-green-100 text-green-800' 
      },
      red: { 
        border: 'border-red-300', 
        bg: 'bg-red-50', 
        badge: 'bg-red-100 text-red-800' 
      },
      purple: { 
        border: 'border-purple-300', 
        bg: 'bg-purple-50', 
        badge: 'bg-purple-100 text-purple-800' 
      }
    };
    return colorMap[color] || colorMap.blue;
  })
}));

describe('CategoriesSection', () => {
  beforeEach(() => {
    // Reset the mock implementation before each test
    getColorClasses.mockClear();
  });

  test('renders the section heading correctly', () => {
    render(<CategoriesSection />);
    const heading = screen.getByRole('heading', { name: /browse by category/i });
    expect(heading).toBeInTheDocument();
  });

  test('renders all category cards from the data', () => {
    render(<CategoriesSection />);
    
    // Check if all categories are rendered
    categories.forEach(category => {
      const categoryHeading = screen.getByRole('heading', { name: category.name });
      expect(categoryHeading).toBeInTheDocument();
      
      // Check if icon is rendered
      expect(screen.getByText(category.icon)).toBeInTheDocument();
      
      // Check if document count is shown
      expect(screen.getByText(`${category.count} documents`)).toBeInTheDocument();
    });
  });

  test('creates correct links for each category', () => {
    render(<CategoriesSection />);
    
    categories.forEach(category => {
      const expectedHref = `/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`;
      const link = screen.getByRole('link', { name: new RegExp(category.name, 'i') });
      expect(link).toHaveAttribute('href', expectedHref);
    });
  });

  test('applies correct color classes to category cards', () => {
    render(<CategoriesSection />);
    
    const colors = ['blue', 'green', 'red', 'purple'];
    
    categories.forEach((category, index) => {
      const expectedColor = colors[index % colors.length];
      
      // Check if getColorClasses was called with the correct color
      expect(getColorClasses).toHaveBeenCalledWith(expectedColor);
    });
  });

  test('renders the correct number of category cards', () => {
    render(<CategoriesSection />);
    
    const categoryCards = screen.getAllByRole('link');
    expect(categoryCards).toHaveLength(categories.length);
  });

  test('applies hover effect classes to category cards', () => {
    render(<CategoriesSection />);
    
    const categoryCards = screen.getAllByRole('link');
    categoryCards.forEach(card => {
      expect(card).toHaveClass('hover:shadow-lg', 'transition-shadow', 'duration-300');
    });
  });

  test('renders with responsive grid layout', () => {
    render(<CategoriesSection />);
    
    const gridContainer = screen.getByRole('heading', { name: /browse by category/i }).parentElement.nextElementSibling;
    expect(gridContainer).toHaveClass('grid', 'grid-cols-2', 'md:grid-cols-4', 'gap-4');
  });
});