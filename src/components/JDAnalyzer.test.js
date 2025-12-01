import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TestRouter } from '../test-utils';
import JDAnalyzer from './JDAnalyzer';
import * as api from '../services/api';

// Mock the API module
jest.mock('../services/api', () => ({
  jobDescriptionsAPI: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('JDAnalyzer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful API response with empty array
    api.jobDescriptionsAPI.getAll.mockResolvedValue({ jobDescriptions: [] });
  });

  it('renders without crashing', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('displays the Job Description Analyzer heading', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Job Description Analyzer')).toBeInTheDocument();
    });
  });

  it('renders all form fields', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consulting rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/consulting period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('renders Clear and Save buttons', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
    expect(screen.getByText('Save & Analyze')).toBeInTheDocument();
  });

  it('updates job title field when user types', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    const jobTitleInput = screen.getByLabelText(/job title/i);
    fireEvent.change(jobTitleInput, { target: { value: 'Software Engineer' } });
    expect(jobTitleInput).toHaveValue('Software Engineer');
  });

  it('updates email field when user types', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    const contactInput = screen.getByLabelText(/contact info/i);
    fireEvent.change(contactInput, { target: { value: 'test@example.com' } });
    expect(contactInput).toHaveValue('test@example.com');
  });

  it('updates description textarea when user types', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    expect(descriptionInput).toHaveValue('Test description');
  });

  it('clears all form fields when Clear button is clicked', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
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

  it('sets default date to today', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    const dateInput = screen.getByLabelText(/date/i);
    const today = new Date().toISOString().split('T')[0];
    expect(dateInput).toHaveValue(today);
  });

  it('calls API to create job description on form submission', async () => {
    api.jobDescriptionsAPI.create.mockResolvedValue({ jobDescription: { id: '1' } });
    
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    const saveButton = screen.getByText('Save & Analyze');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(api.jobDescriptionsAPI.create).toHaveBeenCalled();
    });
  });

  it('displays placeholder note about analysis functionality', async () => {
    render(
      <TestRouter>
        <JDAnalyzer />
      </TestRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Job descriptions are now saved to the database/i)).toBeInTheDocument();
    });
  });
});

