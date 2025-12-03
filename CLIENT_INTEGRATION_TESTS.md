# Client Integration Tests Against Docker Server

## Overview

Client integration tests run the React API service tests against the **real Docker server** instead of using mocks. This ensures that the client code works correctly with the actual API implementation.

## Test Results

✅ **16/16 tests passing (100%)**

### Test Coverage
- ✅ Health check API
- ✅ User registration (success, duplicate email, validation)
- ✅ User login (success, invalid credentials)
- ✅ Get current user
- ✅ Get user by ID
- ✅ Update user (name, email, duplicate email validation)
- ✅ Get all users

## Running Integration Tests

### Prerequisites
- Docker Compose services must be running (PostgreSQL + Server)
- The script automatically starts services if needed

### Run Integration Tests
```bash
npm run test:integration
```

This command:
1. ✅ Checks if Docker services are running
2. ✅ Starts PostgreSQL and server if needed
3. ✅ Runs integration tests against real API
4. ✅ Uses `node-fetch` to bypass jsdom CORS restrictions

### Run in Watch Mode
```bash
npm run test:integration:watch
```

### Run All Tests (Unit + Integration)
```bash
npm run test:all
```

## How It Works

### Setup Files

1. **`src/setupTests.integration.js`**
   - Configures tests to use real API instead of mocks
   - Uses `node-fetch` to bypass jsdom CORS restrictions
   - Sets `REACT_APP_API_URL=http://localhost:3001/api`

2. **`src/services/api.integration.test.js`**
   - Integration test file (uses `.integration.test.js` pattern)
   - Tests against real Docker server
   - Creates and cleans up test users

### Test Scripts

- **`scripts/ensure-docker-services.sh`**
  - Checks if PostgreSQL is running
  - Checks if server is running
  - Starts services if needed
  - Waits for services to be ready

### Configuration

Integration tests are configured via:
- `--setupFilesAfterEnv=./src/setupTests.integration.js`
- `--testMatch='**/*.integration.test.js'`
- `REACT_APP_API_URL=http://localhost:3001/api`

## Differences from Unit Tests

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| **File Pattern** | `*.test.js` | `*.integration.test.js` |
| **Setup File** | `setupTests.js` | `setupTests.integration.js` |
| **Fetch** | Mocked | Real (node-fetch) |
| **localStorage** | Mocked | Real |
| **API Calls** | Mocked responses | Real HTTP requests |
| **Server Required** | No | Yes (Docker) |
| **Speed** | Fast | Slower (network calls) |
| **Isolation** | High | Lower (uses real DB) |

## Test Files

### Current Integration Tests
- `src/services/api.integration.test.js` - API service integration tests

### Future Integration Tests
- Component integration tests (LoginRegister, Profile, etc.)
- Full user flow tests
- Admin functionality tests

## Troubleshooting

### Server Not Available
```
❌ Docker server not available. Skipping integration tests.
```

**Solution:**
```bash
# Start Docker services
npm run start:services:detached

# Or manually
docker compose up -d postgres
cd server && npm run dev
```

### CORS Errors
If you see CORS errors, ensure:
- `node-fetch` is installed: `npm install --save-dev node-fetch@2`
- Setup file is using `node-fetch` instead of jsdom's fetch

### Port Conflicts
If ports 3001 or 5432 are in use:
```bash
# Check what's using the port
lsof -i :3001
lsof -i :5432

# Kill process or use different ports
```

### Test User Cleanup
Integration tests create test users. If cleanup fails:
```bash
# Manually clean test users
docker compose exec postgres psql -U superapp_user -d react_super_app_test -c "DELETE FROM users WHERE email LIKE 'integration-test-%';"
```

## Best Practices

1. **Test Isolation**
   - Each test should clean up after itself
   - Use unique email addresses (timestamp-based)
   - Delete test users in `afterAll`

2. **Error Handling**
   - Tests should handle network errors gracefully
   - Check server availability before running tests
   - Provide clear error messages

3. **Test Data**
   - Use realistic test data
   - Follow validation rules
   - Clean up test data after tests

4. **Performance**
   - Integration tests are slower than unit tests
   - Run them separately from unit tests
   - Use `--watchAll=false` for CI/CD

## CI/CD Integration

For continuous integration, ensure:
1. Docker services are available
2. Test database is initialized
3. Server is running before tests
4. Tests clean up after themselves

Example CI script:
```bash
# Start services
docker compose up -d postgres
cd server && npm run dev &

# Wait for server
sleep 10

# Run integration tests
npm run test:integration
```

## Next Steps

1. ✅ **API Service Integration Tests** - Complete (16 tests)
2. ⏳ **Component Integration Tests** - Add tests for:
   - LoginRegister component with real API
   - Profile component with real API
   - ProtectedRoute with real authentication
3. ⏳ **Admin Integration Tests** - Test admin functionality
4. ⏳ **E2E Tests** - Full browser-based tests

