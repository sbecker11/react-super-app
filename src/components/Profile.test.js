import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import * as AuthContext from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../services/api', () => ({
  usersAPI: {
    update: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();

// Wrapper component
const RouterWrapper = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Profile Component', () => {
  const mockUser = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-router-dom').useNavigate.mockReturnValue(mockNavigate);
  });

  describe('Positive Tests - View Mode', () => {
    it('should render user profile information', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('should display formatted member since date', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      // Check that date is formatted (should contain month name)
      expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument();
    });

    it('should render Edit Profile button', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('should render Logout button', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('Positive Tests - Edit Mode', () => {
    it('should enter edit mode when Edit Profile clicked', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      const editButton = screen.getByText('Edit Profile');
      fireEvent.click(editButton);

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should allow editing name field', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    });

    it('should allow editing email field', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));

      const emailInput = screen.getByDisplayValue('john@example.com');
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });

      expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    });

    it('should successfully update profile', async () => {
      const mockUpdateUser = jest.fn();
      const updatedUser = { ...mockUser, name: 'Jane Smith' };

      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: mockUpdateUser,
      });

      usersAPI.update.mockResolvedValue({ user: updatedUser });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(usersAPI.update).toHaveBeenCalledWith('123', {
          name: 'Jane Smith',
          email: 'john@example.com',
        });
      });

      expect(mockUpdateUser).toHaveBeenCalledWith(updatedUser);
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!');
    });

    it('should cancel edit mode and restore original values', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

      fireEvent.click(screen.getByText('Cancel'));

      // Should be back in view mode
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
      // Original name should be displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Negative Tests - Error Handling', () => {
    it('should handle API error during update', async () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      const errorMessage = 'Failed to update profile';
      usersAPI.update.mockRejectedValue(new Error(errorMessage));

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));

      const nameInput = screen.getByDisplayValue('John Doe');
      fireEvent.change(nameInput, { target: { value: 'New Name' } });

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining(errorMessage)
        );
      });
    });

    it('should handle network error during update', async () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      usersAPI.update.mockRejectedValue(new Error('Network error'));

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('should show loading spinner while saving', async () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      // Delay the API response
      usersAPI.update.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ user: mockUser }), 100))
      );

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));
      fireEvent.click(screen.getByText('Save Changes'));

      expect(screen.getByText(/saving profile/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText(/saving profile/i)).not.toBeInTheDocument();
      });
    });

    it('should prevent double submission', async () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      usersAPI.update.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ user: mockUser }), 100))
      );

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));
      
      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);
      fireEvent.click(saveButton); // Try to click again

      await waitFor(() => {
        expect(usersAPI.update).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout when Logout button clicked', () => {
      const mockLogout = jest.fn();

      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Logout'));

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should navigate to home after logout', () => {
      const mockLogout = jest.fn();

      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: mockLogout,
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Logout'));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Edge Cases', () => {
    it('should show loading when user is null', () => {
      AuthContext.useAuth.mockReturnValue({
        user: null,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it('should handle user with minimal data', () => {
      const minimalUser = {
        id: '1',
        name: 'User',
        email: 'user@test.com',
        created_at: '2024-01-01',
      };

      AuthContext.useAuth.mockReturnValue({
        user: minimalUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText('User')).toBeInTheDocument();
      expect(screen.getByText('user@test.com')).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      const longNameUser = {
        ...mockUser,
        name: 'A'.repeat(100),
      };

      AuthContext.useAuth.mockReturnValue({
        user: longNameUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
    });

    it('should handle special characters in name', () => {
      const specialCharUser = {
        ...mockUser,
        name: "O'Brien-Smith",
      };

      AuthContext.useAuth.mockReturnValue({
        user: specialCharUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText("O'Brien-Smith")).toBeInTheDocument();
    });

    it('should display password change note', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      expect(screen.getByText(/Password changes are not yet implemented/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require name field', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));

      const nameInput = screen.getByDisplayValue('John Doe');
      expect(nameInput).toHaveAttribute('required');
    });

    it('should require email field', () => {
      AuthContext.useAuth.mockReturnValue({
        user: mockUser,
        logout: jest.fn(),
        updateUser: jest.fn(),
      });

      render(
        <RouterWrapper>
          <Profile />
        </RouterWrapper>
      );

      fireEvent.click(screen.getByText('Edit Profile'));

      const emailInput = screen.getByDisplayValue('john@example.com');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });
});

