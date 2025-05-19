import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApiErrorFallback from './ApiErrorFallback';

describe('ApiErrorFallback Component', () => {
  test('renders without crashing', () => {
    render(<ApiErrorFallback />);
    expect(screen.getByText('Unable to connect to the server')).toBeInTheDocument();
  });

  test('displays default error message when no message prop is provided', () => {
    render(<ApiErrorFallback />);
    expect(screen.getByText('Unable to connect to the server')).toBeInTheDocument();
  });

  test('displays custom error message when message prop is provided', () => {
    const customMessage = 'Custom error message';
    render(<ApiErrorFallback message={customMessage} />);
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  test('displays the standard description text', () => {
    render(<ApiErrorFallback />);
    expect(
      screen.getByText('We\'re experiencing some technical difficulties. Please try again later.')
    ).toBeInTheDocument();
  });

  test('does not render retry button when retryAction prop is not provided', () => {
    render(<ApiErrorFallback />);
    const retryButton = screen.queryByText('Retry Connection');
    expect(retryButton).not.toBeInTheDocument();
  });

  test('renders retry button when retryAction prop is provided', () => {
    const retryAction = jest.fn();
    render(<ApiErrorFallback retryAction={retryAction} />);
    const retryButton = screen.getByText('Retry Connection');
    expect(retryButton).toBeInTheDocument();
  });

  test('calls retryAction when retry button is clicked', () => {
    const retryAction = jest.fn();
    render(<ApiErrorFallback retryAction={retryAction} />);
    
    const retryButton = screen.getByText('Retry Connection');
    fireEvent.click(retryButton);
    
    expect(retryAction).toHaveBeenCalledTimes(1);
  });

  test('renders the FileText icon', () => {
    render(<ApiErrorFallback />);
    
    // Test that the container for the icon exists
    const iconContainer = screen.getByText('Unable to connect to the server')
      .parentElement
      .querySelector('.bg-red-100');
    
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer).toHaveClass('inline-flex');
    expect(iconContainer).toHaveClass('items-center');
    expect(iconContainer).toHaveClass('justify-center');
  });

  test('applies correct styling classes', () => {
    render(<ApiErrorFallback />);
    
    // Main container
    const container = screen.getByText('Unable to connect to the server').closest('div');
    expect(container).toHaveClass('bg-red-50');
    expect(container).toHaveClass('border');
    expect(container).toHaveClass('border-red-200');
    expect(container).toHaveClass('rounded-lg');
    
    // Heading
    const heading = screen.getByText('Unable to connect to the server');
    expect(heading).toHaveClass('text-lg');
    expect(heading).toHaveClass('font-medium');
    expect(heading).toHaveClass('text-gray-900');
    
    // Description
    const description = screen.getByText('We\'re experiencing some technical difficulties. Please try again later.');
    expect(description).toHaveClass('text-gray-600');
  });

  test('renders retry button with RefreshCw icon when retryAction is provided', () => {
    const retryAction = jest.fn();
    render(<ApiErrorFallback retryAction={retryAction} />);
    
    const retryButton = screen.getByText('Retry Connection').closest('button');
    
    // Check button styling
    expect(retryButton).toHaveClass('bg-blue-600');
    expect(retryButton).toHaveClass('hover:bg-blue-700');
    expect(retryButton).toHaveClass('text-white');
    expect(retryButton).toHaveClass('inline-flex');
    expect(retryButton).toHaveClass('items-center');
    
    // Verify button has the right attributes
    expect(retryButton).toHaveAttribute('class', expect.stringContaining('focus:ring-2'));
    expect(retryButton).toHaveAttribute('class', expect.stringContaining('focus:outline-none'));
  });

  test('snapshot test', () => {
    const retryAction = jest.fn();
    const { container } = render(<ApiErrorFallback retryAction={retryAction} message="Test error message" />);
    expect(container).toMatchSnapshot();
  });
});