import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from './AdminDashboard';

// Mock the useNavigate hook
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  test('renders the dashboard with correct title and welcome message', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Admin')).toBeInTheDocument();
  });

  test('displays sidebar navigation menu with all links', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('Constitutional Archive')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Manage')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('displays all statistics cards with correct data', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('Total Documents')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    
    expect(screen.getByText('Storage Used')).toBeInTheDocument();
    expect(screen.getByText('64 GB')).toBeInTheDocument();
    
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('89')).toBeInTheDocument();
  });

  test('displays recent uploads table with correct data', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('Recent Uploads')).toBeInTheDocument();
    expect(screen.getByText('Constitution_1996.pdf')).toBeInTheDocument();
    expect(screen.getByText('Amendments')).toBeInTheDocument();
    
    // Check table headers
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Name');
    expect(headers[1]).toHaveTextContent('Type');
    expect(headers[2]).toHaveTextContent('Date');
    expect(headers[3]).toHaveTextContent('Size');
    
    // Check file details
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Directory')).toBeInTheDocument();
    expect(screen.getByText('2025-04-01')).toBeInTheDocument();
    expect(screen.getByText('2025-04-02')).toBeInTheDocument();
    expect(screen.getByText('2.4 MB')).toBeInTheDocument();
    expect(screen.getByText('48 KB')).toBeInTheDocument();
  });

  test('displays Quick Actions section with buttons', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
    expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
  });

  test('displays System Health section with correct information', () => {
    render(<AdminDashboard />);
    
    expect(screen.getByText('System Health')).toBeInTheDocument();
    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByText('64 GB / 100 GB')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  test('calls logout function and removes token when logout button is clicked', () => {
    render(<AdminDashboard />);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(window.localStorage.removeItem).toHaveBeenCalledWith('adminToken');
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  test('all icons are properly rendered', () => {
    render(<AdminDashboard />);
    
    // Test sidebar icons
    expect(screen.getByTestId('barchart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.getByTestId('folder-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    
    // Test stat icons
    expect(screen.getByTestId('stat-icon-0')).toBeInTheDocument();
    expect(screen.getByTestId('stat-icon-1')).toBeInTheDocument();
    expect(screen.getByTestId('stat-icon-2')).toBeInTheDocument();
    
    // Test other icons
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon-quickaction')).toBeInTheDocument();
  });

  test('New Upload button is present in Recent Uploads section', () => {
    render(<AdminDashboard />);
    
    const newUploadButton = screen.getByText('New Upload');
    expect(newUploadButton).toBeInTheDocument();
  });
});