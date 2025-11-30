# Server-Side and Middleware Test Execution Guide

## 🎯 Overview

Server-side tests are executed using **Jest**, a JavaScript testing framework. There are two main types of tests:

1. **Middleware Unit Tests** - Fast, isolated tests that mock dependencies
2. **API Integration Tests** - Full integration tests that require a database

---

## 🚀 How to Execute Tests

### Method 1: Run All Tests

```bash
cd server
npm test
```

**Executes:**
- Jest test runner (configured in `jest.config.js`)
- Finds all `*.test.js` files in `__tests__/` directories
- Runs setup file (`src/__tests__/setup.js`) first
- Executes all tests in Node.js environment

### Method 2: Run Specific Test Files

```bash
cd server

# Run only middleware tests (no database needed)
npm test -- middleware/auth.test.js

# Run only API integration tests (requires database)
npm test -- api.test.js

# Run only database tests
npm test -- database/connection.test.js
```

### Method 3: Run Tests by Pattern

```bash
cd server

# Run all middleware tests
npm test -- --testPathPattern="middleware"

# Run all API tests
npm test -- --testPathPattern="api"

# Run tests matching pattern in name
npm test -- --testNamePattern="should authenticate"
```

---

## 📋 Test Execution Process

### Step-by-Step Flow

```
1. Command: npm test
   ↓
2. Jest reads jest.config.js configuration
   ↓
3. Finds test files matching: **/__tests__/**/*.test.js
   ↓
4. Executes setup file: src/__tests__/setup.js
   - Sets NODE_ENV=test
   - Configures test environment variables
   - Sets JWT_SECRET for testing
   - Configures test database credentials
   ↓
5. For each test file:
   a. Loads test file and dependencies
   b. Sets up mocks (if any)
   c. Runs beforeAll hooks
   d. For each test:
      - Runs beforeEach hooks
      - Executes test code
      - Runs afterEach hooks
   e. Runs afterAll hooks
   ↓
6. Generates test report with results
   ↓
7. Exits with code 0 (success) or 1 (failure)
```

---

## 🧪 Middleware Tests (Unit Tests)

### Location
`server/src/__tests__/middleware/auth.test.js`

### How They Work

**Execution:**
```bash
npm test -- middleware/auth.test.js
```

**Characteristics:**
- ✅ **Fast** - No database connection needed
- ✅ **Isolated** - Tests middleware function in isolation
- ✅ **Mocked** - Uses mocks for database and dependencies
- ✅ **Unit Testing** - Tests single function behavior

**How They Execute:**

1. **Mock Dependencies:**
   ```javascript
   // Mocks database connection
   jest.mock('../../database/connection', () => ({
     query: jest.fn(),
   }));
   ```

2. **Create Mock Objects:**
   ```javascript
   req = { headers: {} };
   res = { status: jest.fn(), json: jest.fn() };
   next = jest.fn();
   ```

3. **Execute Middleware:**
   ```javascript
   await authenticate(req, res, next);
   ```

4. **Verify Results:**
   ```javascript
   expect(res.status).toHaveBeenCalledWith(401);
   expect(next).toHaveBeenCalled();
   ```

**Example Output:**
```
PASS src/__tests__/middleware/auth.test.js
  Authentication Middleware
    No token provided
      ✓ should return 401 if no Authorization header (4 ms)
      ✓ should return 401 if Authorization header does not start with Bearer (1 ms)
    Invalid token
      ✓ should return 401 if token is invalid (1 ms)
      ✓ should return 401 if token is expired (6 ms)
    Valid token
      ✓ should authenticate user with valid token (3 ms)
      ✓ should return 401 if user not found in database (3 ms)
    Error handling
      ✓ should return 500 if database query fails (31 ms)

Test Suites: 1 passed, 1 total
Tests: 7 passed, 7 total
```

---

## 🔌 API Integration Tests

### Location
`server/src/__tests__/api.test.js`

### How They Work

**Execution:**
```bash
npm test -- api.test.js
```

**Requirements:**
- ⚠️ **Requires Database** - PostgreSQL must be running
- ⚠️ **Requires Server** - Express app must be importable
- ✅ **Full Integration** - Tests complete request/response cycle

**How They Execute:**

1. **Import Express App:**
   ```javascript
   const app = require('../index');
   // Server doesn't start (NODE_ENV=test prevents this)
   ```

2. **Use Supertest for HTTP Requests:**
   ```javascript
   const request = require('supertest');
   
   const response = await request(app)
     .post('/api/auth/register')
     .send({ name: 'Test', email: 'test@example.com', password: 'Pass123!' })
     .expect(201);
   ```

