import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminLogin from './AdminLogin';
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';

// Mock the Google OAuth provider
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: () => <button>Sign in with Google</button>
}));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'mock-token', user: { role: 'admin' } }),
  })
);

// Mock the ForgotPasswordModal component
jest.mock('./components/ForgotPasswordModal', () => () => <div>Forgot Password Modal</div>);

describe('AdminLogin Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  const renderComponent = (withToken = false) => {
    const initialEntries = withToken ? ['/admin/login/reset-token'] : ['/admin/login'];
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <AdminLogin />
      </MemoryRouter>
    );
  };

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
      // These errors come from the browser's native validation
      expect(screen.getByPlaceholderText('admin@example.com')).toBeInvalid();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInvalid();
    });
  });

  it('toggles password visibility', () => {
    renderComponent();
    
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    // Password should be hidden by default
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('submits the form successfully', async () => {
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Login'));
    
    // Check loading state
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('authToken')).toBe('mock-token');
    });
  });

  it('shows error message when login fails', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('Invalid credentials'),
      })
    );
    
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows Forgot Password Modal when token is in URL', () => {
    renderComponent(true);
    expect(screen.getByText('Forgot Password Modal')).toBeInTheDocument();
  });

  it('opens and closes Forgot Password Modal', async () => {
    renderComponent();
    
    // Modal should be closed initially
    expect(screen.queryByText('Forgot Password Modal')).not.toBeInTheDocument();
    
    // Click forgot password link
    fireEvent.click(screen.getByText('Forgot password?'));
    
    // Modal should be open
    expect(screen.getByText('Forgot Password Modal')).toBeInTheDocument();
  });

  it('renders Google sign in button', () => {
    renderComponent();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });

  it('handles remember me checkbox', () => {
    renderComponent();
    
    const checkbox = screen.getByLabelText('Remember me');
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});