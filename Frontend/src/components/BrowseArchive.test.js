import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowseArchive from './BrowseArchive';

// Mock the FileExplorer component since it's not provided
jest.mock('./FileExplorer', () => {
  return function MockFileExplorer() {
    return <div data-testid="file-explorer">File Explorer Component</div>;
  };
});

describe('BrowseArchive Component', () => {
  beforeEach(() => {
    render(<BrowseArchive />);
  });

  describe('Rendering', () => {
    test('renders the main container with correct classes', () => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('min-h-screen', 'bg-gray-100', 'p-6');
    });

    test('renders the header section', () => {
      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass(
        'bg-gradient-to-r',
        'from-blue-600',
        'to-blue-800',
        'text-white',
        'p-6',
        'rounded-lg',
        'shadow-md'
      );
    });

    test('renders the main heading', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Browse Archive');
      expect(heading).toHaveClass('text-3xl', 'font-bold');
    });

    test('renders the description paragraph', () => {
      const description = screen.getByText('Explore documents and folders in the archive.');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'mt-2');
    });

    test('renders the content section', () => {
      const section = screen.getByRole('main').querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('mt-6');
    });

    test('renders the FileExplorer component', () => {
      const fileExplorer = screen.getByTestId('file-explorer');
      expect(fileExplorer).toBeInTheDocument();
    });
  });

  describe('Structure and Layout', () => {
    test('has correct document structure hierarchy', () => {
      const main = screen.getByRole('main');
      const header = screen.getByRole('banner');
      const section = main.querySelector('section');
      
      expect(main).toContainElement(header);
      expect(main).toContainElement(section);
    });

    test('header contains both title and description', () => {
      const header = screen.getByRole('banner');
      const title = screen.getByRole('heading', { level: 1 });
      const description = screen.getByText('Explore documents and folders in the archive.');
      
      expect(header).toContainElement(title);
      expect(header).toContainElement(description);
    });

    test('section contains FileExplorer component', () => {
      const main = screen.getByRole('main');
      const section = main.querySelector('section');
      const fileExplorer = screen.getByTestId('file-explorer');
      
      expect(section).toContainElement(fileExplorer);
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic HTML structure', () => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      // section element doesn't automatically have region role unless aria-label is provided
      const section = screen.getByRole('main').querySelector('section');
      expect(section).toBeInTheDocument();
    });

    test('heading is properly structured', () => {
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(1);
      expect(headings[0].tagName).toBe('H1');
    });
  });

  describe('CSS Classes', () => {
    test('applies correct Tailwind classes to main element', () => {
      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen');
      expect(main).toHaveClass('bg-gray-100');
      expect(main).toHaveClass('p-6');
    });

    test('applies correct gradient classes to header', () => {
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('bg-gradient-to-r');
      expect(header).toHaveClass('from-blue-600');
      expect(header).toHaveClass('to-blue-800');
    });

    test('applies correct typography classes to heading', () => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('font-bold');
    });

    test('applies correct spacing classes to description', () => {
      const description = screen.getByText('Explore documents and folders in the archive.');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('mt-2');
    });
  });
});

describe('BrowseArchive Component Integration', () => {
  test('renders without crashing', () => {
    expect(() => render(<BrowseArchive />)).not.toThrow();
  });

  test('maintains consistent styling theme', () => {
    render(<BrowseArchive />);
    
    const main = screen.getByRole('main');
    const header = screen.getByRole('banner');
    
    // Check that the color scheme is consistent
    expect(main).toHaveClass('bg-gray-100'); // Light background
    expect(header).toHaveClass('from-blue-600', 'to-blue-800'); // Blue gradient
  });

  test('has proper content hierarchy', () => {
    render(<BrowseArchive />);
    
    const title = screen.getByText('Browse Archive');
    const description = screen.getByText('Explore documents and folders in the archive.');
    const fileExplorer = screen.getByTestId('file-explorer');
    
    // Verify all key content elements are present
    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(fileExplorer).toBeInTheDocument();
  });
});

// Snapshot test for visual regression detection
describe('BrowseArchive Snapshot', () => {
  test('matches snapshot', () => {
    const { container } = render(<BrowseArchive />);
    expect(container.firstChild).toMatchSnapshot();
  });
});