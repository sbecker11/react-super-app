# How to Run Server-Side and Middleware Tests

This guide explains how to execute server-side API integration tests and middleware unit tests.

## 📋 Test Structure

The server has the following test files:
- `src/__tests__/api.test.js` - API integration tests
- `src/__tests__/middleware/auth.test.js` - Authentication middleware unit tests
- `src/__tests__/database/connection.test.js` - Database connection tests

## 🚀 Quick Start

### Basic Test Execution

From the `server` directory:

```bash
cd server
npm test
```

This will:
1. Load Jest configuration from `jest.config.js`
2. Run setup file `src/__tests__/setup.js` to configure environment
3. Find all test files matching pattern `**/__tests__/**/*.test.js`
4. Execute all tests in Node.js environment

## 📝 Detailed Execution Methods

### 1. Run All Tests

```bash
cd server
npm test
```

**What happens:**
- Runs all test files in `src/__tests__/` directory
- Tests run in Node.js environment (not browser)
- Uses configuration from `jest.config.js`
- Loads setup file before running tests

### 2. Run Specific Test File

```bash
cd server

# Run only middleware tests
npm test -- middleware/auth.test.js

# Run only API tests
npm test -- api.test.js

# Run only database tests
npm test -- database/connection.test.js
```

**Alternative syntax:**
```bash
# Using testPathPattern
npm test -- --testPathPattern="middleware"

# Using testNamePattern
npm test -- --testNamePattern="should authenticate"
```

### 3. Run Tests in Watch Mode

```bash
cd server
npm test -- --watch
```

**What happens:**
- Tests re-run automatically when files change
- Interactive mode allows filtering tests
- Useful during development

### 4. Run Tests with Coverage

```bash
cd server
npm test -- --coverage
```

**Output includes:**
- Coverage percentage per file
- Coverage summary table
- HTML coverage report (in `coverage/` directory)

### 5. Run Tests Verbosely

```bash
cd server
npm test -- --verbose
```

Shows individual test names as they run.

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
{
  testEnvironment: 'node',           // Node.js environment (not browser)
  testMatch: ['**/__tests__/**/*.test.js'],  // Test file pattern
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],  // Setup file
  testTimeout: 10000,                // 10 second timeout per test
  coverageThreshold: {               // Coverage requirements
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Test Setup File (`src/__tests__/setup.js`)

**Executed before all tests:**
- Sets `NODE_ENV=test`
- Configures test database credentials
- Sets JWT secret for testing
- Can suppress console logs (optional)

## 🧪 How Different Test Types Are Executed

### Middleware Tests (Unit Tests)

**File**: `src/__tests__/middleware/auth.test.js`

**Execution:**
```bash
npm test -- middleware/auth.test.js
```

**What happens:**
1. Jest loads the test file
2. Mocks database connection (`jest.mock('../../database/connection')`)
3. Creates mock request/response/next objects
4. Tests middleware function in isolation
5. Verifies responses without actual HTTP server

**Key features:**
- ✅ Fast execution (no database connection)
- ✅ Isolated unit tests
- ✅ Mocked dependencies
- ✅ No network calls

**Example:**
```javascript
// Mock database
jest.mock('../../database/connection', () => ({
  query: jest.fn(),
}));

// Test middleware
it('should authenticate user with valid token', async () => {
  // Setup mocks
  query.mockResolvedValueOnce({ rows: [user] });
  
  // Execute middleware
  await authenticate(req, res, next);
  
  // Verify results
  expect(next).toHaveBeenCalled();
});
```

### API Integration Tests

**File**: `src/__tests__/api.test.js`

**Execution:**
```bash
npm test -- api.test.js
```

**What happens:**
1. Jest loads the test file
2. Uses `supertest` to make HTTP requests to Express app
3. App connects to actual/test database
4. Tests full request/response cycle
5. Cleans up test data after tests

**Key features:**
- ✅ Full integration testing
- ✅ Real HTTP requests
- ✅ Database operations
- ✅ End-to-end API testing

**Requirements:**
- PostgreSQL database must be running
- Database credentials configured in setup.js
- Test database: `react_super_app_test` (or as configured)

**Example:**
```javascript
// Make HTTP request to Express app
const response = await request(app)
  .post('/api/auth/register')
  .send({ name: 'Test', email: 'test@example.com', password: 'Pass123!' })
  .expect(201);

// Verify response
expect(response.body).toHaveProperty('token');
```

## 🗄️ Database Setup for Integration Tests

### Option 1: Use Docker Compose (Recommended)

```bash
# Start PostgreSQL in Docker
cd ..  # Go to project root
docker-compose up postgres -d

# Run tests
cd server
npm test
```

### Option 2: Local PostgreSQL

```bash
# Create test database
createdb react_super_app_test

# Set environment variables
export TEST_DB_NAME=react_super_app_test
export TEST_DB_USER=your_user
export TEST_DB_PASSWORD=your_password

# Run tests
cd server
npm test
```

### Option 3: Use Test Database from .env

Create `server/.env.test`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=superapp_user
DB_PASSWORD=superapp_password
DB_NAME=react_super_app_test
```

## 📊 Test Execution Flow

```
1. Run: npm test
   ↓
2. Jest reads jest.config.js
   ↓
3. Finds test files matching pattern
   ↓
4. Executes setup.js
   - Sets NODE_ENV=test
   - Configures environment variables
   ↓
5. For each test file:
   - Loads test file
   - Sets up mocks (if any)
   - Runs beforeAll/beforeEach hooks
   - Executes tests
   - Runs afterEach/afterAll hooks
   ↓
6. Generates test report
   ↓
7. Shows coverage (if --coverage flag used)
```

## 🐛 Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```bash
cd server
npm install
```

### Issue: Database connection errors

**Solution:**
1. Ensure PostgreSQL is running
2. Check database credentials in setup.js
3. Verify database exists: `createdb react_super_app_test`

### Issue: Tests timeout

**Solution:**
- Increase timeout in jest.config.js:
  ```javascript
  testTimeout: 30000,  // 30 seconds
  ```

### Issue: Port already in use

**Solution:**
- Integration tests don't bind to ports (use supertest)
- Check if server is already running: `lsof -i :3001`

### Issue: Module not found errors

**Solution:**
```bash
# Install dependencies
cd server
npm install

# Clear Jest cache
npm test -- --clearCache
```

## 📝 Test Scripts in package.json

```json
{
  "scripts": {
    "test": "jest",                    // Run all tests
    "test:watch": "jest --watch",      // Watch mode
    "test:coverage": "jest --coverage" // With coverage
  }
}
```

You can add custom scripts:
```json
{
  "scripts": {
    "test:unit": "jest middleware",
    "test:integration": "jest api.test.js",
    "test:all": "jest --coverage"
  }
}
```

## 🎯 Common Commands Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm test -- --watch` | Watch mode |
| `npm test -- --coverage` | With coverage report |
| `npm test -- middleware` | Run middleware tests only |
| `npm test -- api.test.js` | Run specific test file |
| `npm test -- --verbose` | Verbose output |
| `npm test -- --listTests` | List all test files |
| `npm test -- --clearCache` | Clear Jest cache |

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

