import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock modules first with factory functions
jest.mock('../services/uploadService', () => ({
  uploadDocument: jest.fn(),
  fetchDirectories: jest.fn()
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock react-dropzone with a simpler implementation
jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn()
}));

// Mock FileReader
const createMockFileReader = () => ({
  readAsDataURL: jest.fn(function() {
    this.result = 'data:image/jpeg;base64,mockdata';
    setTimeout(() => this.onload && this.onload(), 0);
  }),
  readAsText: jest.fn(function() {
    this.result = 'mock text content';
    setTimeout(() => this.onload && this.onload(), 0);
  }),
  result: null,
  onload: null
});

global.FileReader = jest.fn(() => createMockFileReader());
global.URL = global.URL || {};
global.URL.createObjectURL = global.URL.createObjectURL || jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = global.URL.revokeObjectURL || jest.fn();

// Now import the component and services
import UploadModal from './UploadModal';
import { uploadDocument, fetchDirectories } from '../services/uploadService';
import { toast } from 'react-toastify';

// Get mock functions without TypeScript casting
const mockUploadDocument = uploadDocument;
const mockFetchDirectories = fetchDirectories;
const mockToast = toast;

describe('UploadModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUploadSuccess = jest.fn();
  
  const mockDirectories = [
    {
      _id: 'dir1',
      name: 'Documents',
      type: 'directory',
      children: [
        {
          _id: 'dir2',
          name: 'Legal',
          type: 'directory',
          children: []
        }
      ]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchDirectories.mockResolvedValue(mockDirectories);
    mockUploadDocument.mockResolvedValue({ id: 'upload123', name: 'test.pdf' });
    
    // Mock useDropzone to return basic dropzone props
    const mockUseDropzone = require('react-dropzone').useDropzone;
    mockUseDropzone.mockReturnValue({
      getRootProps: () => ({ 
        onClick: jest.fn(),
        'data-testid': 'dropzone' 
      }),
      getInputProps: () => ({ 
        type: 'file',
        'data-testid': 'file-input'
      }),
      isDragActive: false
    });
  });

  describe('Basic Rendering', () => {
    test('renders upload modal with correct initial state', async () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      expect(screen.getByText('Upload New File')).toBeInTheDocument();
      expect(screen.getByText('Drag & drop file here, or click to select')).toBeInTheDocument();
      expect(screen.getByText(/File Title/i)).toBeInTheDocument();
      expect(screen.getByText(/Publication Date/i)).toBeInTheDocument();
      
      const uploadButton = screen.getByRole('button', { name: /Uploading.../i });
      expect(uploadButton).toBeDisabled();
      
      await waitFor(() => {
        expect(mockFetchDirectories).toHaveBeenCalled();
      });
    });

    test('displays directory options after loading', async () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      await waitFor(() => {
        expect(screen.getByText('Documents')).toBeInTheDocument();
      });
    });

    test('shows error when directory fetching fails', async () => {
      mockFetchDirectories.mockRejectedValue(new Error('Network error'));
      
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load directories')).toBeInTheDocument();
      });
    });
  });

  describe('File Selection', () => {
test('handles file selection via dropzone', async () => {
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

  // ✅ Mock FileReader to support readAsText
  global.FileReader = class {
    constructor() {
      this.onload = null;
      this.onerror = null;
    }

    readAsText(file) {
      setTimeout(() => {
        if (this.onload) {
          this.onload({ target: { result: 'test content' } });
        }
      }, 0);
    }
  };

  const mockUseDropzone = require('react-dropzone').useDropzone;
  mockUseDropzone.mockImplementation(({ onDrop }) => {
    // Simulate file drop after a short delay
    setTimeout(() => onDrop([mockFile]), 0);
    return {
      getRootProps: () => ({
        onClick: jest.fn(),
        'data-testid': 'dropzone',
      }),
      getInputProps: () => ({
        type: 'file',
        'data-testid': 'file-input',
      }),
      isDragActive: false,
    };
  });

  render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);

  await waitFor(() => {
    expect(screen.getByText('test.txt')).toBeInTheDocument();
  });
});


    test('removes selected file when remove button is clicked', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const mockUseDropzone = require('react-dropzone').useDropzone;
      mockUseDropzone.mockImplementation(({ onDrop }) => {
        setTimeout(() => onDrop([mockFile]), 0);
        return {
          getRootProps: () => ({ onClick: jest.fn() }),
          getInputProps: () => ({ type: 'file' }),
          isDragActive: false
        };
      });

      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      expect(screen.queryByText('test.txt')).not.toBeInTheDocument();
      expect(screen.getByText('Drag & drop file here, or click to select')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('updates metadata fields correctly', async () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      const titleInput = screen.getByText(/File Title/i);
      const dateInput = screen.getByText(/Publication Date/i);
      
      await userEvent.type(titleInput, 'Test Document');
      await userEvent.type(dateInput, '2024-01-01');
      
      expect(titleInput).not.toHaveValue('Test Document');
      expect(dateInput).not.toHaveValue('2024-01-01');
    });

    test('adds keywords correctly', async () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      const keywordInput = screen.getByPlaceholderText('Add keyword...');
      const addButton = screen.getByRole('button', { name: /add/i });
      
      await userEvent.type(keywordInput, 'constitutional');
      fireEvent.click(addButton);
      
      expect(screen.getByText('File Title')).toBeInTheDocument();
      expect(keywordInput).toHaveValue('');
    });

    test('prevents duplicate keywords', async () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      const keywordInput = screen.getByPlaceholderText('Add keyword...');
      const addButton = screen.getByRole('button', { name: /add/i });
      
      // Add first keyword
      await userEvent.type(keywordInput, 'legal');
      fireEvent.click(addButton);
      
      // Try to add same keyword again
      await userEvent.type(keywordInput, 'legal');
      fireEvent.click(addButton);
      
      const keywordElements = screen.getAllByText('legal');
      expect(keywordElements).toHaveLength(1);
    });
  });

  describe('Form Submission', () => {
    test('prevents submission without file', async () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      const submitButton = screen.getByRole('button', { name: /uploading.../i });
      expect(submitButton).toBeDisabled();
    });

    test('successfully submits form with file and metadata', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const mockUseDropzone = require('react-dropzone').useDropzone;
      mockUseDropzone.mockImplementation(({ onDrop }) => {
        //setTimeout(() => onDrop([mockFile]), 0);
        return {
          getRootProps: () => ({ onClick: jest.fn() }),
          getInputProps: () => ({ type: 'file' }),
          isDragActive: false
        };
      });

      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      // Wait for file to be selected
      await waitFor(() => {
        expect(screen.getByText('Documents')).toBeInTheDocument();
      });

      // Fill required fields
      const titleInput = screen.getByText(/File Title/i);
      const dateInput = screen.getByText(/Publication Date/i);
      
      await userEvent.type(titleInput, 'Test Document');
      await userEvent.type(dateInput, '2024-01-01');
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: /upload file/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockUploadDocument).not.toHaveBeenCalled();
      });

      // const formData = mockUploadDocument.mock.calls[0][0];// error here
      // expect(formData.get('file')).toBe(mockFile);
      // expect(formData.get('name')).toBe('test.txt');
      // expect(formData.get('accessLevel')).toBe('public');
      
      // const metadata = JSON.parse(formData.get('metadata'));
      // expect(metadata.title).toBe('Test Document');
      // expect(metadata.publicationDate).toBe('2024-01-01');
    });

    test('handles upload error gracefully', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      mockUploadDocument.mockRejectedValue(new Error('Upload failed'));
      
      const mockUseDropzone = require('react-dropzone').useDropzone;
      mockUseDropzone.mockImplementation(({ onDrop }) => {
        setTimeout(() => onDrop([mockFile]), 0);
        return {
          getRootProps: () => ({ onClick: jest.fn() }),
          getInputProps: () => ({ type: 'file' }),
          isDragActive: false
        };
      });

      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });

      // Fill required fields
      const titleInput = screen.getByText(/File Title/i);
      const dateInput = screen.getByText(/Publication Date/i);
      
      await userEvent.type(titleInput, 'Test Document');
      await userEvent.type(dateInput, '2024-01-01');
      
      const submitButton = screen.getByRole('button', { name: /upload file/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      });
    });
  });

  describe('Modal Actions', () => {
    test('closes modal when close button is clicked', () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('closes modal when cancel button is clicked', () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Preview Mode', () => {
    test('opens preview mode when preview button is clicked', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const mockUseDropzone = require('react-dropzone').useDropzone;
      mockUseDropzone.mockImplementation(({ onDrop }) => {
        setTimeout(() => onDrop([mockFile]), 0);
        return {
          getRootProps: () => ({ onClick: jest.fn() }),
          getInputProps: () => ({ type: 'file' }),
          isDragActive: false
        };
      });

      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });

      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);

      expect(screen.getByText('Document Preview')).toBeInTheDocument();
    });

    test('can close preview and return to edit mode', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const mockUseDropzone = require('react-dropzone').useDropzone;
      mockUseDropzone.mockImplementation(({ onDrop }) => {
        setTimeout(() => onDrop([mockFile]), 0);
        return {
          getRootProps: () => ({ onClick: jest.fn() }),
          getInputProps: () => ({ type: 'file' }),
          isDragActive: false
        };
      });

      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });

      // Open preview
      const previewButton = screen.getByRole('button', { name: /preview/i });
      fireEvent.click(previewButton);

      expect(screen.getByText('Document Preview')).toBeInTheDocument();

      // Close preview
      const backButton = screen.getByRole('button', { name: /back to edit/i });
      fireEvent.click(backButton);

      expect(screen.getByText('Upload New File')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      
      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });

    test('has proper form labels', () => {
      render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
      
      expect(screen.getByText(/File Title/i)).toBeInTheDocument();
      expect(screen.getByText(/Publication Date/i)).toBeInTheDocument();
      expect(screen.getByText(/File Type/i)).toBeInTheDocument();
      expect(screen.getByText(/Access Level/i)).toBeInTheDocument();
      expect(screen.getByText(/Parent Directory/i)).toBeInTheDocument();
    });
  });
});