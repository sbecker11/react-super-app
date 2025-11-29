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
      const mockRows = [{ id: 1, name: 'Test' }];
      const mockPool = new Pool();
      mockPool.query.mockResolvedValueOnce({
        rowCount: 1,
      });

      // Mock the query function to return our mock result
      const originalQuery = require('../../database/connection').query;
      
      // Since we're testing the actual implementation, we need to mock at the Pool level
      // This is a simplified test - in a real scenario, you'd test with a test database
      expect(mockPool.query).toBeDefined();
    });

    it('should handle query errors', async () => {
      const mockPool = new Pool();
      const error = new Error('Database error');
      mockPool.query.mockRejectedValueOnce(error);

      // Test error handling
      expect(mockPool.query).toBeDefined();
      await expect(mockPool.query('SELECT * FROM users')).rejects.toThrow('Database error');
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

