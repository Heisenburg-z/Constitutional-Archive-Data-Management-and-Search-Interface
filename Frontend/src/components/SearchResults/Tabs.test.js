// src/components/ImageTab.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ImageTab } from './ImageTab';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Image: () => <div data-testid="image-icon">Image</div>
}));

describe('ImageTab Component', () => {
  test('renders the placeholder content for upcoming image search', () => {
    render(<ImageTab />);
    
    // Check if the icon is rendered
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    
    // Check if the placeholder texts are rendered
    expect(screen.getByText('Image search coming soon!')).toBeInTheDocument();
    expect(screen.getByText("We're working on implementing image search functionality.")).toBeInTheDocument();
  });

  test('has the correct styling classes', () => {
    const { container } = render(<ImageTab />);
    
    // Check if the main container has the correct styling classes
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('text-center', 'py-12', 'text-gray-500');
    
    // Additional structural checks could be added here if needed
  });
});