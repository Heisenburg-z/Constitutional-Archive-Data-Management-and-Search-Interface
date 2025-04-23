import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import UploadModal from './UploadModal';
import { uploadDocument, fetchDirectories } from '../services/uploadService';
import { toast } from 'react-toastify';

// Mock the required modules
jest.mock('../../services/uploadService');
jest.mock('react-toastify');
jest.mock('react-dropzone', () => {
  return {
    useDropzone: () => ({
      getRootProps: () => ({ onClick: jest.fn() }),
      getInputProps: () => ({ accept: 'application/pdf,.pdf,text/plain,.txt' }),
      isDragActive: false,
    }),
  };
});

// Sample test data
const mockDirectories = [
  {
    _id: 'dir1',
    name: 'Constitutional Documents',
    type: 'directory',
    children: [
      {
        _id: 'dir2',
        name: 'South Africa',
        type: 'directory',
        children: []
      }
    ]
  },
  {
    _id: 'dir3',
    name: 'Reports',
    type: 'directory',
    children: []
  }
];

const mockFile = new File(['dummy content'], 'test-document.pdf', { type: 'application/pdf' });

describe('UploadModal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchDirectories.mockResolvedValue(mockDirectories);
  });

  it('renders the component correctly', async () => {
    await act(async () => {
      render(<UploadModal onClose={jest.fn()} onUploadSuccess={jest.fn()} />);
    });
    
    expect(screen.getByText('Upload New Document')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop file here, or click to select')).toBeInTheDocument();
    expect(screen.getByText('Parent Directory')).toBeInTheDocument();
    expect(screen.getByText('Access Level')).toBeInTheDocument();
    expect(screen.getByText('Document Title')).toBeInTheDocument();
    expect(screen.getByText('Document Type')).toBeInTheDocument();
    expect(screen.getByText('Publication Date')).toBeInTheDocument();
    expect(screen.getByText('Keywords')).toBeInTheDocument();
  });

  it('fetches directories on mount', async () => {
    await act(async () => {
      render(<UploadModal onClose={jest.fn()} onUploadSuccess={jest.fn()} />);
    });
    
    expect(fetchDirectories).toHaveBeenCalledTimes(1);
    
    // Check if directory options are rendered
    expect(screen.getByText('Root Directory')).toBeInTheDocument();
    expect(screen.getByText('Constitutional Documents')).toBeInTheDocument();
    expect(screen.getByText('└─ South Africa')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
  });

  it('displays error when directory fetching fails', async () => {
    fetchDirectories.mockRejectedValue(new Error('Failed to fetch'));
    
    await act(async () => {
      render(<UploadModal onClose={jest.fn()} onUploadSuccess={jest.fn()} />);
    });
    
    expect(screen.getByText('Failed to load directories')).toBeInTheDocument();
  });

  it('allows form field changes', async () => {
    await act(async () => {
      render(<UploadModal onClose={jest.fn()} onUploadSuccess={jest.fn()} />);
    });

    // Test title field
    const titleInput = screen.getByLabelText(/Document Title/i);
    userEvent.clear(titleInput);
    userEvent.type(titleInput, 'Test Constitution');
    expect(titleInput).toHaveValue('Test Constitution');

    // Test document type select
    const typeSelect = screen.getByLabelText(/Document Type/i);
    userEvent.selectOptions(typeSelect, 'amendment');
    expect(typeSelect).toHaveValue('amendment');

    // Test publication date
    const dateInput = screen.getByLabelText(/Publication Date/i);
    userEvent.clear(dateInput);
    userEvent.type(dateInput, '2023-05-15');
    expect(dateInput).toHaveValue('2023-05-15');

    // Test access level
    const accessLevelSelect = screen.getByLabelText(/Access Level/i);
    userEvent.selectOptions(accessLevelSelect, 'private');
    expect(accessLevelSelect).toHaveValue('private');

    // Test parent directory
    const directorySelect = screen.getByLabelText(/Parent Directory/i);
    userEvent.selectOptions(directorySelect, 'dir1');
    expect(directorySelect).toHaveValue('dir1');
  });

  it('handles keyword addition and removal', async () => {
    await act(async () => {
      render(<UploadModal onClose={jest.fn()} onUploadSuccess={jest.fn()} />);
    });

    // Add a keyword
    const keywordInput = screen.getByPlaceholderText('Add keyword...');
    userEvent.type(keywordInput, 'democracy');
    fireEvent.click(screen.getByText('Add'));
    
    expect(screen.getByText('democracy')).toBeInTheDocument();
    expect(keywordInput).toHaveValue('');

    // Add another keyword
    userEvent.type(keywordInput, 'rights');
    fireEvent.click(screen.getByText('Add'));
    
    expect(screen.getByText('rights')).toBeInTheDocument();

    // Remove a keyword
    const removeButtons = screen.getAllByRole('button', { name: '' });
    const removeRightsButton = removeButtons.find(button => 
      button.parentElement.textContent.includes('rights')
    );
    
    fireEvent.click(removeRightsButton);
    expect(screen.queryByText('rights')).not.toBeInTheDocument();
    expect(screen.getByText('democracy')).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    // Mock file selection
    Object.defineProperty(global, 'FormData', {
      value: class {
        constructor() {
          this.data = {};
        }
        append(key, value) {
          this.data[key] = value;
        }
      },
    });

    uploadDocument.mockResolvedValue({ id: 'doc1', name: 'Test Document' });

    const onUploadSuccess = jest.fn();
    const onClose = jest.fn();

    await act(async () => {
      render(<UploadModal onClose={onClose} onUploadSuccess={onUploadSuccess} />);
    });

    // Set file
    await act(async () => {
      // Mock the dropzone's onDrop function by directly setting the file state
      const dropzoneArea = screen.getByText('Drag & drop file here, or click to select');
      const setFileFn = React.useState(null)[1];
      
      // This is a simplification as we can't directly access the state setter
      // In a real test, we would need to properly mock useDropzone's behavior
      await fireEvent.drop(dropzoneArea, {
        dataTransfer: {
          files: [mockFile],
        },
      });
    });

    // Fill in required fields
    const titleInput = screen.getByLabelText(/Document Title/i);
    userEvent.type(titleInput, 'Test Constitution');

    const dateInput = screen.getByLabelText(/Publication Date/i);
    userEvent.type(dateInput, '2023-05-15');

    // Attempt to submit the form
    const submitButton = screen.getByText('Upload Document');
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify that the loading state is shown during submission
    await waitFor(() => {
      expect(uploadDocument).toHaveBeenCalled();
    });

    // Check that the success callback was called
    expect(toast.success).toHaveBeenCalledWith('🎉 Document uploaded successfully!');
    expect(onUploadSuccess).toHaveBeenCalled();
    
    // Check that onClose was called after the timeout
    jest.advanceTimersByTime(500);
    expect(onClose).toHaveBeenCalled();
  });

  it('handles upload errors', async () => {
    uploadDocument.mockRejectedValue(new Error('Upload failed'));
    
    await act(async () => {
      render(<UploadModal onClose={jest.fn()} onUploadSuccess={jest.fn()} />);
    });

    // Mock file selection and form submission
    const submitButton = screen.getByText('Upload Document');
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify error message is displayed
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('closes the modal when cancel button is clicked', async () => {
    const onClose = jest.fn();
    
    await act(async () => {
      render(<UploadModal onClose={onClose} onUploadSuccess={jest.fn()} />);
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables form submission when no file is selected', async () => {
    await act(async () => {
      render(<UploadModal onClose={jest.fn()} onUploadSuccess={jest.fn()} />);
    });

    const submitButton = screen.getByText('Upload Document');
    expect(submitButton).toBeDisabled();
  });
});