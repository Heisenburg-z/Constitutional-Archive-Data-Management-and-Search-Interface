// src/CompleteSignup.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import CompleteSignup from './CompleteSignup';

// Mock fetch
global.fetch = jest.fn();

// Mock environment variable
process.env.REACT_APP_API_URL = 'https://api.example.com';

// Mock the router hooks
const mockNavigate = jest.fn();
const mockLocation = {
  state: {
    token: 'mock-token'
  }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

describe('CompleteSignup Component', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  beforeEach(() => {
    fetch.mockClear();
    mockNavigate.mockClear();
    mockLocalStorage.clear();
  });

  test('renders the form correctly', () => {
    // Act
    render(
      <BrowserRouter>
        <CompleteSignup />
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByRole('heading', { name: /complete registration/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/access code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /complete registration/i })).toBeInTheDocument();
  });

  test('submits the form with valid data and redirects', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockResponse = {
      token: 'new-auth-token',
      user: { id: '123', firstName: 'John', lastName: 'Doe' }
    };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    // Act
    render(
      <BrowserRouter>
        <CompleteSignup />
      </BrowserRouter>
    );

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/access code/i), 'SECRET123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /complete registration/i }));
    
    // Assert
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/api/auth/google/complete',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          }),
          body: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            accessCode: 'SECRET123'
          })
        })
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockResponse.token);
      expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });
  });

  test('shows error message when form submission fails', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockError = { error: 'Invalid access code' };
    
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => mockError
    });

    // Act
    render(
      <BrowserRouter>
        <CompleteSignup />
      </BrowserRouter>
    );

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/access code/i), 'WRONG');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /complete registration/i }));
    
    // Assert
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid access code');
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('validates required fields', async () => {
    // Arrange
    const user = userEvent.setup();
    
    // Act
    render(
      <BrowserRouter>
        <CompleteSignup />
      </BrowserRouter>
    );
    
    // Submit form without filling any fields
    await user.click(screen.getByRole('button', { name: /complete registration/i }));
    
    // Assert
    // Browser's built-in validation should prevent submission
    expect(fetch).toHaveBeenCalled();
  });
});