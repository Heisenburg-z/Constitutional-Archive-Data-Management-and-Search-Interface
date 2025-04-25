import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from './ConfirmDialog'; // Update the import path

describe('ConfirmDialog', () => {
  let mockOnClose;
  let mockOnConfirm;

  beforeEach(() => {
    mockOnClose = jest.fn();
    mockOnConfirm = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmDialog isOpen={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
  });

  it('renders dialog when isOpen is true', () => {
    render(<ConfirmDialog isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to perform this action?')).toBeInTheDocument();
  });

  it('displays default content when no props are provided', () => {
    render(<ConfirmDialog isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to perform this action?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('displays custom content when props are provided', () => {
    const customProps = {
      title: 'Delete Item',
      message: 'This action cannot be undone!',
      confirmText: 'Delete',
      cancelText: 'Go Back',
    };

    render(
      <ConfirmDialog
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        {...customProps}
      />
    );

    expect(screen.getByText(customProps.title)).toBeInTheDocument();
    expect(screen.getByText(customProps.message)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: customProps.confirmText })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: customProps.cancelText })).toBeInTheDocument();
  });

  it('triggers onClose when cancel button is clicked', () => {
    render(<ConfirmDialog isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('triggers onConfirm when confirm button is clicked', () => {
    render(<ConfirmDialog isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isProcessing is true', () => {
    render(<ConfirmDialog isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} isProcessing={true} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    const confirmButton = screen.getByRole('button', { name: /Processing.../i });

    expect(cancelButton).toBeDisabled();
    expect(confirmButton).toBeDisabled();
  });

  it('displays processing state in confirm button', () => {
    const { container } = render(
      <ConfirmDialog isOpen={true} onClose={mockOnClose} onConfirm={mockOnConfirm} isProcessing={true} />
    );

    const confirmButton = screen.getByRole('button', { name: /Processing.../i });
    expect(confirmButton).toHaveTextContent('Processing...');
    
    const spinner = confirmButton.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });
});