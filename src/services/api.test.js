/**
 * API Service Tests
 */

import { authAPI, usersAPI, healthAPI } from './api';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('API Service', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear();
  });

  describe('authAPI', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const mockResponse = {
          message: 'User registered successfully',
          token: 'mock-jwt-token',
          user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
          },
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await authAPI.register('John Doe', 'john@example.com', 'Password123!');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/register'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
            body: JSON.stringify({
              name: 'John Doe',
              email: 'john@example.com',
              password: 'Password123!',
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });

      it('should handle registration errors', async () => {
        const mockError = { error: 'User with this email already exists' };

        fetch.mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => mockError,
        });

        await expect(
          authAPI.register('John Doe', 'john@example.com', 'Password123!')
        ).rejects.toThrow('User with this email already exists');
      });

      it('should not include Authorization header', async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'success' }),
        });

        await authAPI.register('John Doe', 'john@example.com', 'Password123!');

        const callArgs = fetch.mock.calls[0][1];
        expect(callArgs.headers).not.toHaveProperty('Authorization');
      });
    });

    describe('login', () => {
      it('should login user successfully', async () => {
        const mockResponse = {
          message: 'Login successful',
          token: 'mock-jwt-token',
          user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
          },
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await authAPI.login('john@example.com', 'Password123!');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email: 'john@example.com',
              password: 'Password123!',
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });

      it('should handle login errors', async () => {
        const mockError = { error: 'Invalid email or password' };

        fetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => mockError,
        });

        await expect(
          authAPI.login('john@example.com', 'wrongpassword')
        ).rejects.toThrow('Invalid email or password');
      });
    });
  });

  describe('usersAPI', () => {
    beforeEach(() => {
      localStorage.getItem.mockReturnValue('mock-jwt-token');
    });

    describe('getAll', () => {
      it('should fetch all users', async () => {
        localStorageMock.getItem.mockReturnValue('mock-jwt-token');
        
        const mockResponse = {
          users: [
            { id: '1', name: 'User 1', email: 'user1@example.com' },
            { id: '2', name: 'User 2', email: 'user2@example.com' },
          ],
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await usersAPI.getAll();

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/users'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-jwt-token',
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });
    });

    describe('getCurrent', () => {
      it('should fetch current user', async () => {
        const mockResponse = {
          user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
          },
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await usersAPI.getCurrent();

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/users/me'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-jwt-token',
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });
    });

    describe('getById', () => {
      it('should fetch user by ID', async () => {
        const mockResponse = {
          user: {
            id: '123',
            name: 'John Doe',
            email: 'john@example.com',
          },
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await usersAPI.getById('123');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/users/123'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-jwt-token',
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });
    });

    describe('update', () => {
      it('should update user', async () => {
        const mockResponse = {
          message: 'User updated successfully',
          user: {
            id: '123',
            name: 'John Updated',
            email: 'john@example.com',
          },
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const updateData = { name: 'John Updated' };
        const result = await usersAPI.update('123', updateData);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/users/123'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify(updateData),
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-jwt-token',
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });
    });

    describe('delete', () => {
      it('should delete user', async () => {
        const mockResponse = {
          message: 'User deleted successfully',
        };

        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await usersAPI.delete('123');

        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/users/123'),
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-jwt-token',
            }),
          })
        );

        expect(result).toEqual(mockResponse);
      });
    });

    describe('Authorization header', () => {
      it('should include Authorization header when token exists', async () => {
        localStorage.getItem.mockReturnValue('mock-token');
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [] }),
        });

        await usersAPI.getAll();

        expect(fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer mock-token',
            }),
          })
        );
      });

      it('should not include Authorization header when token is missing', async () => {
        localStorage.getItem.mockReturnValue(null);
        fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ users: [] }),
        });

        await usersAPI.getAll();

        const callArgs = fetch.mock.calls[0][1];
        expect(callArgs.headers).not.toHaveProperty('Authorization');
      });
    });
  });

  describe('healthAPI', () => {
    it('should check server health', async () => {
      const mockResponse = {
        status: 'ok',
        message: 'Server is running',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await healthAPI.check();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/health')
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authAPI.login('test@example.com', 'password')).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle invalid JSON responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(authAPI.login('test@example.com', 'password')).rejects.toThrow();
    });

    it('should handle HTTP errors without JSON body', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(authAPI.login('test@example.com', 'password')).rejects.toThrow();
    });
  });
});

