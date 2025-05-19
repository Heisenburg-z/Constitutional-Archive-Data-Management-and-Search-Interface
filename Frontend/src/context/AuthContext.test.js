// src/AuthContext.test.js
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

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

// Mock navigate function
const mockNavigate = jest.fn();

// Mock the router hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Component to test the context
function TestComponent() {
  const { user, logout } = useAuth();
  return (
    <div>
      <div data-testid="user-info">{user ? JSON.stringify(user) : 'No user'}</div>
      <button onClick={logout} data-testid="logout-button">Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  test('provides user from localStorage on load', () => {
    // Arrange
    const mockUser = { id: '123', name: 'Test User' };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));

    // Act
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByTestId('user-info').textContent).toBe(JSON.stringify(mockUser));
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
  });

  test('logout removes user data and redirects to login', async () => {
    // Arrange
    const user = userEvent.setup();
    const mockUser = { id: '123', name: 'Test User' };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUser));

    // Act
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Click logout button
    await user.click(screen.getByTestId('logout-button'));

    // Assert
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    await waitFor(() => {
      // After logout, user state should be null
      expect(screen.getByTestId('user-info').textContent).toBe('No user');
    });
  });

  test('provides null user when localStorage is empty', () => {
    // Arrange - localStorage is empty by default after clear
    
    // Act
    render(
      <BrowserRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </BrowserRouter>
    );

    // Assert
    expect(screen.getByTestId('user-info').textContent).toBe('No user');
  });
});