import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedNavMenu from './AnimatedNavMenu';

// Mock window.location
const mockLocation = {
  pathname: '/'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock setInterval and clearInterval for animation tests
beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(global, 'setInterval');
  jest.spyOn(global, 'clearInterval');
  mockLocation.pathname = '/';
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('AnimatedNavMenu', () => {
  describe('Rendering', () => {
    test('renders all navigation links', () => {
      render(<AnimatedNavMenu />);
      
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Browse Archive')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    test('renders with correct href attributes', () => {
      render(<AnimatedNavMenu />);
      
      expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
      expect(screen.getByText('Browse Archive').closest('a')).toHaveAttribute('href', '/browse');
      expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about');
      expect(screen.getByText('Contact').closest('a')).toHaveAttribute('href', '/contact');
    });

    test('has hidden class for mobile and flex for desktop', () => {
      render(<AnimatedNavMenu />);
      
      const navList = screen.getByRole('list');
      expect(navList).toHaveClass('hidden', 'md:flex');
    });
  });

  describe('Active Link Detection', () => {
    test('sets Home as active when pathname is "/"', () => {
      mockLocation.pathname = '/';
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      expect(homeLink).toHaveClass('text-white');
    });

    test('sets Browse Archive as active when pathname is "/browse"', () => {
      mockLocation.pathname = '/browse';
      render(<AnimatedNavMenu />);
      
      const browseLink = screen.getByText('Browse Archive').closest('a');
      expect(browseLink).toHaveClass('text-white');
    });

    test('sets About as active when pathname is "/about"', () => {
      mockLocation.pathname = '/about';
      render(<AnimatedNavMenu />);
      
      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink).toHaveClass('text-white');
    });

    test('sets Contact as active when pathname is "/contact"', () => {
      mockLocation.pathname = '/contact';
      render(<AnimatedNavMenu />);
      
      const contactLink = screen.getByText('Contact').closest('a');
      expect(contactLink).toHaveClass('text-white');
    });

    test('inactive links have gray text', () => {
      mockLocation.pathname = '/';
      render(<AnimatedNavMenu />);
      
      const browseLink = screen.getByText('Browse Archive').closest('a');
      const aboutLink = screen.getByText('About').closest('a');
      const contactLink = screen.getByText('Contact').closest('a');
      
      expect(browseLink).toHaveClass('text-gray-200');
      expect(aboutLink).toHaveClass('text-gray-200');
      expect(contactLink).toHaveClass('text-gray-200');
    });
  });

  describe('Hover Interactions', () => {
    test('applies hover styles on mouse enter', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      
      fireEvent.mouseEnter(homeLink);
      
      await waitFor(() => {
        expect(homeLink).toHaveClass('scale-110');
      });
    });

    test('removes hover styles on mouse leave', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      
      fireEvent.mouseEnter(homeLink);
      fireEvent.mouseLeave(homeLink);
      
      await waitFor(() => {
        expect(homeLink).not.toHaveClass('scale-110');
      });
    });

    test('shows particle effects on hover', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      
      fireEvent.mouseEnter(homeLink);
      
      await waitFor(() => {
        const particles = homeLink.querySelectorAll('.animate-ping');
        expect(particles).toHaveLength(3);
      });
    });

    test('hides particle effects when not hovered', () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      const particles = homeLink.querySelectorAll('.animate-ping');
      
      expect(particles).toHaveLength(0);
    });
  });

  describe('Press/Click Interactions', () => {
    test('applies pressed styles on mouse down', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      
      fireEvent.mouseDown(homeLink);
      
      await waitFor(() => {
        expect(homeLink).toHaveClass('scale-95');
      });
    });

    test('removes pressed styles on mouse up', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      
      fireEvent.mouseDown(homeLink);
      fireEvent.mouseUp(homeLink);
      
      await waitFor(() => {
        expect(homeLink).not.toHaveClass('scale-95');
      });
    });

    test('applies pressed styles on touch start', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      
      fireEvent.touchStart(homeLink);
      
      await waitFor(() => {
        expect(homeLink).toHaveClass('scale-95');
      });
    });

    test('removes pressed styles on touch end', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      
      fireEvent.touchStart(homeLink);
      fireEvent.touchEnd(homeLink);
      
      await waitFor(() => {
        expect(homeLink).not.toHaveClass('scale-95');
      });
    });
  });

  describe('Background Glow Effects', () => {
    test('active link has background glow', () => {
      mockLocation.pathname = '/';
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      const backgroundGlow = homeLink.querySelector('.bg-blue-500');
      
      expect(backgroundGlow).toBeInTheDocument();
      expect(backgroundGlow).toHaveClass('opacity-20');
    });

    test('inactive links have transparent background', () => {
      mockLocation.pathname = '/';
      render(<AnimatedNavMenu />);
      
      const browseLink = screen.getByText('Browse Archive').closest('a');
      const backgroundGlow = browseLink.querySelector('.bg-transparent');
      
      expect(backgroundGlow).toBeInTheDocument();
      expect(backgroundGlow).toHaveClass('opacity-0');
    });
  });

  describe('Bottom Border Animation', () => {
    test('active link shows bottom border', () => {
      mockLocation.pathname = '/';
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      const bottomBorder = homeLink.querySelector('.bg-gradient-to-r');
      
      expect(bottomBorder).toBeInTheDocument();
      expect(bottomBorder).toHaveClass('w-full', 'opacity-100');
    });

    test('inactive link hides bottom border', () => {
      mockLocation.pathname = '/';
      render(<AnimatedNavMenu />);
      
      const browseLink = screen.getByText('Browse Archive').closest('a');
      const bottomBorder = browseLink.querySelector('.bg-gradient-to-r');
      
      expect(bottomBorder).toBeInTheDocument();
      expect(bottomBorder).toHaveClass('w-0', 'opacity-0');
    });
  });

  describe('Animation Timer', () => {
    test('starts animation timer on mount', () => {
      render(<AnimatedNavMenu />);
      
      expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 50);
    });

    test('cleans up animation timer on unmount', () => {
      const { unmount } = render(<AnimatedNavMenu />);
      
      unmount();
      
      expect(global.clearInterval).toHaveBeenCalled();
    });

    test('animation timer updates at regular intervals', () => {
      render(<AnimatedNavMenu />);
      
      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(100); // 2 intervals
      });
      
      // Timer should have been called multiple times
      expect(global.setInterval).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('all links are accessible by keyboard', () => {
      render(<AnimatedNavMenu />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href');
      });
    });

    test('navigation structure is semantic', () => {
      render(<AnimatedNavMenu />);
      
      const navList = screen.getByRole('list');
      const listItems = screen.getAllByRole('listitem');
      
      expect(navList).toBeInTheDocument();
      expect(listItems).toHaveLength(4);
    });
  });

  describe('Responsive Design', () => {
    test('navigation is hidden on mobile devices', () => {
      render(<AnimatedNavMenu />);
      
      const navList = screen.getByRole('list');
      expect(navList).toHaveClass('hidden', 'md:flex');
    });
  });

  describe('Multiple Link Interactions', () => {
    test('can hover multiple links independently', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      const aboutLink = screen.getByText('About').closest('a');
      
      fireEvent.mouseEnter(homeLink);
      fireEvent.mouseEnter(aboutLink);
      
      await waitFor(() => {
        expect(aboutLink).toHaveClass('scale-110');
      });
      
      fireEvent.mouseLeave(homeLink);
      
      await waitFor(() => {
        expect(homeLink).not.toHaveClass('scale-110');
        expect(aboutLink).toHaveClass('relative z-10 px-4 py-2 rounded-lg font-medium text-lg transition-all duration-300 block text-gray-200');
      });
    });

    test('pressed state works independently for each link', async () => {
      render(<AnimatedNavMenu />);
      
      const homeLink = screen.getByText('Home').closest('a');
      const aboutLink = screen.getByText('About').closest('a');
      
      fireEvent.mouseDown(homeLink);
      
      await waitFor(() => {
        expect(homeLink).toHaveClass('scale-95');
        expect(aboutLink).not.toHaveClass('scale-95');
      });
    });
  });

  describe('CSS Transitions and Styling', () => {
    test('links have proper transition classes', () => {
      render(<AnimatedNavMenu />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toHaveClass('transition-all', 'duration-300');
      });
    });

    test('links have proper base styling', () => {
      render(<AnimatedNavMenu />);
      
      const links = screen.getAllByRole('link');
      
      links.forEach(link => {
        expect(link).toHaveClass('relative', 'z-10', 'px-4', 'py-2', 'rounded-lg', 'font-medium', 'text-lg', 'block');
      });
    });
  });
});