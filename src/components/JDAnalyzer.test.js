import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestRouter } from '../test-utils';
import JDAnalyzer from './JDAnalyzer';

describe('JDAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
  });

  it('displays the Job Description Analyzer heading', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    expect(screen.getByText('Job Description Analyzer')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consulting rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consulting period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('renders Clear and Save buttons', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Save & Analyze')).toBeInTheDocument();
  });

  it('updates job title field when user types', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    const jobTitleInput = screen.getByLabelText(/job title/i);
    fireEvent.change(jobTitleInput, { target: { value: 'Software Engineer' } });
    expect(jobTitleInput).toHaveValue('Software Engineer');
  });

  it('updates email field when user types', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    const contactInput = screen.getByLabelText(/contact info/i);
    fireEvent.change(contactInput, { target: { value: 'test@example.com' } });
    expect(contactInput).toHaveValue('test@example.com');
  });

  it('updates description textarea when user types', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    expect(descriptionInput).toHaveValue('Test description');
  });

  it('clears all form fields when Clear button is clicked', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    
    const jobTitleInput = screen.getByLabelText(/job title/i);
    const contactInput = screen.getByLabelText(/contact info/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    
    fireEvent.change(jobTitleInput, { target: { value: 'Software Engineer' } });
    fireEvent.change(contactInput, { target: { value: 'test@example.com' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    
    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);
    
    expect(jobTitleInput).toHaveValue('');
    expect(contactInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('sets default date to today', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    const dateInput = screen.getByLabelText(/date/i);
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput).toHaveValue(today);
  });

  it('prevents form submission with default behavior', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    
    const saveButton = screen.getByText('Save & Analyze');
    fireEvent.click(saveButton);
    
    // Form submission should be prevented (default preventDefault behavior)
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('displays placeholder note about analysis functionality', () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    expect(screen.getByText(/Analysis functionality is coming soon/i)).toBeInTheDocument();
  });
});

