# Test Environment Configuration

## Overview
This document describes the test environment configuration for running tests against Docker Compose setup.

## Test Database Setup

### Database Configuration
- **Test Database Name**: `react_super_app_test`
- **Host**: `localhost` (connects to Docker PostgreSQL)
- **Port**: `5432`
- **User**: `superapp_user`
- **Password**: `superapp_password`

### Required Tables
The test database requires the following tables:
1. **users** - User accounts with RBAC support
   - Columns: `id`, `name`, `email`, `password_hash`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`, `created_by`, `updated_by`
2. **user_auth_logs** - Authentication audit trail
   - Columns: `id`, `user_id`, `action`, `ip_address`, `user_agent`, `success`, `failure_reason`, `metadata`, `created_at`, `performed_by`
3. **job_descriptions** - Job description storage

### Setup Script
The test database is automatically created and initialized when running tests. The setup process:
1. Creates `react_super_app_test` database if it doesn't exist
2. Runs `init.sql` to create base schema
3. Adds RBAC columns to `users` table
4. Creates `user_auth_logs` table

## Test Configuration Files

### Jest Configuration (`server/jest.config.js`)
```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  testTimeout: 10000,
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}
```

### Test Setup (`server/src/__tests__/setup.js`)
Sets environment variables for tests:
- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret-key-for-testing-only`
- `JWT_EXPIRES_IN=1h`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_USER=superapp_user`
- `DB_PASSWORD=superapp_password`
- `DB_NAME=react_super_app_test`

## Running Tests

### Prerequisites
1. Docker Compose PostgreSQL service running:
   ```bash
   docker compose up -d postgres
   ```

2. Test database created and initialized:
   ```bash
   # Database is auto-created, but you can verify:
   docker compose exec postgres psql -U superapp_user -d react_super_app_test -c "\dt"
   ```

### Run All Server Tests
```bash
cd server
npm test
```

### Run Tests Once (No Watch Mode)
```bash
cd server
npm test -- --watchAll=false
```

### Run Specific Test File
```bash
cd server
npm test -- api.test.js
npm test -- middleware/auth.test.js
npm test -- database/connection.test.js
```

### Run Tests with Coverage
```bash
cd server
npm test -- --coverage
```

## Test Results Summary

### Current Status
- **Test Suites**: 1 passed, 2 failed (3 total)
- **Tests**: 27 passed, 8 failed (35 total)
- **Pass Rate**: 77%

### Passing Tests
✅ Database connection tests (all passing)  
✅ Most API integration tests (registration, login, user operations)  
✅ Some middleware authentication tests

### Known Issues
1. **8 failing tests** - Mostly related to:
   - Error message format mismatches
   - Authentication token validation edge cases
   - Test cleanup/teardown issues

2. **Test cleanup** - Some tests may leave data in database:
   ```bash
   # Clean test database if needed
   docker compose exec postgres psql -U superapp_user -d react_super_app_test -c "TRUNCATE users, user_auth_logs CASCADE;"
   ```

## Environment Variables

### Test Environment Variables
Tests use environment variables from `setup.js`. You can override them:
```bash
TEST_DB_HOST=localhost \
TEST_DB_PORT=5432 \
TEST_DB_USER=superapp_user \
TEST_DB_PASSWORD=superapp_password \
TEST_DB_NAME=react_super_app_test \
npm test
```

### Docker Environment Variables
Docker services use environment variables from `.env` or `docker-compose.yml`:
- `POSTGRES_USER=superapp_user`
- `POSTGRES_PASSWORD=superapp_password`
- `POSTGRES_DB=react_super_app`
- `SERVER_PORT=3001`
- `JWT_SECRET=your-super-secret-jwt-key-change-in-production`

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Test database connection
docker compose exec postgres psql -U superapp_user -d react_super_app_test -c "SELECT 1;"

# Check database tables
docker compose exec postgres psql -U superapp_user -d react_super_app_test -c "\dt"
```

### Missing Tables
If tests fail with "relation does not exist" errors:
```bash
# Recreate test database schema
docker compose exec -T postgres psql -U superapp_user -d react_super_app_test < server/database/init.sql
docker compose exec -T postgres psql -U superapp_user -d react_super_app_test < server/database/migrations/001_add_rbac_and_core_objects.sql
```

### Test Timeout Issues
If tests timeout, increase timeout in `jest.config.js`:
```javascript
testTimeout: 30000, // 30 seconds
```

### Port Conflicts
If port 5432 is already in use:
```bash
# Check what's using the port
lsof -i :5432

# Use different port in docker-compose.yml
POSTGRES_PORT=5433
```

## Best Practices

1. **Always clean up test data** - Tests should clean up after themselves
2. **Use test database** - Never run tests against production database
3. **Isolate tests** - Each test should be independent
4. **Mock external services** - Don't rely on external APIs in tests
5. **Use transactions** - Consider using database transactions for test isolation

## Future Improvements

1. **Test database migrations** - Automatically run migrations before tests
2. **Test fixtures** - Create reusable test data fixtures
3. **Test isolation** - Use transactions or separate databases per test
4. **Parallel test execution** - Configure Jest for parallel test execution
5. **CI/CD integration** - Set up automated test runs in CI/CD pipeline

