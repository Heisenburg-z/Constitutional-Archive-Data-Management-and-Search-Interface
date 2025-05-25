import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLogin from './AdminLogin';
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: jest.fn()
}));

// Mock the Google OAuth provider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: ({ onSuccess, onError }) => (
    <button 
      onClick={() => onSuccess({ credential: 'mock-credential' })}
      onError={() => onError()}
    >
      Sign in with Google
    </button>
  )
}));

// Mock the ForgotPasswordModal component
const mockCloseForgotPasswordModal = jest.fn();
jest.mock('./components/ForgotPasswordModal', () => ({ closeModal }) => {
  mockCloseForgotPasswordModal.mockImplementation(closeModal);
  return (
    <div>
      <span>Forgot Password Modal</span>
      <button onClick={closeModal}>Close Modal</button>
    </div>
  );
});

// Mock fetch API
global.fetch = jest.fn();

describe('AdminLogin Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    localStorage.clear();
    // Reset useParams mock
    const { useParams } = require('react-router-dom');
    useParams.mockReturnValue({});
  });

  const renderComponent = (token = null) => {
    const { useParams } = require('react-router-dom');
    useParams.mockReturnValue({ token });
    
    return render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );
  };

  // Existing tests...
  it('renders the login form correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText("Don't have an admin account?")).toBeInTheDocument();
  });

  it('validates email and password fields', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('admin@example.com')).toBeInvalid();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInvalid();
    });
  });

  it('toggles password visibility', () => {
    renderComponent();
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // NEW TESTS FOR MISSING COVERAGE

  it('shows forgot password modal when token is present in URL params', () => {
    renderComponent('reset-token-123');
    
    expect(screen.getByText('Forgot Password Modal')).toBeInTheDocument();
  });

  it('opens and closes forgot password modal manually', () => {
    renderComponent();
    
    // Modal should not be visible initially
    expect(screen.queryByText('Forgot Password Modal')).not.toBeInTheDocument();
    
    // Click forgot password link
    fireEvent.click(screen.getByText('Forgot password?'));
    
    // Modal should be visible
    expect(screen.getByText('Forgot Password Modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close Modal'));
    
    // Modal should be hidden
    expect(screen.queryByText('Forgot Password Modal')).not.toBeInTheDocument();
  });

  it('navigates back to login when closing modal with token in URL', () => {
    renderComponent('reset-token-123');
    
    // Modal should be open due to token
    expect(screen.getByText('Forgot Password Modal')).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close Modal'));
    
    // Should navigate back to login
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
  });

  it('handles successful login with admin role', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({
        token: 'mock-token',
        user: { role: 'admin', id: 1, email: 'admin@test.com' }
      }))
    });

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('mock-token');
      expect(localStorage.getItem('user')).toBe(JSON.stringify({
        role: 'admin', id: 1, email: 'admin@test.com'
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('throws error for non-admin user', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({
        token: 'mock-token',
        user: { role: 'user', id: 1, email: 'user@test.com' }
      }))
    });

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'user@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('You do not have admin privileges')).toBeInTheDocument();
    });
  });

  it('handles login error with JSON response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ error: 'Invalid credentials from server' }))
    });

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials from server')).toBeInTheDocument();
    });
  });

  it('handles login error with non-JSON response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('Server error occurred')
    });

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    });
  });

  it('handles malformed JSON error response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('{ invalid json }')
    });

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('{ invalid json }')).toBeInTheDocument();
    });
  });

  it('handles empty response text on success', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('')
    });

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('Enter your credentials to access the admin panel')).toBeInTheDocument();
    });
  });

  it('handles successful Google login requiring additional info', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        requiresAdditionalInfo: true,
        tempToken: 'temp-token-123'
      })
    });

    renderComponent();
    
    const googleButton = screen.getByText('Sign in with Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/complete-signup', {
        state: { token: 'temp-token-123' }
      });
    });
  });

  it('handles successful Google login without additional info needed', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        requiresAdditionalInfo: false,
        token: 'google-auth-token'
      })
    });

    renderComponent();
    
    const googleButton = screen.getByText('Sign in with Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('google-auth-token');
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  it('handles Google login error', async () => {
    fetch.mockRejectedValueOnce(new Error('Google auth failed'));

    renderComponent();
    
    const googleButton = screen.getByText('Sign in with Google');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Google auth failed')).toBeInTheDocument();
    });
  });

  it('handles Google login onError callback', () => {
    renderComponent();
    
    // Trigger the onError callback by firing the error event
    const googleButton = screen.getByText('Sign in with Google');
    fireEvent.error(googleButton);
    
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('handles remember me checkbox toggle', () => {
    renderComponent();
    
    const checkbox = screen.getByLabelText('Remember me');
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('shows loading state during form submission', async () => {
    // Mock a delayed response
    fetch.mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({
            token: 'mock-token',
            user: { role: 'admin' }
          }))
        }), 100);
      })
    );

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    // Should show loading state
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.queryByText('Logging in...')).not.toBeInTheDocument();
    });
  });

  it('handles network error during login', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('renders all UI elements correctly', () => {
    renderComponent();
    
    // Header elements
    expect(screen.getByText('Constitutional Archive')).toBeInTheDocument();
    
    // Form elements
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Remember me')).toBeInTheDocument();
    
    // Links
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/admin/signup');
    expect(screen.getByRole('link', { name: /constitutional archive/i })).toHaveAttribute('href', '/');
    
    // Footer
    expect(screen.getByText('© 2025 Constitutional Archive. All rights reserved.')).toBeInTheDocument();
  });
});