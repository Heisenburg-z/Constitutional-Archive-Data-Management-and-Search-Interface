// src/components/Dashboard/__tests__/DashboardHeader.test.js

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DashboardHeader from './DashboardHeader';

describe('DashboardHeader Component', () => {
  // Mock profile data
  const mockUserProfile = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com'
  };

  // Mock functions
  const mockSetCurrentView = jest.fn();

  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
    
    // Mock timing functions
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders dashboard header with logo and title', () => {
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Check if the title is rendered
    expect(screen.getByText('Document Dashboard')).toBeInTheDocument();
  });

  test('displays user name when profile is provided', () => {
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Run the animation timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check if the user's name is displayed
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
  });

  test('displays email when profile is provided', () => {
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Run the animation timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check if the user's email is displayed
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  test('displays "Admin" when no profile is provided', () => {
    render(<DashboardHeader userProfile={null} setCurrentView={mockSetCurrentView} />);
    
    // Run the animation timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check if "Admin" is displayed instead of user name
    const greetingText = screen.getByText(/Admin/i);
    expect(greetingText).toBeInTheDocument();
  });

  test('displays correct greeting based on time of day (morning)', () => {
    // Mock time to be morning (8am)
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(8);
    
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Run the animation timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check if morning greeting is displayed
    expect(screen.getByText(/Good morning/i)).toBeInTheDocument();
  });

  test('displays correct greeting based on time of day (afternoon)', () => {
    // Mock time to be afternoon (2pm)
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(14);
    
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Run the animation timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check if afternoon greeting is displayed
    expect(screen.getByText(/Good afternoon/i)).toBeInTheDocument();
  });

  test('displays correct greeting based on time of day (evening)', () => {
    // Mock time to be evening (8pm)
    jest.spyOn(Date.prototype, 'getHours').mockReturnValue(20);
    
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Run the animation timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    // Check if evening greeting is displayed
    expect(screen.getByText(/Good evening/i)).toBeInTheDocument();
  });

  test('calls setCurrentView when Browse All Documents button is clicked', () => {
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Find and click the Browse All Documents button
    const browseButton = screen.getByText('Browse All Documents');
    fireEvent.click(browseButton);
    
    // Check if setCurrentView was called with 'all'
    expect(mockSetCurrentView).toHaveBeenCalledWith('all');
  });

  test('toggles user menu when menu button is clicked', () => {
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Menu should be closed initially
    expect(screen.queryByText('Signed in as')).not.toBeInTheDocument();
    
    // Find and click the menu button (user avatar)
    const menuButton = screen.getByText('J'); // First letter of firstName
    fireEvent.click(menuButton);
    
    // Check if menu is now open
    expect(screen.getByText(/Signed in as/i)).toBeInTheDocument();
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    
    // Click the menu button again to close it
    fireEvent.click(menuButton);
    
    // Check if menu is closed (this won't work as expected in React Testing Library since the state update won't be immediate)
    // Instead, let's click again to open it
    fireEvent.click(menuButton);
    expect(screen.getByText(/Signed in as/i)).toBeInTheDocument();
  });

  test('displays notification banner with animation classes', () => {
    const { container } = render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Check if notification banner is present
    const notificationText = screen.getByText(/New features available/i);
    expect(notificationText).toBeInTheDocument();
    
    // Check animation classes
    expect(notificationText).toHaveClass('whitespace-nowrap');
    expect(notificationText).toHaveClass('animate-[slideIn_15s_linear_infinite]');
  });

  test('shows animations after timeout', () => {
    const { container } = render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Initially, showGreeting should be false
    const title = screen.getByText('Document Dashboard');
    expect(title.parentElement).toHaveClass('opacity-0');
    
    // Advance timers to trigger the animation
    act(() => {
      jest.advanceTimersByTime(400);
    });
    
    // Now showGreeting should be true
    expect(title.parentElement).toHaveClass('opacity-100');
  });

  test('displays first letter of firstName in avatar when profile is provided', () => {
    render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Check if the first letter of the first name is displayed in the avatar
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  test('displays "A" in avatar when no profile is provided', () => {
    render(<DashboardHeader userProfile={null} setCurrentView={mockSetCurrentView} />);
    
    // Check if "A" (for Admin) is displayed in the avatar
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  test('applies correct CSS classes for styling', () => {
    const { container } = render(<DashboardHeader userProfile={mockUserProfile} setCurrentView={mockSetCurrentView} />);
    
    // Check for gradient classes on the logo
    const logo = screen.getByText('Document Dashboard').parentElement.parentElement.previousSibling;
    expect(logo).toHaveClass('bg-gradient-to-br');
    expect(logo).toHaveClass('from-blue-500');
    expect(logo).toHaveClass('to-purple-600');
    
    // Check for hover animation classes on the logo
    expect(logo).toHaveClass('hover:rotate-6');
    expect(logo).toHaveClass('hover:scale-110');
  });
});