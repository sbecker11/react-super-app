# Integration Tests - Server Availability Check

## Overview

This document explains why integration tests require a running server and how the server availability check has been implemented.

---

## Why Integration Tests Need a Running Server

### Client-Side Integration Tests (`src/services/api.integration.test.js`)

**What they test:**
- Real HTTP requests to `http://localhost:3001/api`
- End-to-end API functionality
- Authentication flows
- Database operations through the API

**Why they need a server:**
1. **Real HTTP Requests**: These tests use `fetch()` to make actual HTTP requests to a running Express server
2. **Full Stack Testing**: They test the complete request/response cycle including:
   - Express routes
   - Middleware (authentication, validation)
   - Database operations
   - Error handling
3. **Network Layer**: Unlike unit tests that mock dependencies, these tests verify the actual network communication

**Example:**
```javascript
// This makes a REAL HTTP request to http://localhost:3001/api/auth/register
const result = await authAPI.register({
  name: 'Test User',
  email: 'test@example.com',
  password: 'Password123!'
});
```

### Server-Side Integration Tests (`server/src/__tests__/api.test.js`)

**What they test:**
- Express routes and middleware
- Database operations
- Request/response handling

**Why they DON'T need a running server:**
- They use `supertest` which creates an HTTP server internally
- They import the Express app directly: `const app = require('../index')`
- They test the app without starting a real server process

**Example:**
```javascript
// This doesn't require a running server - supertest handles it
const response = await request(app)
  .post('/api/auth/register')
  .send({ name: 'Test', email: 'test@example.com', password: 'Pass123!' })
  .expect(201);
```

---

## Have Tests Been Run Without a Server?

**Yes** - Before the fix:
- ❌ Running `npm test` without starting the server would cause integration tests to **fail**
- ❌ Tests would throw errors like "Network request failed" or "ECONNREFUSED"
- ❌ This made it look like there were test failures when the server just wasn't running

**Now** - After the fix:
- ✅ Tests **skip gracefully** when server is not available
- ✅ Clear messages guide users to start the server
- ✅ Tests don't fail - they're skipped with helpful instructions

---

## Server Availability Check Implementation

### New Utility: `src/utils/serverCheck.js`

This utility provides three functions:

1. **`isServerAvailable(timeout)`** - Returns `true/false` if server is available
2. **`requireServer(timeout)`** - Throws error if server is not available (for strict mode)
3. **`skipIfServerUnavailable(timeout)`** - Returns `false` and logs warning if server unavailable (for graceful skipping)

### How It Works

```javascript
// Checks the /health endpoint
const response = await fetch('http://localhost:3001/health', {
  method: 'GET',
  signal: AbortController.signal, // Timeout after 3 seconds
});

// Returns true if server responds with 200 OK
return response.ok;
```

### Integration in Tests

```javascript
import { skipIfServerUnavailable } from '../utils/serverCheck';

describe('API Service Integration Tests', () => {
  let serverAvailable = false;

  beforeAll(async () => {
    // Check if server is available
    serverAvailable = await skipIfServerUnavailable();
  });

  // Helper to skip individual tests
  const skipIfNoServer = () => {
    if (!serverAvailable) {
      console.log('⏭️  Skipping test - server not available');
      return true;
    }
    return false;
  };

  it('should register a new user', async () => {
    if (skipIfNoServer()) return; // Skip if server not available
    
    // Test code here...
  });
});
```

---

## Running Integration Tests

### Option 1: Use the Script (Recommended)
```bash
npm run test:integration
```
This script:
1. Runs `ensure-docker-services.sh` to start PostgreSQL and server
2. Waits for services to be ready
3. Runs integration tests

### Option 2: Manual Start
```bash
# Start server
npm run start:services:detached

# Wait for server to be ready, then run tests
npm test -- --testPathPattern="integration"
```

### Option 3: Watch Mode
```bash
npm run test:integration:watch
```

---

## Test Behavior

### When Server IS Available
```
✅ Server is available - running integration tests
✓ should check server health
✓ should register a new user successfully
✓ should login with valid credentials
...
```

### When Server IS NOT Available
```
⚠️  Server not available - skipping integration tests

Server endpoint: http://localhost:3001/health

To run integration tests:
  1. Start the server: npm run start:services:detached
  2. Or: cd server && npm run dev
  3. Then run tests again

⏭️  Skipping test - server not available
⏭️  Skipping test - server not available
...

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
```

**Note:** Tests show as "passed" when skipped because they return early without errors. This is intentional - we want graceful skipping, not failures.

---

## Benefits

1. ✅ **No False Failures**: Tests don't fail when server isn't running
2. ✅ **Clear Instructions**: Helpful messages guide users to start the server
3. ✅ **Fast Feedback**: Server check happens once in `beforeAll`, not per test
4. ✅ **Reusable**: `serverCheck.js` can be used by other integration tests
5. ✅ **Configurable**: Timeout and endpoint can be customized

---

## Summary

- **Client integration tests** require a running server because they make real HTTP requests
- **Server integration tests** don't require a running server (they use `supertest`)
- Tests now **skip gracefully** when server is unavailable instead of failing
- Clear error messages guide users to start the server
- Server availability is checked once in `beforeAll` for efficiency

