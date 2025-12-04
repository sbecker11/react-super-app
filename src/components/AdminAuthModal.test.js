/**
 * Admin Auth Modal Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminAuthModal from './AdminAuthModal';
import { renderWithProviders } from '../test-utils';

// Mock AuthContext
const mockRequestElevatedSession = jest.fn();

const mockAuthContext = {
  requestElevatedSession: mockRequestElevatedSession,
  user: { id: '1', role: 'admin' },
  isAdmin: () => true,
};

describe('AdminAuthModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestElevatedSession.mockClear();
  });

  it('should not render when isOpen is false', () => {
    renderWithProviders(
      <AdminAuthModal isOpen={false} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    expect(screen.queryByText('Admin Authentication Required')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    expect(screen.getByText('Admin Authentication Required')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    renderWithProviders(
      <AdminAuthModal
        isOpen={true}
        onClose={jest.fn()}
        onSuccess={jest.fn()}
        title="Custom Title"
      />,
      { authValue: mockAuthContext }
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('should display authentication message', () => {
    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    expect(
      screen.getByText(/This action requires elevated privileges/)
    ).toBeInTheDocument();
  });

  it('should update password input value', () => {
    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    expect(passwordInput.value).toBe('testpassword');
  });

  it('should call requestElevatedSession on form submit', async () => {
    mockRequestElevatedSession.mockResolvedValue(true);
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Authenticate');

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRequestElevatedSession).toHaveBeenCalledWith('testpassword');
    });
  });

  it('should call onSuccess and onClose on successful authentication', async () => {
    mockRequestElevatedSession.mockResolvedValue(true);
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Authenticate');

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should display error message on authentication failure', async () => {
    mockRequestElevatedSession.mockResolvedValue(false);
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Authenticate');

    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid password')).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should display error message on exception', async () => {
    mockRequestElevatedSession.mockRejectedValue(new Error('Network error'));
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Authenticate');

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button is clicked', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should call onClose when overlay is clicked', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const overlay = screen.getByText('Admin Authentication Required').closest('.admin-auth-modal-overlay');
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalled();
  });

  it('should not close when modal content is clicked', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const modal = screen.getByText('Admin Authentication Required').closest('.admin-auth-modal');
    fireEvent.click(modal);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should disable submit button when password is empty', () => {
    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const submitButton = screen.getByText('Authenticate');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when password is entered', () => {
    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Authenticate');

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });

    expect(submitButton).not.toBeDisabled();
  });

  it('should show loading state during authentication', async () => {
    let resolveAuth;
    const authPromise = new Promise((resolve) => {
      resolveAuth = resolve;
    });
    mockRequestElevatedSession.mockReturnValue(authPromise);

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByText('Authenticate');

    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });

    expect(submitButton).toBeDisabled();
    expect(passwordInput).toBeDisabled();

    resolveAuth(true);
  });

  it('should clear password and error on close', () => {
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByText('Cancel'));

    // Re-open modal
    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    const newPasswordInput = screen.getByLabelText('Password');
    expect(newPasswordInput.value).toBe('');
  });

  it('should display note about elevated session expiration', () => {
    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={jest.fn()} onSuccess={jest.fn()} />,
      { authValue: mockAuthContext }
    );

    expect(
      screen.getByText(/Elevated session will expire after 15 minutes/)
    ).toBeInTheDocument();
  });

  it('should submit form on Enter key press', async () => {
    mockRequestElevatedSession.mockResolvedValue(true);
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderWithProviders(
      <AdminAuthModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      { authValue: mockAuthContext }
    );

    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockRequestElevatedSession).toHaveBeenCalledWith('testpassword');
    });
  });
});
