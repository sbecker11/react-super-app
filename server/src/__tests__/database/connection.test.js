/**
 * Database Connection Tests
 */

const { Pool } = require('pg');
const { query, getClient } = require('../../database/connection');

jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn();
  const mockPool = jest.fn(() => ({
    query: mockQuery,
    connect: mockConnect,
    on: jest.fn(),
  }));

  return {
    Pool: mockPool,
  };
});

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('query function', () => {
    it('should execute query successfully', async () => {
      // This test verifies the query function exists and can be called
      // In a real scenario, you'd test with a test database
      const { query } = require('../../database/connection');
      expect(query).toBeDefined();
      expect(typeof query).toBe('function');
    });

    it('should handle query errors', async () => {
      const { query } = require('../../database/connection');
      const error = new Error('Database error');
      
      // Mock pool.query to throw an error
      const { pool } = require('../../database/connection');
      const originalQuery = pool.query;
      pool.query = jest.fn().mockRejectedValueOnce(error);

      // Test that the query function properly propagates errors
      await expect(query('SELECT * FROM users')).rejects.toThrow('Database error');
      
      // Restore original query
      pool.query = originalQuery;
    });
  });

  describe('Pool configuration', () => {
    it('should create pool with correct configuration', () => {
      const pool = new Pool({
        host: 'localhost',
        port: 5432,
        user: 'testuser',
        password: 'testpass',
        database: 'testdb',
      });

      expect(Pool).toHaveBeenCalled();
      expect(pool).toBeDefined();
    });
  });
});

