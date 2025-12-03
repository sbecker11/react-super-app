# 🧪 End-to-End Testing Guide

This guide covers both **manual** and **automated** end-to-end testing for the React Super App.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Manual E2E Testing](#manual-e2e-testing)
3. [Automated E2E Testing](#automated-e2e-testing)
4. [Cypress Setup](#cypress-setup)
5. [Playwright Setup](#playwright-setup)
6. [Best Practices](#best-practices)

---

## 🚀 Quick Start

### Manual E2E Testing (Current Setup)

```bash
# One command to start everything
npm run test:e2e
```

This will:
- ✅ Start Docker services (PostgreSQL)
- ✅ Run database migrations
- ✅ Start backend server (port 3001)
- ✅ Start frontend client (port 3000)
- ✅ Open browser to http://localhost:3000

Then manually test the application following the steps in `docs/E2E_TESTING_FLOW.md`.

---

## 📝 Manual E2E Testing

### Current Setup

Your project already has a manual E2E testing script that sets up the entire environment.

### Running Manual Tests

```bash
# Start all services and open browser
npm run test:e2e
```

### Manual Test Flow

Follow the 9-step testing flow documented in `docs/E2E_TESTING_FLOW.md`:

1. **Register User** → 2. **Logout** → 3. **Login** → 4. **Logout** → 
5. **Admin Login** → 6. **List Users** → 7. **Update Password** → 
8. **Admin Logout** → 9. **Login with New Password**

### Stop Services

```bash
npm run stop:services
```

---

## 🤖 Automated E2E Testing

For automated E2E testing, you need a browser automation tool. The two most popular options are:

### Option 1: Cypress (Recommended for React)
- ✅ Great developer experience
- ✅ Built-in test runner with GUI
- ✅ Excellent debugging tools
- ✅ Good documentation
- ✅ Works well with React

### Option 2: Playwright
- ✅ Faster execution
- ✅ Multi-browser support (Chrome, Firefox, Safari)
- ✅ Better for CI/CD
- ✅ More modern API

---

## 🎯 Cypress Setup

### Installation

```bash
# Install Cypress as dev dependency
npm install --save-dev cypress

# Or use yarn
yarn add -D cypress
```

### Initial Setup

```bash
# Open Cypress for first-time setup
npx cypress open
```

This will:
- Create `cypress/` directory
- Create example tests
- Open Cypress Test Runner

### Project Structure

After setup, your project will have:

```
react-super-app/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js
│   │   ├── register.cy.js
│   │   ├── admin.cy.js
│   │   └── user-flow.cy.js
│   ├── fixtures/
│   │   └── users.json
│   ├── support/
│   │   ├── commands.js
│   │   └── e2e.js
│   └── cypress.config.js
```

### Configuration

Create `cypress.config.js`:

```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
  },
  env: {
    API_URL: 'http://localhost:3001/api',
    ADMIN_EMAIL: 'admin@react-super-app.local',
    ADMIN_PASSWORD: 'Admin123!',
  },
});
```

### Example Test: User Registration

Create `cypress/e2e/register.cy.js`:

```javascript
describe('User Registration', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/');
    
    // Click Login/Register link
    cy.contains('Login/Register').click();
    
    // Switch to Register tab
    cy.contains('Register').click();
  });

  it('should register a new user successfully', () => {
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    
    // Fill registration form
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('Test123!@#');
    
    // Submit form
    cy.contains('button', 'Register').click();
    
    // Verify success
    cy.contains('Welcome, Test User').should('be.visible');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verify user is logged in
    cy.contains('Profile').should('be.visible');
    cy.contains('Admin').should('not.exist'); // Regular user shouldn't see Admin
  });

  it('should show validation errors for invalid input', () => {
    // Try to submit empty form
    cy.contains('button', 'Register').click();
    
    // Verify validation errors
    cy.contains('Name is required').should('be.visible');
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should reject duplicate email', () => {
    // Register first user
    cy.get('input[name="name"]').type('First User');
    cy.get('input[name="email"]').type('duplicate@example.com');
    cy.get('input[name="password"]').type('Test123!@#');
    cy.contains('button', 'Register').click();
    cy.contains('Welcome').should('be.visible');
    
    // Logout
    cy.contains('Profile').click();
    cy.contains('Logout').click();
    
    // Try to register with same email
    cy.contains('Login/Register').click();
    cy.contains('Register').click();
    cy.get('input[name="name"]').type('Second User');
    cy.get('input[name="email"]').type('duplicate@example.com');
    cy.get('input[name="password"]').type('Test123!@#');
    cy.contains('button', 'Register').click();
    
    // Verify error
    cy.contains('already exists').should('be.visible');
  });
});
```

### Example Test: Admin Flow

Create `cypress/e2e/admin.cy.js`:

```javascript
describe('Admin Functionality', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/');
    cy.contains('Login/Register').click();
    cy.get('input[name="email"]').type(Cypress.env('ADMIN_EMAIL'));
    cy.get('input[name="password"]').type(Cypress.env('ADMIN_PASSWORD'));
    cy.contains('button', 'Login').click();
    cy.contains('Welcome back').should('be.visible');
  });

  it('should show Admin link for admin users', () => {
    cy.contains('Admin').should('be.visible');
    cy.contains('Admin').should('have.css', 'color', 'rgb(255, 193, 7)'); // Gold color
  });

  it('should list all users in User Management', () => {
    // Navigate to Admin Dashboard
    cy.contains('Admin').click();
    
    // Click User Management
    cy.contains('User Management').click();
    
    // Verify page loaded
    cy.contains('User Management').should('be.visible');
    
    // Verify table exists
    cy.get('table').should('exist');
    
    // Verify admin user is listed
    cy.contains('admin@react-super-app.local').should('be.visible');
    cy.contains('admin').should('be.visible');
  });

  it('should allow admin to reset user password', () => {
    // Navigate to User Management
    cy.contains('Admin').click();
    cy.contains('User Management').click();
    
    // Find and click edit button for a user
    cy.get('table').contains('tr', 'test@example.com').within(() => {
      cy.get('button').contains('✏️').click();
    });
    
    // Fill password reset form
    cy.contains('Reset Password').scrollIntoView();
    cy.get('input[type="password"]').first().type('NewPassword123!@#');
    cy.get('input[type="password"]').last().type('NewPassword123!@#');
    
    // Save changes
    cy.contains('Save Changes').click();
    
    // Authenticate as admin
    cy.get('input[type="password"]').type(Cypress.env('ADMIN_PASSWORD'));
    cy.contains('Authenticate').click();
    
    // Verify success
    cy.contains('Password reset successfully').should('be.visible');
  });
});
```

### Custom Commands

Create `cypress/support/commands.js`:

```javascript
// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.contains('Login/Register').click();
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.contains('button', 'Login').click();
  cy.contains('Welcome back').should('be.visible');
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.contains('Profile').click();
  cy.contains('Logout').click();
  cy.contains('You have been logged out').should('be.visible');
});

// Custom command to register
Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/');
  cy.contains('Login/Register').click();
  cy.contains('Register').click();
  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.contains('button', 'Register').click();
  cy.contains('Welcome').should('be.visible');
});
```

### Running Cypress Tests

```bash
# Open Cypress Test Runner (interactive)
npx cypress open

# Run tests headlessly (for CI/CD)
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/login.cy.js"

# Run with browser
npx cypress run --browser chrome
```

### Add to package.json

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e:cypress": "npm run start:services:detached && npm run cypress:run"
  }
}
```

---

## 🎭 Playwright Setup

### Installation

```bash
# Install Playwright
npm install --save-dev @playwright/test

# Install browsers
npx playwright install
```

### Configuration

Create `playwright.config.js`:

```javascript
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run start:services:detached && sleep 10',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Example Test

Create `e2e/register.spec.js`:

```javascript
const { test, expect } = require('@playwright/test');

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login/Register');
    await page.click('text=Register');
  });

  test('should register a new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button:has-text("Register")');
    
    await expect(page.locator('text=Welcome, Test User')).toBeVisible();
    await expect(page).toHaveURL('http://localhost:3000/');
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Admin')).not.toBeVisible();
  });
});
```

### Running Playwright Tests

```bash
# Run all tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Run specific test
npx playwright test register.spec.js

# Run in specific browser
npx playwright test --project=chromium
```

---

## 📊 Best Practices

### 1. Test Data Management

- Use unique test data (timestamps, UUIDs)
- Clean up test data after tests
- Use fixtures for reusable data

### 2. Selectors

- Prefer data-testid attributes
- Use semantic selectors (text, role)
- Avoid brittle CSS selectors

### 3. Test Organization

- Group related tests in describe blocks
- Use beforeEach/afterEach for setup/cleanup
- Keep tests independent

### 4. Assertions

- Test user-visible behavior
- Don't test implementation details
- Use meaningful error messages

### 5. CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run start:services:detached
      - run: npx cypress run
        # or
      - run: npx playwright test
```

---

## 🎯 Recommended Approach

For this project, I recommend **Cypress** because:

1. ✅ Better React integration
2. ✅ Excellent debugging tools
3. ✅ Great developer experience
4. ✅ Active community
5. ✅ Good documentation

### Quick Start with Cypress

```bash
# 1. Install Cypress
npm install --save-dev cypress

# 2. Add scripts to package.json
# (see Cypress Setup section above)

# 3. Create first test
npx cypress open

# 4. Write tests in cypress/e2e/

# 5. Run tests
npm run cypress:run
```

---

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🆘 Troubleshooting

### Tests fail because services aren't running

**Solution:** Ensure Docker services are running:
```bash
npm run start:services:detached
```

### Tests are flaky

**Solution:** 
- Add proper waits
- Use data-testid attributes
- Increase timeout if needed

### Browser doesn't open

**Solution:**
- Check if ports 3000/3001 are available
- Verify Docker Desktop is running
- Check firewall settings

---

**Last Updated**: 2024-12-01

