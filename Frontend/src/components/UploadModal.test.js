import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadModal from './UploadModal';
import { toast } from 'react-toastify';
import * as uploadService from '../services/uploadService';

// Mocking external services
jest.mock('../services/uploadService');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('UploadModal', () => {
  const mockOnClose = jest.fn();
  const mockOnUploadSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders UploadModal component', () => {
    render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);

    expect(screen.getByText('Upload New File')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop file here, or click to select')).toBeInTheDocument();
  });

  test('displays error when no file is selected and user attempts to submit', async () => {
    render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);
    
    fireEvent.click(screen.getByText('Upload File'));

    await waitFor(() => {
      expect(screen.getByText('Please select a file to upload')).toBeInTheDocument();
    });
  });

  test('displays a file name after file is selected', async () => {
    render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['file content'], 'testfile.pdf', { type: 'application/pdf' });

    const fileInput = screen.getByLabelText(/drag & drop file here/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(screen.getByText('testfile.pdf')).toBeInTheDocument();
  });

  test('calls onUploadSuccess when file is uploaded successfully', async () => {
    render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['file content'], 'testfile.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/drag & drop file here/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    uploadService.uploadDocument.mockResolvedValue({ message: 'Upload successful' });

    fireEvent.click(screen.getByText('Upload File'));

    await waitFor(() => {
      expect(mockOnUploadSuccess).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('🎉 Document uploaded successfully!');
    });
  });

  test('shows error message when upload fails', async () => {
    render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['file content'], 'testfile.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/drag & drop file here/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    uploadService.uploadDocument.mockRejectedValue(new Error('Upload failed'));

    fireEvent.click(screen.getByText('Upload File'));

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
      expect(toast.error).toHaveBeenCalledWith('Upload failed');
    });
  });

  test('preview button works', async () => {
    render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['file content'], 'testfile.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/drag & drop file here/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    fireEvent.click(screen.getByText('Preview'));

    await waitFor(() => {
      expect(screen.getByText('Document Preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Back to Edit'));

    await waitFor(() => {
      expect(screen.getByText('Upload New File')).toBeInTheDocument();
    });
  });

  test('removes selected file when Remove button is clicked', async () => {
    render(<UploadModal onClose={mockOnClose} onUploadSuccess={mockOnUploadSuccess} />);

    const file = new File(['file content'], 'testfile.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/drag & drop file here/i);
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    fireEvent.click(screen.getByText('Remove'));

    await waitFor(() => {
      expect(screen.queryByText('testfile.pdf')).not.toBeInTheDocument();
    });
  });
});
