import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminSignup from './AdminSignup';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the Google OAuth provider to avoid actual Google API calls
jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <div>{children}</div>,
  GoogleLogin: () => <button>Sign up with Google</button>
}));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'mock-token', user: {} }),
  })
);

describe('AdminSignup Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  const renderComponent = () => {
    return render(
      <Router>
        <AdminSignup />
      </Router>
    );
  };

  it('renders the signup form correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Admin Registration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a secure password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter admin access code')).toBeInTheDocument();
    expect(screen.getByText('Create Admin Account')).toBeInTheDocument();
    expect(screen.getByText('Back to login')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Create Admin Account'));
    
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('Access code is required')).toBeInTheDocument();
      expect(screen.getByText('You must accept the terms')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), {
      target: { value: 'invalid-email' }
    });
    
    fireEvent.click(screen.getByText('Create Admin Account'));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('validates password complexity', async () => {
    renderComponent();
    
    const passwordInput = screen.getByPlaceholderText('Create a secure password');
    
    // Test too short password
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.click(screen.getByText('Create Admin Account'));
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
    
    // Test missing uppercase
    fireEvent.change(passwordInput, { target: { value: 'lowercase1!' } });
    fireEvent.click(screen.getByText('Create Admin Account'));
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
    });
    
    // Test missing lowercase
    fireEvent.change(passwordInput, { target: { value: 'UPPERCASE1!' } });
    fireEvent.click(screen.getByText('Create Admin Account'));
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
    });
    
    // Test missing number
    fireEvent.change(passwordInput, { target: { value: 'Password!' } });
    fireEvent.click(screen.getByText('Create Admin Account'));
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
    });
    
    // Test missing special character
    fireEvent.change(passwordInput, { target: { value: 'Password1' } });
    fireEvent.click(screen.getByText('Create Admin Account'));
    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one special character')).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    renderComponent();
    
    fireEvent.change(screen.getByPlaceholderText('Create a secure password'), {
      target: { value: 'ValidPassword1!' }
    });
    
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), {
      target: { value: 'DifferentPassword1!' }
    });
    
    fireEvent.click(screen.getByText('Create Admin Account'));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('toggles password visibility', () => {
    renderComponent();
    
    const passwordInput = screen.getByPlaceholderText('Create a secure password');
    const toggleButton = screen.getAllByRole('button', { name: /show password/i })[0];
    
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
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a secure password'), { target: { value: 'ValidPassword1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'ValidPassword1!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter admin access code'), { target: { value: 'valid-code' } });
    fireEvent.click(screen.getByLabelText(/I agree to the Terms/i));
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Admin Account'));
    
    // Check loading state
    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error message when submission fails', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Registration failed' }),
      })
    );
    
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'User' } });
    fireEvent.change(screen.getByPlaceholderText('admin@example.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Create a secure password'), { target: { value: 'ValidPassword1!' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm your password'), { target: { value: 'ValidPassword1!' } });
    fireEvent.change(screen.getByPlaceholderText('Enter admin access code'), { target: { value: 'valid-code' } });
    fireEvent.click(screen.getByLabelText(/I agree to the Terms/i));
    
    // Submit the form
    fireEvent.click(screen.getByText('Create Admin Account'));
    
    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  it('renders Google signup button', () => {
    renderComponent();
    expect(screen.getByText('Sign up with Google')).toBeInTheDocument();
  });
});