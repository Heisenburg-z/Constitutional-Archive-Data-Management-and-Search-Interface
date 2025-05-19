import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { Wrapper } from './testUtils'; // Assuming you use a custom wrapper (e.g. Router/provider context)
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('AdminDashboard', () => {
  it('renders dashboard with stats and sections', async () => {
    fetchMock
      .mockResponseOnce(JSON.stringify([])) // recent uploads
      .mockResponseOnce(JSON.stringify({ total: 0 })) // document count
      .mockResponseOnce(JSON.stringify({ usedStorage: '5MB' })) // storage
      .mockResponseOnce(JSON.stringify({ account: 'Loading...' })); // account info

    render(<AdminDashboard />, { wrapper: Wrapper });

    // Wait for async fetches to complete
    await waitFor(() => {
      expect(screen.getByText(/Total Documents/i)).toBeInTheDocument();
      expect(screen.getByText(/Storage Used/i)).toBeInTheDocument();
      expect(screen.getByText(/Account/i)).toBeInTheDocument();
      expect(screen.getByText(/FeaturedDocuments/i)).toBeInTheDocument();
    });
  });

  it('opens upload modal on sidebar click', async () => {
    render(<AdminDashboard />, { wrapper: Wrapper });

    const uploadButton = screen.getByText(/upload/i);
    fireEvent.click(uploadButton);

    expect(screen.getByText(/Upload File/i)).toBeInTheDocument(); // Modal heading
  });

  it('calls generateReport when button clicked', async () => {
    const mockGenerateReport = jest.fn();
    jest.mock('./generateReport', () => ({
      generateReport: () => mockGenerateReport(),
    }));

    render(<AdminDashboard />, { wrapper: Wrapper });

    const button = screen.getByText(/generate report/i);
    fireEvent.click(button);

    // Optional: wait if async
    await waitFor(() => {
      expect(mockGenerateReport).toHaveBeenCalled();
    });
  });
});
