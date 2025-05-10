// src/AdminSignup.test.js
import React from 'react';
import { Routes, Route} from "react-router-dom" ;
import { render, screen, fireEvent } from '@testing-library/react';
import AdminSignup from './AdminSignup'; // <-- adjust this path if needed
import '@testing-library/jest-dom';

describe('Admin Signup Page', () => {
  test('renders all fields correctly', () => {
    render(<AdminSignup />);

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Administrator Access Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/I agree to the Terms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Admin Account/i })).toBeInTheDocument();
  });

  test('fills out and submits form', () => {
    render(<AdminSignup />);

    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/Administrator Access Code/i), { target: { value: 'ACCESS123' } });
    fireEvent.click(screen.getByLabelText(/I agree to the Terms/i));

    fireEvent.click(screen.getByRole('button', { name: /Create Admin Account/i }));

  
  });
});
