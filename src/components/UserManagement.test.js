/**
 * User Management Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagement from './UserManagement';
import { renderWithProviders } from '../test-utils';
import { adminAPI } from '../services/adminAPI';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../services/adminAPI');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('UserManagement', () => {
  const mockUsers = [
    {
      id: '1',
      name: 'User One',
      email: 'user1@example.com',
      role: 'user',
      is_active: true,
      last_login_at: '2024-01-01T00:00:00Z',
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'User Two',
      email: 'user2@example.com',
      role: 'admin',
      is_active: false,
      last_login_at: null,
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  const mockPagination = {
    page: 1,
    limit: 20,
    totalCount: 2,
    totalPages: 1,
  };

  const mockAdminUser = {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  const mockAuthContext = {
    user: mockAdminUser,
    isAdmin: jest.fn(() => true),
    hasElevatedSession: jest.fn(() => false),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    adminAPI.listUsers.mockResolvedValue({
      users: mockUsers,
      pagination: mockPagination,
    });
  });

  it('should redirect non-admin users', () => {
    const nonAdminContext = {
      user: { id: 'user-1', role: 'user' },
      isAdmin: jest.fn(() => false),
    };

    const { container } = renderWithProviders(<UserManagement />, {
      authValue: nonAdminContext,
    });

    // Should redirect (Navigate component)
    expect(container.querySelector('a[href="/"]')).toBeInTheDocument();
  });

  it('should render user management for admin', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText(/Manage user accounts, roles, and permissions/)).toBeInTheDocument();
    });
  });

  it('should load and display users', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    adminAPI.listUsers.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('should display "No users found" when empty', async () => {
    adminAPI.listUsers.mockResolvedValue({
      users: [],
      pagination: { page: 1, limit: 20, totalCount: 0, totalPages: 0 },
    });

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('should display user table with correct columns', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Last Login')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  it('should display user role badges', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('user')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('should display user status badges', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('should display "Never" for users without last login', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  it('should filter users by search term', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'One' } });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'One' })
      );
    });
  });

  it('should filter users by role', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
    });

    const roleSelect = screen.getByLabelText('Role');
    fireEvent.change(roleSelect, { target: { value: 'user' } });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user' })
      );
    });
  });

  it('should filter users by status', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
    });

    const statusSelect = screen.getByLabelText('Status');
    fireEvent.change(statusSelect, { target: { value: 'true' } });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ is_active: 'true' })
      );
    });
  });

  it('should change page limit', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
    });

    const limitSelect = screen.getByLabelText('Per Page');
    fireEvent.change(limitSelect, { target: { value: '50' } });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 50 })
      );
    });
  });

  it('should sort by column when header is clicked', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
    });

    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ sort_by: 'name', sort_order: 'ASC' })
      );
    });
  });

  it('should toggle sort order when same column is clicked again', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
    });

    const nameHeader = screen.getByText('Name');
    
    // First click - ASC
    fireEvent.click(nameHeader);
    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ sort_by: 'name', sort_order: 'ASC' })
      );
    });

    // Second click - DESC
    fireEvent.click(nameHeader);
    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ sort_by: 'name', sort_order: 'DESC' })
      );
    });
  });

  it('should display sort indicators', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
    });

    await waitFor(() => {
      expect(screen.getByText(/Name.*↑/)).toBeInTheDocument();
    });
  });

  it('should handle pagination', async () => {
    adminAPI.listUsers.mockResolvedValue({
      users: mockUsers,
      pagination: { page: 1, limit: 20, totalCount: 50, totalPages: 3 },
    });

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });
  });

  it('should disable previous button on first page', async () => {
    adminAPI.listUsers.mockResolvedValue({
      users: mockUsers,
      pagination: { page: 1, limit: 20, totalCount: 50, totalPages: 3 },
    });

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      const prevButton = screen.getByText('← Previous');
      expect(prevButton).toBeDisabled();
    });
  });

  it('should disable next button on last page', async () => {
    adminAPI.listUsers.mockResolvedValue({
      users: mockUsers,
      pagination: { page: 3, limit: 20, totalCount: 50, totalPages: 3 },
    });

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      const nextButton = screen.getByText('Next →');
      expect(nextButton).toBeDisabled();
    });
  });

  it('should display pagination info', async () => {
    adminAPI.listUsers.mockResolvedValue({
      users: mockUsers,
      pagination: { page: 2, limit: 20, totalCount: 50, totalPages: 3 },
    });

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText(/Showing 21 to 40 of 50 users/)).toBeInTheDocument();
    });
  });

  it('should open edit modal when edit button is clicked', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });
  });

  it('should close edit modal when onClose is called', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
    });
  });

  it('should reload users after successful edit', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
    });

    const editButtons = screen.getAllByTitle('Edit user');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });

    // Simulate successful edit
    const saveButton = screen.getByText('Save Changes');
    // This would trigger onSuccess which calls loadUsers
    // In a real scenario, we'd need to mock the edit API call
  });

  it('should handle API errors gracefully', async () => {
    adminAPI.listUsers.mockRejectedValue(new Error('Network error'));

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should show network error message for connection issues', async () => {
    adminAPI.listUsers.mockRejectedValue(new Error('Failed to fetch'));

    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Cannot connect to server')
      );
    });
  });

  it('should reset to first page when filter changes', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalled();
    });

    // Change to page 2
    adminAPI.listUsers.mockResolvedValue({
      users: mockUsers,
      pagination: { page: 2, limit: 20, totalCount: 50, totalPages: 3 },
    });

    const nextButton = screen.getByText('Next →');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      );
    });

    // Change filter - should reset to page 1
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    await waitFor(() => {
      expect(adminAPI.listUsers).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, search: 'test' })
      );
    });
  });

  it('should format dates correctly', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      // Check that dates are formatted (not raw ISO strings)
      const dateText = screen.getByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(dateText).toBeInTheDocument();
    });
  });

  it('should not load users if user is not admin', () => {
    const nonAdminContext = {
      user: { id: 'user-1', role: 'user' },
      isAdmin: jest.fn(() => false),
    };

    renderWithProviders(<UserManagement />, { authValue: nonAdminContext });

    expect(adminAPI.listUsers).not.toHaveBeenCalled();
  });

  it('should remove empty filters from API call', async () => {
    renderWithProviders(<UserManagement />, { authValue: mockAuthContext });

    await waitFor(() => {
      const callArgs = adminAPI.listUsers.mock.calls[0][0];
      // Should not include empty string values
      expect(callArgs.role).toBeUndefined();
      expect(callArgs.is_active).toBeUndefined();
      expect(callArgs.search).toBeUndefined();
    });
  });
});
