// src/CompleteSignup.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import CompleteSignup from './CompleteSignup';

// Mock the useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ token: 'mock-token' }),
  })
);

describe('CompleteSignup Component', () => {
  beforeEach(() => {
    // Clear all mocks and localStorage before each test
    fetch.mockClear();
    localStorage.clear();
    useLocation.mockImplementation(() => ({
      state: { token: 'mock-temp-token' }
    }));
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CompleteSignup />
      </MemoryRouter>
    );
  };

  it('renders the complete signup form correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Complete Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Access Code')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Complete Registration' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Complete Registration'));
    
    await waitFor(() => {
      // These errors come from the browser's native validation
      expect(screen.getByLabelText('First Name')).toBeInvalid();
      expect(screen.getByLabelText('Last Name')).toBeInvalid();
      expect(screen.getByLabelText('Access Code')).toBeInvalid();
    });
  });

  it('updates form data when input values change', () => {
    renderComponent();
    
    const firstNameInput = screen.getByLabelText('First Name');
    const lastNameInput = screen.getByLabelText('Last Name');
    const accessCodeInput = screen.getByLabelText('Access Code');
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(accessCodeInput, { target: { value: 'admin123' } });
    
    expect(firstNameInput.value).toBe('John');
    expect(lastNameInput.value).toBe('Doe');
    expect(accessCodeInput.value).toBe('admin123');
  });

  it('submits the form successfully', async () => {
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Access Code'), { target: { value: 'admin123' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Complete Registration'));
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/auth/google/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-temp-token'
          },
          body: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            accessCode: 'admin123'
          })
        }
      );
      expect(localStorage.getItem('authToken')).toBe('mock-token');
    });
  });

  it('handles submission errors', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid access code' }),
      })
    );
    
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Access Code'), { target: { value: 'wrong-code' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Complete Registration'));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid access code');
    });
  });

  it('shows error when token is missing', async () => {
    useLocation.mockImplementation(() => ({}));
    
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Access Code'), { target: { value: 'admin123' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Complete Registration'));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Missing token');
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  it('handles network errors', async () => {
    fetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Access Code'), { target: { value: 'admin123' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Complete Registration'));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });
});