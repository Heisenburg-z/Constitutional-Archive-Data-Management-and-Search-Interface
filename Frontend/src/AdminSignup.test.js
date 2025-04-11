// AdminSignup.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSignup from './AdminSignup';

describe('AdminSignup Component', () => {
  const fillAndSubmitForm = async (overrides = {}) => {
    const defaultData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      accessCode: 'admin123',
    };

    const formData = { ...defaultData, ...overrides };

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: formData.firstName },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: formData.lastName },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: formData.email },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: formData.password },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: formData.confirmPassword },
    });
    fireEvent.change(screen.getByLabelText(/Access Code/i), {
      target: { value: formData.accessCode },
    });

    fireEvent.click(screen.getByRole('checkbox'));

    fireEvent.click(screen.getByRole('button', { name: /Create Admin Account/i }));
  };

  beforeEach(() => {
    render(
      <MemoryRouter>
        <AdminSignup />
      </MemoryRouter>
    );
  });

  test('renders the admin registration form', () => {
    expect(screen.getByText(/Admin Registration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
  });

  test('shows validation errors when submitting empty form', async () => {
    fireEvent.click(screen.getByRole('button', { name: /Create Admin Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Email address is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Access code is required/i)).toBeInTheDocument();
      expect(screen.getByText(/You must accept the terms/i)).toBeInTheDocument();
    });
  });

  test('shows error when passwords do not match', async () => {
    await fillAndSubmitForm({ confirmPassword: 'differentPass' });

    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    const toggleButtons = screen.getAllByLabelText(/Show password/i);
    fireEvent.click(toggleButtons[0]);

    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('submits the form successfully', async () => {
    await fillAndSubmitForm();

    expect(await screen.findByText(/Creating Account/i)).toBeInTheDocument();
  });
});
