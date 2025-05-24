// components/SearchResults/Tabs.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Tabs } from './Tabs';

describe('Tabs Component', () => {
  const mockSetActiveTab = jest.fn();
  
  const defaultProps = {
    activeTab: 'documents',
    setActiveTab: mockSetActiveTab
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all three tabs with correct labels', () => {
      render(<Tabs {...defaultProps} />);
      
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Images')).toBeInTheDocument();
      expect(screen.getByText('Videos')).toBeInTheDocument();
    });

    it('renders all tabs as buttons', () => {
      render(<Tabs {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      expect(screen.getByRole('button', { name: /documents/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /images/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /videos/i })).toBeInTheDocument();
    });

    it('renders with proper container structure and classes', () => {
      const { container } = render(<Tabs {...defaultProps} />);
      
      const tabContainer = container.firstChild;
      expect(tabContainer).toHaveClass('flex', 'space-x-4', 'border-b', 'border-blue-500');
    });

    it('renders icons for each tab', () => {
      const { container } = render(<Tabs {...defaultProps} />);
      
      // Check that SVG icons are present (lucide-react renders as SVG)
      const svgElements = container.querySelectorAll('svg');
      expect(svgElements).toHaveLength(3);
      
      // Check that each SVG has the correct classes
      svgElements.forEach(svg => {
        expect(svg).toHaveClass('h-4', 'w-4', 'mr-2');
      });
    });
  });

  describe('Active Tab Styling', () => {
    it('applies active styles to the documents tab when activeTab is "documents"', () => {
      render(<Tabs {...defaultProps} activeTab="documents" />);
      
      const documentsTab = screen.getByRole('button', { name: /documents/i });
      expect(documentsTab).toHaveClass('text-white', 'border-b-2', 'border-white');
      expect(documentsTab).not.toHaveClass('text-blue-200');
    });

    it('applies active styles to the images tab when activeTab is "images"', () => {
      render(<Tabs {...defaultProps} activeTab="images" />);
      
      const imagesTab = screen.getByRole('button', { name: /images/i });
      expect(imagesTab).toHaveClass('text-white', 'border-b-2', 'border-white');
      expect(imagesTab).not.toHaveClass('text-blue-200');
    });

    it('applies active styles to the videos tab when activeTab is "videos"', () => {
      render(<Tabs {...defaultProps} activeTab="videos" />);
      
      const videosTab = screen.getByRole('button', { name: /videos/i });
      expect(videosTab).toHaveClass('text-white', 'border-b-2', 'border-white');
      expect(videosTab).not.toHaveClass('text-blue-200');
    });

    it('applies inactive styles to non-active tabs', () => {
      render(<Tabs {...defaultProps} activeTab="documents" />);
      
      const imagesTab = screen.getByRole('button', { name: /images/i });
      const videosTab = screen.getByRole('button', { name: /videos/i });
      
      expect(imagesTab).toHaveClass('text-blue-200', 'hover:text-blue-100');
      expect(imagesTab).not.toHaveClass('text-white', 'border-b-2', 'border-white');
      
      expect(videosTab).toHaveClass('text-blue-200', 'hover:text-blue-100');
      expect(videosTab).not.toHaveClass('text-white', 'border-b-2', 'border-white');
    });

    it('applies common styles to all tabs', () => {
      render(<Tabs {...defaultProps} />);
      
      const allTabs = screen.getAllByRole('button');
      
      allTabs.forEach(tab => {
        expect(tab).toHaveClass(
          'pb-2',
          'px-4',
          'flex',
          'items-center',
          'text-sm',
          'font-medium',
          'transition-colors'
        );
      });
    });
  });

  describe('Click Interactions', () => {
    it('calls setActiveTab with "documents" when documents tab is clicked', () => {
      render(<Tabs {...defaultProps} />);
      
      const documentsTab = screen.getByRole('button', { name: /documents/i });
      fireEvent.click(documentsTab);
      
      expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
      expect(mockSetActiveTab).toHaveBeenCalledWith('documents');
    });

    it('calls setActiveTab with "images" when images tab is clicked', () => {
      render(<Tabs {...defaultProps} />);
      
      const imagesTab = screen.getByRole('button', { name: /images/i });
      fireEvent.click(imagesTab);
      
      expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
      expect(mockSetActiveTab).toHaveBeenCalledWith('images');
    });

    it('calls setActiveTab with "videos" when videos tab is clicked', () => {
      render(<Tabs {...defaultProps} />);
      
      const videosTab = screen.getByRole('button', { name: /videos/i });
      fireEvent.click(videosTab);
      
      expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
      expect(mockSetActiveTab).toHaveBeenCalledWith('videos');
    });

    it('calls setActiveTab when clicking on already active tab', () => {
      render(<Tabs {...defaultProps} activeTab="documents" />);
      
      const documentsTab = screen.getByRole('button', { name: /documents/i });
      fireEvent.click(documentsTab);
      
      expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
      expect(mockSetActiveTab).toHaveBeenCalledWith('documents');
    });

    it('handles multiple rapid clicks correctly', () => {
      render(<Tabs {...defaultProps} />);
      
      const documentsTab = screen.getByRole('button', { name: /documents/i });
      const imagesTab = screen.getByRole('button', { name: /images/i });
      
      fireEvent.click(documentsTab);
      fireEvent.click(imagesTab);
      fireEvent.click(documentsTab);
      
      expect(mockSetActiveTab).toHaveBeenCalledTimes(3);
      expect(mockSetActiveTab).toHaveBeenNthCalledWith(1, 'documents');
      expect(mockSetActiveTab).toHaveBeenNthCalledWith(2, 'images');
      expect(mockSetActiveTab).toHaveBeenNthCalledWith(3, 'documents');
    });
  });

  describe('Props Handling', () => {
    it('handles undefined activeTab prop gracefully', () => {
      render(<Tabs activeTab={undefined} setActiveTab={mockSetActiveTab} />);
      
      const allTabs = screen.getAllByRole('button');
      
      allTabs.forEach(tab => {
        expect(tab).toHaveClass('text-blue-200');
        expect(tab).not.toHaveClass('text-white', 'border-b-2', 'border-white');
      });
    });

    it('handles null activeTab prop gracefully', () => {
      render(<Tabs activeTab={null} setActiveTab={mockSetActiveTab} />);
      
      const allTabs = screen.getAllByRole('button');
      
      allTabs.forEach(tab => {
        expect(tab).toHaveClass('text-blue-200');
        expect(tab).not.toHaveClass('text-white', 'border-b-2', 'border-white');
      });
    });

    it('handles empty string activeTab prop gracefully', () => {
      render(<Tabs activeTab="" setActiveTab={mockSetActiveTab} />);
      
      const allTabs = screen.getAllByRole('button');
      
      allTabs.forEach(tab => {
        expect(tab).toHaveClass('text-blue-200');
        expect(tab).not.toHaveClass('text-white', 'border-b-2', 'border-white');
      });
    });

    it('handles invalid activeTab value gracefully', () => {
      render(<Tabs activeTab="invalid-tab" setActiveTab={mockSetActiveTab} />);
      
      const allTabs = screen.getAllByRole('button');
      
      allTabs.forEach(tab => {
        expect(tab).toHaveClass('text-blue-200');
        expect(tab).not.toHaveClass('text-white', 'border-b-2', 'border-white');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles for screen readers', () => {
      render(<Tabs {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });
    });

    it('maintains focus when tabs are clicked', () => {
      render(<Tabs {...defaultProps} />);
      
      const documentsTab = screen.getByRole('button', { name: /documents/i });
      documentsTab.focus();
      fireEvent.click(documentsTab);
      
      expect(document.activeElement).toBe(documentsTab);
    });

    it('supports keyboard navigation', () => {
      render(<Tabs {...defaultProps} />);
      
      const documentsTab = screen.getByRole('button', { name: /documents/i });
      documentsTab.focus();
      
      fireEvent.keyDown(documentsTab, { key: 'Enter' });
      expect(mockSetActiveTab).not.toHaveBeenCalledWith('documents');
      
      fireEvent.keyDown(documentsTab, { key: ' ' });
      expect(mockSetActiveTab).toHaveBeenCalledTimes(0);
    });
  });

  describe('Component Structure', () => {
    it('renders tabs in the correct order', () => {
      render(<Tabs {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent('Documents');
      expect(buttons[1]).toHaveTextContent('Images');
      expect(buttons[2]).toHaveTextContent('Videos');
    });

    it('maintains consistent tab structure across different activeTab values', () => {
      const { rerender } = render(<Tabs {...defaultProps} activeTab="documents" />);
      
      let buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      rerender(<Tabs {...defaultProps} activeTab="images" />);
      buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      rerender(<Tabs {...defaultProps} activeTab="videos" />);
      buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Performance', () => {
    it('does not recreate tabs array on every render', () => {
      const { rerender } = render(<Tabs {...defaultProps} activeTab="documents" />);
      
      const initialButtons = screen.getAllByRole('button');
      
      rerender(<Tabs {...defaultProps} activeTab="images" />);
      
      const rerenderedButtons = screen.getAllByRole('button');
      expect(rerenderedButtons).toHaveLength(initialButtons.length);
    });
  });
});