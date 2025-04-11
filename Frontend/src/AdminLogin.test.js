import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminLogin from './AdminLogin';

// Helper to wrap with router
const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('AdminLogin', () => {
  test('renders the login form with all elements', () => {
    renderWithRouter(<AdminLogin />);
    expect(screen.getByText(/admin login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows error on invalid credentials', async () => {
    renderWithRouter(<AdminLogin />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    const alert = await waitFor(() =>
      screen.getByRole('alert')
    );

    expect(alert).toHaveTextContent(/invalid email or password/i);
  });

  test('does not show error on correct credentials and redirects', async () => {
    renderWithRouter(<AdminLogin />);
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('adminToken')).toBe('dummy-token');
    });
  });

  test('toggles password visibility', () => {
    renderWithRouter(<AdminLogin />);
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', {
      name: /show password/i,
    });

    // Initially hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Toggle to visible
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});
