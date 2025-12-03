/**
 * API Service Integration Tests
 * Tests API service against real Docker server
 * 
 * Prerequisites:
 * - Docker Compose services must be running
 * - Run: npm run start:services:detached
 * - Or: docker compose up -d postgres && cd server && npm run dev
 */

import { authAPI, usersAPI, healthAPI } from './api';

// Use real fetch (not mocked)
// Don't mock localStorage - use real one for integration tests

describe('API Service Integration Tests', () => {
  let testUser = {
    name: 'Integration Test User',
    email: `integration-test-${Date.now()}@example.com`,
    password: 'IntegrationTest123!',
  };
  
  let authToken;
  let userId;

  // Check if server is available
  beforeAll(async () => {
    // Use a simple fetch check - if fetch is not available, we'll handle it in the test
    try {
      // Check if fetch is available (it should be in react-scripts test environment)
      if (typeof fetch === 'undefined') {
        throw new Error('fetch is not available in test environment');
      }
      
      const response = await fetch('http://localhost:3001/health');
      if (!response.ok) {
        throw new Error('Server not responding');
      }
      console.log('✅ Docker server is available for integration tests');
    } catch (error) {
      console.error('❌ Docker server not available. Skipping integration tests.');
      console.error('   Error:', error.message);
      console.error('   Start server with: npm run start:services:detached');
      throw new Error('Docker server not available for integration tests');
    }
  });

  // Clean up test user after all tests
  afterAll(async () => {
    if (authToken && userId) {
      try {
        // Try to delete test user (may fail if already deleted)
        await fetch(`http://localhost:3001/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('healthAPI', () => {
    it('should check server health', async () => {
      const result = await healthAPI.check();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('message', 'Server is running');
    });
  });

  describe('authAPI', () => {
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const result = await authAPI.register({
          name: testUser.name,
          email: testUser.email,
          password: testUser.password,
        });

        expect(result).toHaveProperty('message', 'User registered successfully');
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('user');
        expect(result.user).toHaveProperty('id');
        expect(result.user).toHaveProperty('name', testUser.name);
        expect(result.user).toHaveProperty('email', testUser.email);

        // Store token and user ID for later tests
        authToken = result.token;
        userId = result.user.id;

        // Store token in localStorage (as real app would)
        localStorage.setItem('token', authToken);
      });

      it('should reject duplicate email', async () => {
        await expect(
          authAPI.register({
            name: 'Another User',
            email: testUser.email, // Same email as above
            password: 'AnotherPassword123!',
          })
        ).rejects.toThrow();
      });

      it('should validate email format', async () => {
        await expect(
          authAPI.register({
            name: 'Test User',
            email: 'invalid-email',
            password: 'Password123!',
          })
        ).rejects.toThrow();
      });

      it('should validate password requirements', async () => {
        await expect(
          authAPI.register({
            name: 'Test User',
            email: 'test2@example.com',
            password: 'weak', // Too weak
          })
        ).rejects.toThrow();
      });
    });

    describe('login', () => {
      it('should login with valid credentials', async () => {
        const result = await authAPI.login(testUser.email, testUser.password);

        expect(result).toHaveProperty('message', 'Login successful');
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('user');
        expect(result.user).toHaveProperty('email', testUser.email);

        // Update stored token
        authToken = result.token;
        localStorage.setItem('token', authToken);
      });

      it('should reject invalid email', async () => {
        await expect(
          authAPI.login('nonexistent@example.com', testUser.password)
        ).rejects.toThrow();
      });

      it('should reject invalid password', async () => {
        await expect(
          authAPI.login(testUser.email, 'WrongPassword123!')
        ).rejects.toThrow();
      });
    });
  });

  describe('usersAPI', () => {
    beforeEach(() => {
      // Ensure we have a token
      if (authToken) {
        localStorage.setItem('token', authToken);
      }
    });

    describe('getCurrent', () => {
      it('should get current user with valid token', async () => {
        const result = await usersAPI.getCurrent();

        expect(result).toHaveProperty('user');
        expect(result.user).toHaveProperty('id', userId);
        expect(result.user).toHaveProperty('email', testUser.email);
        expect(result.user).toHaveProperty('name', testUser.name);
      });

      it('should reject request without token', async () => {
        localStorage.removeItem('token');

        await expect(usersAPI.getCurrent()).rejects.toThrow();
      });
    });

    describe('getById', () => {
      it('should get user by ID with valid token', async () => {
        const result = await usersAPI.getById(userId);

        expect(result).toHaveProperty('user');
        expect(result.user).toHaveProperty('id', userId);
        expect(result.user).toHaveProperty('email', testUser.email);
      });

      it('should return 404 for non-existent user', async () => {
        const fakeId = '00000000-0000-0000-0000-000000000000';
        await expect(usersAPI.getById(fakeId)).rejects.toThrow();
      });
    });

    describe('update', () => {
      it('should update user with valid token', async () => {
        const updatedName = 'Updated Integration Test User';
        const result = await usersAPI.update(userId, {
          name: updatedName,
        });

        expect(result).toHaveProperty('message', 'User updated successfully');
        expect(result).toHaveProperty('user');
        expect(result.user).toHaveProperty('name', updatedName);

        // Restore original name for other tests
        await usersAPI.update(userId, {
          name: testUser.name,
        });
      });

      it('should update email with valid token', async () => {
        const newEmail = `updated-${Date.now()}@example.com`;
        const result = await usersAPI.update(userId, {
          email: newEmail,
        });

        expect(result.user).toHaveProperty('email', newEmail);

        // Update back to original email
        await usersAPI.update(userId, {
          email: testUser.email,
        });
      });

      it('should reject update with duplicate email', async () => {
        // Create another user first
        const otherUser = await authAPI.register({
          name: 'Other User',
          email: `other-${Date.now()}@example.com`,
          password: 'OtherPassword123!',
        });

        // Try to update with duplicate email
        await expect(
          usersAPI.update(userId, {
            email: otherUser.user.email,
          })
        ).rejects.toThrow();

        // Clean up other user
        try {
          await fetch(`http://localhost:3001/api/users/${otherUser.user.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${otherUser.token}`,
            },
          });
        } catch (error) {
          // Ignore cleanup errors
        }
      });
    });

    describe('getAll', () => {
      it('should get all users with valid token', async () => {
        const result = await usersAPI.getAll();

        expect(result).toHaveProperty('users');
        expect(Array.isArray(result.users)).toBe(true);
        expect(result.users.length).toBeGreaterThan(0);
      });
    });
  });
});

