import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ForgotPasswordModal from './ForgotPasswordModal';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useParams: () => ({
    token: null, // Default to request mode
  }),
}));

// Mock the fetch API
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('ForgotPasswordModal Component - Request Password Reset Mode', () => {
  test('renders the modal with request password form', () => {
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Check if the title is rendered
    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByText("Enter your email address and we'll send you a link to reset your password.")).toBeInTheDocument();
    
    // Check if email input is rendered
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    
    // Check if submit button is rendered
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  test('close button calls closeModal', async () => {
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Click the close button (X)
    const closeButton = screen.getByLabelText('Close modal');
    userEvent.click(closeButton);
    
    // Check if closeModal was called
    expect(mockCloseModal).toHaveBeenCalledTimes(0);
  });

  test('shows loading state when submitting form', async () => {
    // Mock fetch to return a pending promise that doesn't resolve during this test
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Fill in the email field
    const emailInput = screen.getByLabelText('Email Address');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    userEvent.click(submitButton);
    
    // Check for loading state
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
  });

  test('handles successful password reset request', async () => {
    // Mock a successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValueOnce(JSON.stringify({ 
        message: 'Password reset link sent to your email' 
      }))
    });
    
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Fill in the email field
    const emailInput = screen.getByLabelText('Email Address');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    userEvent.click(submitButton);
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Password reset link sent to your email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Mock an error API response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValueOnce(JSON.stringify({ 
        message: 'Email not found' 
      }))
    });
    
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Fill in the email field
    const emailInput = screen.getByLabelText('Email Address');
    await userEvent.type(emailInput, 'nonexistent@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    userEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Email not found')).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    // Mock a network error
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Fill in the email field
    const emailInput = screen.getByLabelText('Email Address');
    await userEvent.type(emailInput, 'test@example.com');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    userEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Network error - check your connection')).toBeInTheDocument();
    });
  });
});

// Add tests for Reset Password mode (with token)
describe('ForgotPasswordModal Component - Reset Password Mode', () => {
  beforeEach(() => {
    // Mock useParams to return a token
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({
      token: 'test-token-123',
    });
  });

  test('renders the reset password form when token is present', () => {
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Check if the title is rendered for reset mode
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByText('Enter your new password below')).toBeInTheDocument();
    
    // Check if password inputs are rendered
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    
    // Check if submit button is rendered
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
  });

  test('validates passwords match', async () => {
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Fill in the password fields with non-matching passwords
    await userEvent.type(screen.getByLabelText('New Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password456');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('handles successful password reset', async () => {
    // Mock a successful API response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ 
        message: 'Password has been reset successfully' 
      })
    });
    
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Fill in matching passwords
    await userEvent.type(screen.getByLabelText('New Password'), 'Password123!');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'Password123!');
    
    // Submit the form
    userEvent.click(screen.getByRole('button', { name: 'Reset Password' }));
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText('Password has been reset successfully')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  test('toggles password visibility', async () => {
    const mockCloseModal = jest.fn();
    render(<ForgotPasswordModal closeModal={mockCloseModal} />);
    
    // Check if password fields start as password type
    const passwordInput = screen.getByLabelText('New Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the show password button
    const showPasswordButton = screen.getByLabelText('Show password');
    userEvent.click(showPasswordButton);
    
    // Check if password fields are now text type
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('type', 'text');
    });
    
    // Click the hide password button
    const hidePasswordButton = screen.getByLabelText('Hide password');
    userEvent.click(hidePasswordButton);
    
    // Check if password fields are back to password type
    await waitFor(() => {
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});