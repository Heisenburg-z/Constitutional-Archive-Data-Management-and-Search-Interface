import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoTab from './VideoTab';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

beforeEach(() => {
  fetch.resetMocks();
  process.env.REACT_APP_API_URL = 'http://mock-api';
  // Mock console.error to clean up test output
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('VideoTab Component', () => {
  test('renders initial state correctly', () => {
    render(<VideoTab />);
    expect(screen.getByText('Educational Videos')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search videos...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  test('displays loading state while fetching data', async () => {
    fetch.mockResponseOnce(() => new Promise(resolve => 
      setTimeout(() => resolve(JSON.stringify({ results: [] })), 100)
    ));
    
    render(<VideoTab />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Search' }));
      await waitFor(() => {
        expect(screen.getByText('Loading videos...')).toBeInTheDocument();
      });
    });
  });

  test('displays videos after successful fetch', async () => {
    const mockData = {
      results: [{
        id: 1,
        title: 'Test Video',
        url: 'https://youtu.be/test',
        thumbnail: 'test.jpg',
        author: 'Test Author',
        date: '2023-01-01',
        keywords: ['test']
      }]
    };

    fetch.mockResponseOnce(JSON.stringify(mockData));
    
    render(<VideoTab />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument();
      expect(screen.getByText(/Test Author/)).toBeInTheDocument(); // More flexible text matching
    });
  });

  test('handles API errors gracefully', async () => {
    fetch.mockReject(new Error('API Error'));
    
    render(<VideoTab />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load videos. Please try again later.')).toBeInTheDocument();
    });
  });

  test('opens and closes video modal', async () => {
    const mockData = {
      results: [{
        id: 1,
        title: 'Test Video',
        url: 'https://youtu.be/test',
        thumbnail: 'test.jpg',
        author: 'Test Author',
        date: '2023-01-01',
        keywords: ['test']
      }]
    };

    fetch.mockResponseOnce(JSON.stringify(mockData));
    
    const { container } = render(<VideoTab />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Test Video'));
    });

    // Look for modal using more specific selectors
    const modal = container.querySelector('.fixed.inset-0');
    expect(modal).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(modal).not.toBeInTheDocument();
  });

  test('displays mock data in development environment', async () => {
    process.env.NODE_ENV = 'development';
    fetch.mockReject(new Error('API Error'));
    
    render(<VideoTab />);
    
    await waitFor(() => {
      expect(screen.getByText(/South Africa's Bill of Rights Explained/i)).toBeInTheDocument();
    });
  });

  test('handles empty state when no videos found', async () => {
    fetch.mockResponseOnce(JSON.stringify({ results: [] }));
    
    render(<VideoTab />);
    
    await waitFor(() => {
      expect(screen.getByText('No videos found.')).toBeInTheDocument();
    });
  });
});