3. **Make Real HTTP Requests:**
   - Creates HTTP requests to Express routes
   - Executes actual route handlers
   - Connects to real database
   - Returns HTTP responses

4. **Verify Responses:**
   ```javascript
   expect(response.body).toHaveProperty('token');
   expect(response.status).toBe(201);
   ```

**Setup Requirements:**

1. **Start PostgreSQL:**
   ```bash
   # Using Docker Compose (recommended)
   cd ..  # Go to project root
   docker-compose up postgres -d
   
   # Or use local PostgreSQL
   # Ensure PostgreSQL is running on localhost:5432
   ```

2. **Create Test Database (if needed):**
   ```bash
   createdb react_super_app_test
   ```

3. **Run Tests:**
   ```bash
   cd server
   npm test -- api.test.js
   ```

**Example Output:**
```
PASS src/__tests__/api.test.js
  API Integration Tests
    Health Check
      ✓ should return health status (45 ms)
    POST /api/auth/register
      ✓ should register a new user successfully (123 ms)
      ✓ should reject duplicate email (89 ms)
      ...
```

---

## 🔧 Configuration Files

### 1. Jest Configuration (`jest.config.js`)

**Purpose:** Configures Jest test runner

```javascript
module.exports = {
  testEnvironment: 'node',           // Node.js, not browser
  testMatch: ['**/__tests__/**/*.test.js'],  // Find test files
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],  // Run before tests
  testTimeout: 10000,                // 10 second timeout
  coverageThreshold: {               // Coverage requirements
    global: { branches: 70, functions: 70, lines: 70, statements: 70 }
  }
};
```

### 2. Test Setup File (`src/__tests__/setup.js`)

**Purpose:** Configures environment before tests run

**What it does:**
- Sets `NODE_ENV=test` (prevents server from starting)
- Sets `JWT_SECRET` for testing
- Configures test database credentials
- Sets up test environment variables

**Key Configuration:**
```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.DB_NAME = 'react_super_app_test';
```

### 3. Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",                    // Run all tests
    "test:watch": "jest --watch",      // Watch mode
    "test:coverage": "jest --coverage" // With coverage
  }
}
```

---

## 📊 Test Execution Comparison

| Feature | Middleware Tests | API Integration Tests |
|---------|------------------|----------------------|
| **Speed** | Fast (~0.5s) | Slower (~5-10s) |
| **Database** | Not needed | Required |
| **Mocking** | Heavy mocking | Real connections |
| **Isolation** | High | Low |
| **Test Type** | Unit tests | Integration tests |
| **Dependencies** | Mocked | Real |
| **HTTP** | No HTTP calls | Real HTTP requests |

---

## 🎯 Common Commands

### Run All Tests
```bash
cd server
npm test
```

### Run Only Middleware Tests (No Database)
```bash
cd server
npm test -- --testPathPattern="middleware"
```

### Run Only API Tests (Requires Database)
```bash
cd server
npm test -- --testPathPattern="api"
```

### Run with Coverage
```bash
cd server
npm test -- --coverage
```

### Run in Watch Mode
```bash
cd server
npm test -- --watch
```

### Run Specific Test File
```bash
cd server
npm test -- middleware/auth.test.js
```

### Run with Verbose Output
```bash
cd server
npm test -- --verbose
```

### List All Test Files
```bash
cd server
npm test -- --listTests
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Errors

**Error:**
```
ECONNREFUSED ::1:5432
```

**Solutions:**

1. **Start PostgreSQL with Docker:**
   ```bash
   docker-compose up postgres -d
   ```

2. **Or skip API tests:**
   ```bash
   npm test -- --testPathPattern="middleware"
   ```

3. **Or use test database:**
   ```bash
   export TEST_DB_NAME=react_super_app_test
   npm test
   ```

### Issue: Tests Timeout

**Solution:**
Increase timeout in `jest.config.js`:
```javascript
testTimeout: 30000,  // 30 seconds
```

### Issue: Module Not Found

**Solution:**
```bash
cd server
npm install
```

### Issue: Port Already in Use

**Note:** Integration tests use `supertest` which doesn't bind to ports. If you see this error, check if the server is running separately.

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Node.js Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

---

## ✅ Quick Reference

**Run middleware tests (fast, no database):**
```bash
cd server && npm test -- middleware
```

**Run API tests (requires database):**
```bash
docker-compose up postgres -d && cd server && npm test -- api
```

**Run all tests:**
```bash
cd server && npm test
```

