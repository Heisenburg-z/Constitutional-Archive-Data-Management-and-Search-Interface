// src/components/Dashboard/__tests__/QuickActions.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickActions from './QuickActions';

describe('QuickActions Component', () => {
  // Mock functions for the component's props
  const mockGenerateReport = jest.fn();
  const mockSetShowUploadModal = jest.fn();
  
  const defaultProps = {
    generateReport: mockGenerateReport,
    setShowUploadModal: mockSetShowUploadModal
  };

  beforeEach(() => {
    // Clear mock calls between tests
    mockGenerateReport.mockClear();
    mockSetShowUploadModal.mockClear();
  });

  test('renders with correct title and buttons', () => {
    render(<QuickActions {...defaultProps} />);
    
    // Check if the section title is rendered
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    
    // Check if both buttons are rendered
    expect(screen.getByText('Generate Report')).toBeInTheDocument();
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  test('calls generateReport when Generate Report button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    
    // Find and click the Generate Report button
    const generateReportButton = screen.getByText('Generate Report');
    fireEvent.click(generateReportButton);
    
    // Check if the mockGenerateReport function was called
    expect(mockGenerateReport).toHaveBeenCalledTimes(1);
  });

  test('calls setShowUploadModal when Upload Document button is clicked', () => {
    render(<QuickActions {...defaultProps} />);
    
    // Find and click the Upload Document button
    const uploadDocumentButton = screen.getByText('Upload Document');
    fireEvent.click(uploadDocumentButton);
    
    // Check if mockSetShowUploadModal was called with the correct argument
    expect(mockSetShowUploadModal).toHaveBeenCalledTimes(1);
    expect(mockSetShowUploadModal).toHaveBeenCalledWith(true);
  });

  test('renders icons correctly', () => {
    const { container } = render(<QuickActions {...defaultProps} />);
    
    // Check if SVG icons are present
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBe(2); // Two icons: FileText and Upload
  });

  test('applies the correct CSS classes', () => {
    const { container } = render(<QuickActions {...defaultProps} />);
    
    // Check if the main element has the expected classes
    const sectionElement = container.firstChild;
    expect(sectionElement).toHaveClass('bg-white');
    expect(sectionElement).toHaveClass('rounded-xl');
    expect(sectionElement).toHaveClass('shadow-sm');
    expect(sectionElement).toHaveClass('p-6');
    expect(sectionElement).toHaveClass('border');
    expect(sectionElement).toHaveClass('border-gray-100');
    
    // Check button hover states
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('hover:bg-gray-100');
    });
  });
});