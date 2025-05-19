import { render, screen, fireEvent } from '@testing-library/react';
import Uploader from './Uploader';


// Mock the child component and icons
jest.mock('./UploadModal', () => ({ onClose, onUploadSuccess }) => (
  <div data-testid="upload-modal">
    <button onClick={onClose}>Close Modal</button>
    <button onClick={() => onUploadSuccess('test-result')}>Mock Upload</button>
  </div>
));

jest.mock('lucide-react', () => ({
  Plus: () => <div>PlusIcon</div>,
  Upload: () => <div>UploadIcon</div>,
}));

describe('Uploader Component', () => {
  const mockUploadSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the upload button correctly', () => {
    render(<Uploader />);
    
    const button = screen.getByRole('button', { name: /upload document/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600');
    expect(screen.getByText('UploadIcon')).toBeInTheDocument();
  });

  it('opens the modal when the upload button is clicked', () => {
    render(<Uploader />);
    
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(button);
    
    expect(screen.getByTestId('upload-modal')).toBeInTheDocument();
  });

  it('closes the modal when onClose is called', () => {
    render(<Uploader />);
    
    // Open modal
    const button = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(button);
    
    // Close modal
    const closeButton = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeButton);
    
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument();
  });

  it('calls onUploadSuccess and closes modal when upload is successful', () => {
    render(<Uploader onUploadSuccess={mockUploadSuccess} />);
    
    // Open modal
    const uploadButton = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(uploadButton);
    
    // Trigger upload success
    const mockUploadButton = screen.getByRole('button', { name: /mock upload/i });
    fireEvent.click(mockUploadButton);
    
    expect(mockUploadSuccess).toHaveBeenCalledWith('test-result');
    expect(screen.queryByTestId('upload-modal')).not.toBeInTheDocument();
  });

  it('does not throw error when onUploadSuccess is not provided', () => {
    render(<Uploader />);
    
    // Open modal
    const uploadButton = screen.getByRole('button', { name: /upload document/i });
    fireEvent.click(uploadButton);
    
    // Trigger upload success
    const mockUploadButton = screen.getByRole('button', { name: /mock upload/i });
    expect(() => {
      fireEvent.click(mockUploadButton);
    }).not.toThrow();
  });
});