// src/components/Dashboard/__tests__/StatCard.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import StatCard from './StatCard';
import { Users } from 'lucide-react'; // Import an icon to test with

describe('StatCard Component', () => {
  const defaultProps = {
    title: 'Total Users',
    value: '1,234',
    icon: Users
  };

  test('renders with correct title and value', () => {
    render(<StatCard {...defaultProps} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  test('renders the icon correctly', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    
    // Verify the SVG icon is present
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  test('applies the correct CSS classes', () => {
    const { container } = render(<StatCard {...defaultProps} />);
    
    // Check if the main element has the expected classes
    const articleElement = container.firstChild;
    expect(articleElement).toHaveClass('bg-white');
    expect(articleElement).toHaveClass('p-6');
    expect(articleElement).toHaveClass('rounded-xl');
    expect(articleElement).toHaveClass('shadow-sm');
    expect(articleElement).toHaveClass('border');
    expect(articleElement).toHaveClass('border-gray-100');
  });

  test('handles different props correctly', () => {
    // Test with different values
    render(
      <StatCard 
        title="Documents" 
        value="42" 
        icon={Users} // Reusing icon for simplicity
      />
    );
    
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});