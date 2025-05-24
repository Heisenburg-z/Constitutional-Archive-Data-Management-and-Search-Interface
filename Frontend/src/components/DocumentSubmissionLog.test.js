import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DocumentSubmissionLog from './DocumentSubmissionLog';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  History: () => <div data-testid="history-icon" />,
  User: () => <div data-testid="user-icon" />,
  Download: () => <div data-testid="download-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  FileText: () => <div data-testid="filetext-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />
}));

describe('DocumentSubmissionLog Component', () => {
  const mockDocument = {
    _id: '1',
    name: 'test-document.pdf',
    type: 'file',
    createdAt: '2024-01-15T10:30:00.000Z',
    createdBy: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'user'
    },
    metadata: {
      title: 'Test Document Title'
    }
  };

  const mockAdminDocument = {
    _id: '2',
    name: 'admin-document.pdf',
    type: 'directory',
    createdAt: '2024-01-16T14:45:00.000Z',
    createdBy: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'admin'
    }
  };

  const defaultProps = {
    documents: [],
    handleDownloadDocument: jest.fn(),
    handleEditMetadata: jest.fn(),
    setDocumentToDelete: jest.fn(),
    downloadingDocs: {},
    isDeleting: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders with default props', () => {
      render(<DocumentSubmissionLog {...defaultProps} />);
      
      expect(screen.getByText('Document Submission Log')).toBeInTheDocument();
      expect(screen.getByText('No documents submitted yet')).toBeInTheDocument();
    });

    test('renders header section correctly', () => {
      render(<DocumentSubmissionLog {...defaultProps} />);
      
      expect(screen.getByTestId('history-icon')).toBeInTheDocument();
      expect(screen.getByText('Document Submission Log')).toBeInTheDocument();
      expect(screen.getByText('No documents submitted yet')).toBeInTheDocument();
    });

    test('renders empty state when no documents', () => {
      render(<DocumentSubmissionLog {...defaultProps} />);
      
      expect(screen.getByText('No documents have been submitted yet')).toBeInTheDocument();
      expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
    });

    test('renders table when documents are provided', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Document')).toBeInTheDocument();
      expect(screen.getByText('Submitted By')).toBeInTheDocument();
      expect(screen.getByText('Submission Date')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles non-array documents prop', () => {
      const props = {
        ...defaultProps,
        documents: null
      };
      
      render(<DocumentSubmissionLog/>);
      
      expect(screen.getByText('No documents submitted yet')).toBeInTheDocument();
    });

    test('handles undefined documents prop', () => {
      const props = {
        ...defaultProps,
        documents: undefined
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByText('No documents have been submitted yet')).toBeInTheDocument();
    });
  });

  describe('Document Display', () => {
    test('displays document information correctly', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
      expect(screen.getByText('Test Document Title')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('file')).toBeInTheDocument();
    });

    test('displays admin badge for admin users', () => {
      const props = {
        ...defaultProps,
        documents: [mockAdminDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toHaveClass('bg-green-100', 'text-green-800');
    });

    test('handles missing metadata gracefully', () => {
      const docWithoutMetadata = {
        ...mockDocument,
        metadata: undefined
      };
      
      const props = {
        ...defaultProps,
        documents: [docWithoutMetadata]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
      expect(screen.queryByText('Test Document Title')).not.toBeInTheDocument();
    });

    test('handles missing createdBy information', () => {
      const docWithoutCreatedBy = {
        ...mockDocument,
        createdBy: {}
      };
      
      const props = {
        ...defaultProps,
        documents: [docWithoutCreatedBy]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    });
  });

  describe('Document Type Styling', () => {
    test('applies correct styling for file type', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const typeElement = screen.getByText('file');
      expect(typeElement).toHaveClass('bg-blue-100', 'text-blue-800');
    });

    test('applies correct styling for directory type', () => {
      const props = {
        ...defaultProps,
        documents: [mockAdminDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const typeElement = screen.getByText('directory');
      expect(typeElement).toHaveClass('bg-purple-100', 'text-purple-800');
    });

    test('applies default styling for unknown type', () => {
      const docWithUnknownType = {
        ...mockDocument,
        type: 'unknown'
      };
      
      const props = {
        ...defaultProps,
        documents: [docWithUnknownType]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const typeElement = screen.getByText('unknown');
      expect(typeElement).toHaveClass('bg-gray-100', 'text-gray-800');
    });
  });

  describe('Date Formatting', () => {
    test('formats dates correctly', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      // Check that date is displayed (format may vary by locale)
      const dateElements = screen.getAllByText(/2024|1\/15|15\/1/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Document Sorting', () => {
    test('sorts documents by creation date (newest first)', () => {
      const olderDoc = {
        ...mockDocument,
        _id: 'older',
        name: 'older-document.pdf',
        createdAt: '2024-01-10T10:30:00.000Z'
      };
      
      const newerDoc = {
        ...mockDocument,
        _id: 'newer',
        name: 'newer-document.pdf',
        createdAt: '2024-01-20T10:30:00.000Z'
      };
      
      const props = {
        ...defaultProps,
        documents: [olderDoc, newerDoc]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const rows = screen.getAllByRole('row');
      // First row is header, second should be newer document
      expect(rows[1]).toHaveTextContent('newer-document.pdf');
      expect(rows[2]).toHaveTextContent('older-document.pdf');
    });
  });

  describe('Action Buttons', () => {
    test('renders all action buttons', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
      expect(screen.getByTestId('edit-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });

    test('calls handleDownloadDocument when download button is clicked', () => {
      const mockHandleDownload = jest.fn();
      const props = {
        ...defaultProps,
        documents: [mockDocument],
        handleDownloadDocument: mockHandleDownload
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const downloadButton = screen.getByTitle('Download');
      fireEvent.click(downloadButton);
      
      expect(mockHandleDownload).toHaveBeenCalledWith(mockDocument);
    });

    test('calls handleEditMetadata when edit button is clicked', () => {
      const mockHandleEdit = jest.fn();
      const props = {
        ...defaultProps,
        documents: [mockDocument],
        handleEditMetadata: mockHandleEdit
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const editButton = screen.getByTitle('Edit');
      fireEvent.click(editButton);
      
      expect(mockHandleEdit).toHaveBeenCalledWith(mockDocument);
    });

    test('calls setDocumentToDelete when delete button is clicked', () => {
      const mockSetDocumentToDelete = jest.fn();
      const props = {
        ...defaultProps,
        documents: [mockDocument],
        setDocumentToDelete: mockSetDocumentToDelete
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const deleteButton = screen.getByTitle('Delete');
      fireEvent.click(deleteButton);
      
      expect(mockSetDocumentToDelete).toHaveBeenCalledWith('1');
    });

    test('disables download button when document is being downloaded', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument],
        downloadingDocs: { '1': true }
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const downloadButton = screen.getByTitle('Download');
      expect(downloadButton).toBeDisabled();
    });

    test('disables delete button when deletion is in progress', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument],
        isDeleting: true
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const deleteButton = screen.getByTitle('Delete');
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Table Structure', () => {
    test('has correct table headers', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByTestId('filetext-icon')).toBeInTheDocument();
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
    });

    test('applies hover effects to table rows', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const row = screen.getByRole('row', { name: /test-document.pdf/i });
      expect(row).toHaveClass('hover:bg-gray-50', 'transition-colors');
    });
  });

  describe('Responsive Design', () => {
    test('applies overflow-x-auto for table responsiveness', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      const tableContainer = screen.getByRole('table').parentElement;
      expect(tableContainer).toHaveClass('overflow-x-auto');
    });
  });

  describe('Accessibility', () => {
    test('has proper button titles for screen readers', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByTitle('Download')).toBeInTheDocument();
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
      expect(screen.getByTitle('Delete')).toBeInTheDocument();
    });

    test('has proper table structure', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(5);
      expect(screen.getAllByRole('row')).toHaveLength(2); // header + 1 data row
    });
  });

  describe('Dynamic Content Updates', () => {
    test('updates description based on document count', () => {
      const { rerender } = render(<DocumentSubmissionLog {...defaultProps} />);
      
      expect(screen.getByText('No documents submitted yet')).toBeInTheDocument();
      
      rerender(<DocumentSubmissionLog {...defaultProps} documents={[mockDocument]} />);
      
      expect(screen.getByText('Track all document submissions with upload details')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    test('renders without crashing with minimal props', () => {
      expect(() => render(<DocumentSubmissionLog />)).not.toThrow();
    });

    test('handles multiple documents correctly', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument, mockAdminDocument]
      };
      
      render(<DocumentSubmissionLog {...props} />);
      
      expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
      expect(screen.getByText('admin-document.pdf')).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
    });
  });

  describe('Snapshot Testing', () => {
    test('matches snapshot with no documents', () => {
      const { container } = render(<DocumentSubmissionLog {...defaultProps} />);
      expect(container.firstChild).toMatchSnapshot();
    });

    test('matches snapshot with documents', () => {
      const props = {
        ...defaultProps,
        documents: [mockDocument, mockAdminDocument]
      };
      
      const { container } = render(<DocumentSubmissionLog {...props} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});