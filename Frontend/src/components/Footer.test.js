import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from '../components/Footer';

describe('Footer Component', () => {
  test('renders the footer with logo and title', () => {
    render(<Footer />);
    
    // Check if the title is rendered
    expect(screen.getByText('Constitutional Archive')).toBeInTheDocument();
    
    // Check if the copyright text is present and includes current year
    const currentYear = new Date().getFullYear().toString();
    const copyrightText = screen.getByText((content) => {
      return content.includes(`© ${currentYear} Constitutional Archive`);
    });
    expect(copyrightText).toBeInTheDocument();
  });

  test('renders all navigation sections', () => {
    render(<Footer />);
    
    // Check for section headings
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    
    // Check for specific links in each section
    
    // Quick Links section
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Browse Archive')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    
    // Resources section
    expect(screen.getByText('API Documentation')).toBeInTheDocument();
    expect(screen.getByText('Usage Guidelines')).toBeInTheDocument();
    //expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    //expect(screen.getAllByText('Terms of Service')).toBeInTheDocument();
  });

  test('renders contact information', () => {
    render(<Footer />);
    
    // Check if contact info is displayed
    expect(screen.getByText('Email: info@constitutionalarchive.org')).toBeInTheDocument();
    expect(screen.getByText('Phone: +2 (77) 123-4567')).toBeInTheDocument();
  });

  test('renders social media links', () => {
    render(<Footer />);
    
    // Check if social media links are present
    const twitterLink = screen.getByText('Twitter').closest('a');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/constitutional-archive');
    
    const githubLink = screen.getByText('GitHub').closest('a');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/constitutional-archive');
    
    const linkedinLink = screen.getByText('LinkedIn').closest('a');
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/company/constitutional-archive');
  });

  test('renders bottom links', () => {
    render(<Footer />);
  
    // Privacy Policy links
    const privacyLinks = screen.getAllByText('Privacy Policy', { selector: 'a' });
    expect(privacyLinks.some(link => link.getAttribute('href') === '/privacy')).toBe(true);
    expect(privacyLinks.some(link => link.getAttribute('href') === '/privacy-policy')).toBe(true);
  
    // Terms of Service links
    const termsLinks = screen.getAllByText('Terms of Service', { selector: 'a' });
    expect(termsLinks.every(link => link.getAttribute('href') === '/terms')).toBe(true);
  
    // Accessibility
    const accessibilityLink = screen.getByText('Accessibility', { selector: 'a' });
    expect(accessibilityLink).toHaveAttribute('href', '/accessibility');
  });
  
});