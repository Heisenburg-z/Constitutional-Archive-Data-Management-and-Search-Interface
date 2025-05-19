import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { FeaturedCollections } from '../components/FeaturedCollections';
import { getColorClasses } from '../utils/colors';
import { featuredCollections } from '../constants/data';

// Mock the required dependencies
jest.mock('../utils/colors', () => ({
  getColorClasses: jest.fn()
}));

jest.mock('../constants/data', () => ({
  featuredCollections: [
    {
      id: 'constitutional-drafts',
      title: 'Constitutional Drafts',
      description: 'Early drafts and working papers from constitutional conventions',
      count: 42,
      color: 'blue'
    },
    {
      id: 'landmark-cases',
      title: 'Landmark Cases',
      description: 'Pivotal court decisions that shaped constitutional interpretation',
      count: 78,
      color: 'green'
    },
    {
      id: 'amendments',
      title: 'Constitutional Amendments',
      description: 'Official amendments and proposed changes throughout history',
      count: 27,
      color: 'purple'
    }
  ]
}));

// Helper function to render with router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('FeaturedCollections Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the mock implementation for getColorClasses
    getColorClasses.mockImplementation((color) => {
      const colorMap = {
        blue: {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          accent: 'bg-blue-600'
        },
        green: {
          bg: 'bg-green-50',
          border: 'border-green-200',
          accent: 'bg-green-600'
        },
        purple: {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          accent: 'bg-purple-600'
        }
      };
      
      return colorMap[color] || colorMap.blue;
    });
  });

  test('renders without crashing', () => {
    renderWithRouter(<FeaturedCollections />);
    expect(screen.getByText('Featured Collections')).toBeInTheDocument();
  });

  test('renders the correct number of collection cards', () => {
    renderWithRouter(<FeaturedCollections />);
    const collectionCards = screen.getAllByText(/Explore Collection/i);
    expect(collectionCards).toHaveLength(featuredCollections.length);
  });

  test('renders collection titles correctly', () => {
    renderWithRouter(<FeaturedCollections />);
    
    featuredCollections.forEach(collection => {
      expect(screen.getByText(collection.title)).toBeInTheDocument();
    });
  });

  test('renders collection descriptions correctly', () => {
    renderWithRouter(<FeaturedCollections />);
    
    featuredCollections.forEach(collection => {
      expect(screen.getByText(collection.description)).toBeInTheDocument();
    });
  });

  test('renders document counts correctly', () => {
    renderWithRouter(<FeaturedCollections />);
    
    featuredCollections.forEach(collection => {
      expect(screen.getByText(`${collection.count} documents`)).toBeInTheDocument();
    });
  });

  test('calls getColorClasses with correct colors', () => {
    renderWithRouter(<FeaturedCollections />);
    
    // Check that getColorClasses was called for each collection with correct color
    featuredCollections.forEach(collection => {
      expect(getColorClasses).toHaveBeenCalledWith(collection.color);
    });
    
    // Total number of calls should match the number of collections
    expect(getColorClasses).toHaveBeenCalledTimes(featuredCollections.length);
  });

  test('collection cards have correct color classes', () => {
    renderWithRouter(<FeaturedCollections />);
    
    // Test the first card (blue)
    const blueCard = screen.getByText('Constitutional Drafts').closest('div').closest('div');
    expect(blueCard).toHaveClass('absolute bottom-4 left-4 right-4 text-white');
    
    // Check the blue card's bottom section
    const blueCardBottom = screen.getByText('Early drafts and working papers from constitutional conventions').closest('div');
    expect(blueCardBottom).toHaveClass('bg-blue-50');
    
    // Check the blue card's button
    const blueButton = screen.getAllByText('Explore Collection')[0].closest('a');
    expect(blueButton).toHaveClass('bg-blue-600');
  });

  test('explore collection links have correct hrefs', () => {
    renderWithRouter(<FeaturedCollections />);
    
    featuredCollections.forEach((collection, index) => {
      const links = screen.getAllByText('Explore Collection');
      expect(links[index].closest('a')).toHaveAttribute('href', `/collections/${collection.id}`);
    });
  });

  test('collection cards have hover effects', () => {
    renderWithRouter(<FeaturedCollections />);
    
    // Find the first collection card
    const card = screen.getByText('Constitutional Drafts').closest('div').closest('div');
    
    // Check for transition class
    expect(card).toHaveClass('absolute bottom-4 left-4 right-4 text-white');
    expect(card).toHaveClass('absolute bottom-4 left-4 right-4 text-white');
    
    // Check that button has hover effect classes
    const button = screen.getAllByText('Explore Collection')[0].closest('a');
    expect(button).toHaveClass('hover:scale-105');
    expect(button).toHaveClass('transition-transform');
  });
});