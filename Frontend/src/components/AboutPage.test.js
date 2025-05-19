import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from './AboutPage';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// Mock the Header and Footer components to avoid rendering them in tests
jest.mock('../components/Header', () => ({
  Header: jest.fn(() => <div data-testid="mock-header">Header</div>)
}));

jest.mock('../components/Footer', () => ({
  Footer: jest.fn(() => <div data-testid="mock-footer">Footer</div>)
}));

// Wrapper component with BrowserRouter for testing
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('AboutPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByText('About the Constitutional Archive')).toBeInTheDocument();
  });

  test('renders header and footer components', () => {
    renderWithRouter(<AboutPage />);
    expect(Header).toHaveBeenCalled();
    expect(Footer).toHaveBeenCalled();
    // expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    // expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });

  test('displays mission section with correct content', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByText('Our Mission')).toBeInTheDocument();
    expect(screen.getByText('We\'re building a living repository of constitutional history, combining archival best practices with cutting-edge technology. Our platform enables:')).toBeInTheDocument();
    
    // Check for mission list items
    expect(screen.getByText('Secure cloud preservation of historical documents')).toBeInTheDocument();
    expect(screen.getByText('AI-powered discovery of legal precedents')).toBeInTheDocument();
    expect(screen.getByText('Open API access for academic research')).toBeInTheDocument();
  });

  test('displays all feature cards', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByText('Key Features')).toBeInTheDocument();
    
    // Check for all feature cards
    expect(screen.getByText('Digital Archiving')).toBeInTheDocument();
    expect(screen.getByText('Secure Management')).toBeInTheDocument();
    expect(screen.getByText('Global Access')).toBeInTheDocument();
    expect(screen.getByText('Modern Stack')).toBeInTheDocument();
    
    // Check for feature descriptions
    expect(screen.getByText('Preserving constitutional documents with metadata-rich hierarchical organization using Access to Memory standards.')).toBeInTheDocument();
    expect(screen.getByText('Role-based access control and Azure AD authentication for authorized archivists.')).toBeInTheDocument();
  });

  test('displays technical architecture section', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByText('Updated Technical Architecture')).toBeInTheDocument();
    
    // Check for framework logos
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
   // expect(screen.findAllByAltText('MongoDB')).toBeInTheDocument();
    expect(screen.getByText('Azure')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    
    // Check for architecture sections
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Operations')).toBeInTheDocument();
  });

  test('displays governance section with button', () => {
    renderWithRouter(<AboutPage />);
    expect(screen.getByText('Open Governance')).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: 'Get Involved' });
    expect(button).toBeInTheDocument();
  });

  test('framework logo changes on hover', async () => {
    renderWithRouter(<AboutPage />);
    
    // Find React framework logo container
    const reactLogo = screen.getByText('React').closest('div');
    
    // Simulate hover
    fireEvent.mouseEnter(reactLogo);
    
    // Check for hover class
    await waitFor(() => {
      expect(reactLogo).toHaveClass('scale-110');
    });
    
    // Simulate mouse leave
    fireEvent.mouseLeave(reactLogo);
    
    // Check for non-hover class
    await waitFor(() => {
      expect(reactLogo).toHaveClass('scale-100');
    });
  });

  test('feature card changes on hover', async () => {
    renderWithRouter(<AboutPage />);
    
    // Find Digital Archiving feature card
    const featureCard = screen.getByText('Digital Archiving').closest('div');
    
    // Simulate hover
    fireEvent.mouseEnter(featureCard);
    
    // Check for hover classes
    await waitFor(() => {
      expect(featureCard).toHaveClass('bg-blue-50');
      expect(featureCard).toHaveClass('shadow-xl');
    });
    
    // Simulate mouse leave
    fireEvent.mouseLeave(featureCard);
    
    // Check for non-hover classes
    await waitFor(() => {
      expect(featureCard).toHaveClass('bg-white');
      expect(featureCard).toHaveClass('shadow-md');
    });
  });

  test('applies animations when component mounts', async () => {
    renderWithRouter(<AboutPage />);

    // Check for visible class on main container after mount
    await waitFor(() => {
      const mainContainer = screen.getByText('About the Constitutional Archive').closest('div');
      expect(mainContainer).toHaveClass(' text-center mb-16');

    });
  });
});