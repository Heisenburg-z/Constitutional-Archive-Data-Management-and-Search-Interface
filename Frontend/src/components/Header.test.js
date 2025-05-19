import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from '../components/Header';

// Mock the AnimatedNavMenu component since we're only testing Header
jest.mock('../components/AnimatedNavMenu', () => {
  return function MockAnimatedNavMenu() {
    return <div data-testid="animated-nav-menu">Mock Nav Menu</div>;
  };
});

describe('Header Component', () => {
  test('renders the header with logo and title', () => {
    render(<Header />);
    
    // Check if the title is rendered
    expect(screen.getByText('Constitutional Archive')).toBeInTheDocument();
    
    // Check if the BookMarked icon container is present (we can verify by its parent div)
    expect(screen.getByText('Constitutional Archive').previousElementSibling).toHaveClass('bg-blue-600');
    
    // Check if the AnimatedNavMenu is rendered
    expect(screen.getByTestId('animated-nav-menu')).toBeInTheDocument();
    
    // Check if the admin login link is rendered
    const adminLink = screen.getByText('Admin Login');
    expect(adminLink).toBeInTheDocument();
    expect(adminLink).toHaveAttribute('href', '/admin');
  });

  test('has the right styling and structure', () => {
    render(<Header />);
    
    // Check if the header has the correct background gradient
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-gradient-to-r');
    expect(header).toHaveClass('from-gray-900');
    expect(header).toHaveClass('to-blue-900');
    
    // Check if the header has proper padding and shadow
    expect(header).toHaveClass('py-6');
    expect(header).toHaveClass('shadow-lg');
    
    // Check if the admin button has proper styling
    const adminButton = screen.getByText('Admin Login');
    expect(adminButton).toHaveClass('bg-blue-600');
    expect(adminButton).toHaveClass('rounded-lg');
  });
});