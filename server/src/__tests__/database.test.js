/**
 * Database Connection Tests
 * Tests for database connection and query utilities
 */

const { Pool } = require('pg');
const { pool, query, getClient } = require('../database/connection');

// Mock pg module
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
  };

  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
  });

  describe('Pool Configuration', () => {
    it('should create pool with default configuration', () => {
      // Re-require to get fresh instance
      jest.resetModules();
      require('../database/connection');

      expect(Pool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        user: 'superapp_user',
        password: 'superapp_password',
        database: 'react_super_app',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    });

    it('should create pool with environment variables', () => {
      process.env.DB_HOST = 'test-host';
      process.env.DB_PORT = '5433';
      process.env.DB_USER = 'test-user';
      process.env.DB_PASSWORD = 'test-password';
      process.env.DB_NAME = 'test-db';

      jest.resetModules();
      require('../database/connection');

      expect(Pool).toHaveBeenCalledWith({
        host: 'test-host',
        port: '5433',
        user: 'test-user',
        password: 'test-password',
        database: 'test-db',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    });
  });

  describe('Pool Event Handlers', () => {
    it('should set up connect event handler', () => {
      const mockOn = jest.fn();
      Pool.mockImplementation(() => ({
        query: jest.fn(),
        connect: jest.fn(),
        on: mockOn,
      }));

      jest.resetModules();
      require('../database/connection');

      expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
    });

    it('should set up error event handler', () => {
      const mockOn = jest.fn();
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
      const mockError = jest.fn();

      Pool.mockImplementation(() => ({
        query: jest.fn(),
        connect: jest.fn(),
        on: (event, handler) => {
          if (event === 'error') {
            mockOn(event, handler);
            // Simulate error
            handler(new Error('Test error'));
          }
        },
      }));

      jest.resetModules();
      require('../database/connection');

      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockExit).toHaveBeenCalledWith(-1);

      mockExit.mockRestore();
    });
  });

  describe('query function', () => {
    it('should execute query successfully', async () => {
      const mockResult = { rows: [{ id: 1, name: 'Test' }], rowCount: 1 };
      pool.query.mockResolvedValue(mockResult);

      const result = await query('SELECT * FROM users WHERE id = $1', [1]);

      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1]);
      expect(result).toEqual(mockResult);
    });

    it('should log query execution time', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockResult = { rows: [], rowCount: 0 };
      pool.query.mockResolvedValue(mockResult);

      await query('SELECT * FROM users', []);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Executed query',
        expect.objectContaining({
          text: 'SELECT * FROM users',
          duration: expect.any(Number),
          rows: 0,
        })
      );

      consoleSpy.mockRestore();
    });

    it('should handle query errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const dbError = new Error('Database connection failed');
      pool.query.mockRejectedValue(dbError);

      await expect(query('SELECT * FROM users', [])).rejects.toThrow('Database connection failed');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Database query error:', dbError);

      consoleErrorSpy.mockRestore();
    });

    it('should measure query duration', async () => {
      const mockResult = { rows: [], rowCount: 0 };
      pool.query.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockResult), 10);
        });
      });

      const start = Date.now();
      await query('SELECT * FROM users', []);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('getClient function', () => {
    it('should get client from pool', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const client = await getClient();

      expect(pool.connect).toHaveBeenCalled();
      expect(client).toBeDefined();
    });

    it('should set up timeout warning for long-running queries', async () => {
      jest.useFakeTimers();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      await getClient();

      // Fast-forward 5 seconds
      jest.advanceTimersByTime(5000);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'A client has been checked out for more than 5 seconds!'
      );

      jest.useRealTimers();
      consoleErrorSpy.mockRestore();
    });

    it('should monkey patch query method to track last query', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const client = await getClient();

      await client.query('SELECT * FROM users', []);

      expect(client.lastQuery).toEqual(['SELECT * FROM users', []]);
    });

    it('should restore original methods on release', async () => {
      const originalQuery = jest.fn().mockResolvedValue({ rows: [] });
      const originalRelease = jest.fn();
      const mockClient = {
        query: originalQuery,
        release: originalRelease,
      };
      pool.connect.mockResolvedValue(mockClient);

      const client = await getClient();
      const patchedRelease = client.release;

      await patchedRelease();

      expect(originalRelease).toHaveBeenCalled();
      expect(client.query).toBe(originalQuery);
      expect(client.release).toBe(originalRelease);
    });

    it('should clear timeout on release', async () => {
      jest.useFakeTimers();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      pool.connect.mockResolvedValue(mockClient);

      const client = await getClient();
      const release = client.release;

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000);

      // Release client
      await release();

      // Fast-forward another 3 seconds (total 6 seconds)
      jest.advanceTimersByTime(3000);

      // Should not have logged error because timeout was cleared
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      jest.useRealTimers();
      consoleErrorSpy.mockRestore();
    });
  });
});

