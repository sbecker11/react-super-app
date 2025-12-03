/**
 * Admin Routes Integration Tests
 * Tests admin endpoints with actual Express server
 */

const request = require('supertest');
const app = require('../index');
const { query } = require('../database/connection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test admin user data
const adminUser = {
  name: 'Admin Test User',
  email: 'admin-test@example.com',
  password: 'AdminTest123!',
  role: 'admin',
};

const regularUser = {
  name: 'Regular Test User',
  email: 'regular-test@example.com',
  password: 'RegularTest123!',
  role: 'user',
};

let adminToken;
let adminUserId;
let regularUserId;
let regularUserToken;

describe('Admin Routes Integration Tests', () => {
  // Clean up database before and after tests
  beforeAll(async () => {
    // Clean up any existing test users
    try {
      await query('DELETE FROM users WHERE email IN ($1, $2)', [
        adminUser.email,
        regularUser.email,
      ]);
    } catch (error) {
      // Ignore if table doesn't exist yet
    }

    // Create admin user
    const adminPasswordHash = await bcrypt.hash(adminUser.password, 10);
    const adminResult = await query(
      'INSERT INTO users (name, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [adminUser.name, adminUser.email, adminPasswordHash, adminUser.role, true]
    );
    adminUserId = adminResult.rows[0].id;

    // Create regular user
    const regularPasswordHash = await bcrypt.hash(regularUser.password, 10);
    const regularResult = await query(
      'INSERT INTO users (name, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [regularUser.name, regularUser.email, regularPasswordHash, regularUser.role, true]
    );
    regularUserId = regularResult.rows[0].id;

    // Generate admin token
    adminToken = jwt.sign(
      { userId: adminUserId, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate regular user token
    regularUserToken = jwt.sign(
      { userId: regularUserId, email: regularUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test users
    try {
      await query('DELETE FROM users WHERE email IN ($1, $2)', [
        adminUser.email,
        regularUser.email,
      ]);
    } catch (error) {
      // Ignore errors
    }
  });

  describe('POST /api/admin/verify-password', () => {
    it('should verify admin password and return elevated token', async () => {
      const response = await request(app)
        .post('/api/admin/verify-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: adminUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('elevatedToken');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('message', 'Elevated session granted');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/admin/verify-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: 'WrongPassword123!' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid password');
      expect(response.body).toHaveProperty('code', 'INVALID_PASSWORD');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/admin/verify-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Password required');
      expect(response.body).toHaveProperty('code', 'PASSWORD_REQUIRED');
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .post('/api/admin/verify-password')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ password: regularUser.password })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Admin access required');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should list all users for admin', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/admin/users?role=user')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.every(u => u.role === 'user')).toBe(true);
    });

    it('should filter users by is_active', async () => {
      const response = await request(app)
        .get('/api/admin/users?is_active=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.every(u => u.is_active === true)).toBe(true);
    });

    it('should search users by name or email', async () => {
      const response = await request(app)
        .get(`/api/admin/users?search=${adminUser.name.split(' ')[0]}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.length).toBeGreaterThan(0);
      expect(
        response.body.users.some(u => 
          u.name.toLowerCase().includes(adminUser.name.toLowerCase()) ||
          u.email.toLowerCase().includes(adminUser.email.toLowerCase())
        )
      ).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 2);
      expect(response.body.pagination).toHaveProperty('totalCount');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/admin/users?sort_by=name&sort_order=ASC')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.users.length).toBeGreaterThan(0);
      // Check if sorted (first user's name should be alphabetically before or equal to last)
      if (response.body.users.length > 1) {
        const names = response.body.users.map(u => u.name.toLowerCase());
        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
      }
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Admin access required');
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should get user details for admin', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', regularUserId);
      expect(response.body).toHaveProperty('name', regularUser.name);
      expect(response.body).toHaveProperty('email', regularUser.email);
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('recentActivity');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
      expect(response.body).toHaveProperty('code', 'USER_NOT_FOUND');
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUserId}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Admin access required');
    });
  });

  describe('PUT /api/admin/users/:id/role', () => {
    let elevatedToken;

    beforeAll(async () => {
      // Get elevated token for role change
      const verifyResponse = await request(app)
        .post('/api/admin/verify-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: adminUser.password });
      elevatedToken = verifyResponse.body.elevatedToken;
    });

    it('should change user role with elevated session', async () => {
      // First, ensure user is 'user' role
      await query('UPDATE users SET role = $1 WHERE id = $2', ['user', regularUserId]);

      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User role updated successfully');
      expect(response.body.user).toHaveProperty('role', 'admin');

      // Change back to user
      await query('UPDATE users SET role = $1 WHERE id = $2', ['user', regularUserId]);
    });

    it('should reject invalid role', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ role: 'invalid_role' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid role. Must be "admin" or "user"');
    });

    it('should reject changing own role', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${adminUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ role: 'user' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Cannot change your own role');
    });

    it('should require elevated session', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Elevated session required. Please re-authenticate.');
    });
  });

  describe('PUT /api/admin/users/:id/password', () => {
    let elevatedToken;

    beforeAll(async () => {
      // Get elevated token for password reset
      const verifyResponse = await request(app)
        .post('/api/admin/verify-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: adminUser.password });
      elevatedToken = verifyResponse.body.elevatedToken;
    });

    it('should reset user password with elevated session', async () => {
      const newPassword = 'NewPassword123!';
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ newPassword })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User password reset successfully');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: regularUser.email, password: newPassword })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');

      // Reset password back
      const passwordHash = await bcrypt.hash(regularUser.password, 10);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, regularUserId]);
    });

    it('should reject password shorter than 8 characters', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ newPassword: 'short' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Password must be at least 8 characters');
    });

    it('should require elevated session', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/password`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ newPassword: 'NewPassword123!' })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Elevated session required. Please re-authenticate.');
    });
  });

  describe('PUT /api/admin/users/:id/status', () => {
    let elevatedToken;

    beforeAll(async () => {
      // Get elevated token for status change
      const verifyResponse = await request(app)
        .post('/api/admin/verify-password')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ password: adminUser.password });
      elevatedToken = verifyResponse.body.elevatedToken;
    });

    it('should deactivate user with elevated session', async () => {
      // Ensure user is active first
      await query('UPDATE users SET is_active = $1 WHERE id = $2', [true, regularUserId]);

      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ is_active: false })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User account deactivated successfully');
      expect(response.body.user).toHaveProperty('is_active', false);

      // Reactivate user
      await query('UPDATE users SET is_active = $1 WHERE id = $2', [true, regularUserId]);
    });

    it('should activate user with elevated session', async () => {
      // Deactivate user first
      await query('UPDATE users SET is_active = $1 WHERE id = $2', [false, regularUserId]);

      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ is_active: true })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User account activated successfully');
      expect(response.body.user).toHaveProperty('is_active', true);
    });

    it('should reject changing own status', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${adminUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .set('x-elevated-token', elevatedToken)
        .send({ is_active: false })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Cannot change your own account status');
    });

    it('should require elevated session', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ is_active: false })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Elevated session required. Please re-authenticate.');
    });
  });

  describe('GET /api/admin/users/:id/activity', () => {
    it('should get user activity logs for admin', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUserId}/activity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('activity');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.activity)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUserId}/activity?limit=10&offset=0`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.activity.length).toBeLessThanOrEqual(10);
      expect(response.body.pagination).toHaveProperty('limit', 10);
      expect(response.body.pagination).toHaveProperty('offset', 0);
      expect(response.body.pagination).toHaveProperty('totalCount');
    });

    it('should reject non-admin users', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUserId}/activity`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Admin access required');
    });
  });
});

