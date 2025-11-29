import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
  });

  it('renders Header component', () => {
    render(<App />);
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
    const aboutLinks = screen.getAllByText('About');
    expect(aboutLinks.length).toBeGreaterThan(0);
    const loginLinks = screen.getAllByText('Login/Register');
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it('renders Footer component', () => {
    render(<App />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('displays Home page by default', () => {
    render(<App />);
    expect(screen.getByText('Welcome to Our Website')).toBeInTheDocument();
  });

  it('navigates to About page when About link is clicked', () => {
    render(<App />);
    
    const aboutLink = screen.getAllByText(/about/i)[0];
    fireEvent.click(aboutLink);
    
    expect(screen.getByText('About Us')).toBeInTheDocument();
  });

  it('navigates to Login/Register page when link is clicked', () => {
    render(<App />);
    
    const loginLink = screen.getAllByText(/login\/register/i)[0];
    fireEvent.click(loginLink);
    
    expect(screen.getByText('LoginRegister')).toBeInTheDocument();
  });

  it('navigates back to Home when Home link is clicked', () => {
    render(<App />);
    
    // Navigate away from home first
    const aboutLink = screen.getAllByText(/about/i)[0];
    fireEvent.click(aboutLink);
    
    // Then navigate back to home
    const homeLink = screen.getAllByText(/home/i)[0];
    fireEvent.click(homeLink);
    
    expect(screen.getByText('Welcome to Our Website')).toBeInTheDocument();
  });

  it('renders Left sidebar with navigation links', () => {
    render(<App />);
    // Left sidebar should have the same links as header
    // Since both Header and Left have the same links, we should find at least 2 of each (one in header, one in sidebar)
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThanOrEqual(2);
  });

  it('has correct container structure', () => {
    const { container } = render(<App />);
    expect(container.querySelector('.container')).toBeInTheDocument();
    expect(container.querySelector('.left-column')).toBeInTheDocument();
    expect(container.querySelector('.body-content')).toBeInTheDocument();
  });
});