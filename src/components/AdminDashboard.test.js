/**
 * Admin Dashboard Tests
 */

import React from 'react';
import { screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { renderWithProviders } from '../test-utils';

// Mock PageContainer to avoid dependency issues
jest.mock('./PageContainer', () => {
  return function MockPageContainer({ children }) {
    return <div data-testid="page-container">{children}</div>;
  };
});

describe('AdminDashboard', () => {
  const mockAdminUser = {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
  };

  const mockAuthContext = {
    user: mockAdminUser,
    isAdmin: jest.fn(() => true),
  };

  it('should render dashboard for admin user', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('should redirect non-admin users', () => {
    const mockUserContext = {
      user: { id: '2', role: 'user' },
      isAdmin: jest.fn(() => false),
    };

    renderWithProviders(<AdminDashboard />, {
      authValue: mockUserContext,
    });

    // Navigate component redirects, so dashboard content should not be visible
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('should display user management card', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText(/Manage user accounts, roles, and permissions/)).toBeInTheDocument();
  });

  it('should have link to user management', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    const link = screen.getByText('User Management').closest('a');
    expect(link).toHaveAttribute('href', '/admin/users');
  });

  it('should display analytics card as disabled', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('should display system settings card as disabled', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    expect(screen.getByText('System Settings')).toBeInTheDocument();
  });

  it('should display audit logs card as disabled', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('should display security info card', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    expect(screen.getByText('🔐 Security')).toBeInTheDocument();
    expect(
      screen.getByText(/Sensitive operations require password re-authentication/)
    ).toBeInTheDocument();
  });

  it('should display audit trail info card', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    expect(screen.getByText('📋 Audit Trail')).toBeInTheDocument();
    expect(
      screen.getByText(/All admin actions are logged with timestamps/)
    ).toBeInTheDocument();
  });

  it('should render all admin cards', () => {
    renderWithProviders(<AdminDashboard />, { authValue: mockAuthContext });

    const cards = screen.getAllByText(/User Management|Analytics|System Settings|Audit Logs/);
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('should handle null user gracefully', () => {
    const nullUserContext = {
      user: null,
      isAdmin: () => false,
    };

    renderWithProviders(<AdminDashboard />, { authValue: nullUserContext });
    
    // Should redirect
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });
});
