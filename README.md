# React Web Application

A React-based single-page application built with Create React App, featuring routing, authentication forms, and a job description analyzer.

## 📋 Project Overview

This web application includes:
- **Routing**: React Router for navigation between pages
- **Components**: Header, Footer, Sidebar (Left), Home, About, Login/Register
- **Features**: 
  - User authentication form with validation (using Yup)
  - Job Description Analyzer component (in development)
  - Responsive layout with header, sidebar, and footer

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 14.0 or higher recommended)
- **npm** (comes with Node.js) or **yarn**

You can check if you have Node.js installed by running:
```bash
node --version
npm --version
```

### Installation Steps

1. **Navigate to the project directory** (if not already there):
   ```bash
   cd /Users/sbecker11/workspace-react/react-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   
   This will install all required packages including:
   - React & React DOM
   - React Router DOM
   - React Scripts (build tools)
   - Yup (form validation)
   - Testing libraries

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   - The app will automatically open at [http://localhost:3000](http://localhost:3000)
   - The page will reload automatically when you make changes

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.js          # Top navigation header
│   ├── Footer.js          # Footer component
│   ├── Left.js            # Left sidebar navigation
│   ├── Home.js            # Home page component
│   ├── About.js           # About page component
│   ├── LoginRegister.js   # Login/Register form with validation
│   ├── JDAnalyzer.js      # Job Description Analyzer (in development)
│   ├── NotFound.js        # 404 error page
│   ├── ErrorBoundary.js   # Error boundary for React error handling
│   └── Loading.js         # Loading spinner component
├── services/              # API services (currently empty)
├── App.js                 # Main app component with routing
├── App.css                # Main app styles
├── index.js               # Application entry point
└── index.css              # Global styles
```

**💡 Tip:** To view the current project structure in your terminal, run:
```bash
tree -L 3 -I 'node_modules' --dirsfirst
```
This command displays the directory tree structure (up to 3 levels deep), excluding the `node_modules` folder, with directories shown first.

## 🛠️ Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000).  
The page will reload when you make changes.

### `npm test`
Launches the test runner in interactive watch mode.  
See the [testing documentation](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run test:coverage`
Runs all tests and generates a coverage report. The report is displayed in the terminal and saved to the `coverage/` directory. Opens an interactive HTML report showing which parts of your code are covered by tests.

### `npm run build`
Builds the app for production to the `build` folder.  
The build is optimized and minified for best performance. Ready for deployment!

### `npm run eject`
**⚠️ Warning: This is a one-way operation!**  
Ejects from Create React App configuration. You won't be able to go back!

## 🧪 Testing

This project includes comprehensive unit tests for all major components using [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/react).

### Running Tests

**Run all tests in watch mode** (recommended for development):
```bash
npm test
```
This launches the test runner in interactive watch mode. Press `a` to run all tests, or press `p` to filter by a filename pattern.

**Run all tests once** (useful for CI/CD):
```bash
CI=true npm test
```

**Run a specific test file**:
```bash
npm test -- Home.test.js
```

**Run tests matching a pattern**:
```bash
npm test -- --testNamePattern="renders without crashing"
```

### Test Coverage

The project includes comprehensive test coverage tracking. Coverage reports show which parts of your code are covered by tests.

**Generate coverage report**:
```bash
npm run test:coverage
```

This will:
- Run all tests
- Generate a detailed coverage report in the terminal
- Create an HTML coverage report in the `coverage/` directory
- Show coverage percentages for branches, functions, lines, and statements

**Coverage Thresholds**:
The project is configured with minimum coverage thresholds of **70%** for:
- ✅ Branches (conditional logic)
- ✅ Functions (functions called)
- ✅ Lines (lines of code executed)
- ✅ Statements (statements executed)

If coverage falls below these thresholds, the test run will fail. This helps maintain code quality.

**View HTML Coverage Report**:
After running coverage, open `coverage/lcov-report/index.html` in your browser to see a detailed, interactive coverage report.

**What's Included in Coverage**:
- All `.js` and `.jsx` files in the `src/` directory
- Excludes: `index.js`, `reportWebVitals.js`, test files, and mock files

**Improving Coverage**:
- Write tests for components with low coverage
- Test edge cases and error conditions
- Test user interactions and state changes
- Aim for 80%+ coverage for critical business logic

### Test Structure

Tests are located alongside the components they test, using the `.test.js` extension:
```
src/
├── App.test.js
└── components/
    ├── About.test.js
    ├── Footer.test.js
    ├── Header.test.js
    ├── Home.test.js
    ├── JDAnalyzer.test.js
    ├── Left.test.js
    └── LoginRegister.test.js
```

### What's Tested

- ✅ **App Component**: Routing, navigation, component rendering
- ✅ **Header Component**: Link rendering, click handlers
- ✅ **Left Component**: Sidebar navigation, click handlers
- ✅ **Footer Component**: Copyright year display
- ✅ **Home Component**: Content rendering
- ✅ **About Component**: State management, localStorage integration, counter functionality
- ✅ **LoginRegister Component**: Form validation, input handling, error messages
- ✅ **JDAnalyzer Component**: Form fields, input handling, form submission
- ✅ **NotFound Component**: 404 error page with navigation
- ✅ **ErrorBoundary Component**: React error catching and display
- ✅ **Loading Component**: Loading spinner with multiple size options

### Writing New Tests

When adding new components, create corresponding test files following this pattern:

```javascript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
  it('renders without crashing', () => {
    render(<Router><YourComponent /></Router>);
  });

  it('displays expected content', () => {
    render(<Router><YourComponent /></Router>);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Test Best Practices

1. **Test user interactions**, not implementation details
2. **Use descriptive test names** that explain what is being tested
3. **Keep tests focused** - one concept per test
4. **Clean up** - use `beforeEach` and `afterEach` to reset state
5. **Test accessibility** - use queries that resemble how users interact with your app

### Common Test Patterns

**Testing user input:**
```javascript
const input = screen.getByLabelText(/email/i);
fireEvent.change(input, { target: { value: 'test@example.com' } });
expect(input).toHaveValue('test@example.com');
```

**Testing button clicks:**
```javascript
const button = screen.getByText('Submit');
fireEvent.click(button);
expect(mockFunction).toHaveBeenCalled();
```

**Testing async operations:**
```javascript
await waitFor(() => {
  expect(screen.getByText('Loading complete')).toBeInTheDocument();
});
```

### Troubleshooting Tests

**Issue: Tests fail with "Cannot find module"**
- Make sure all dependencies are installed: `npm install`

**Issue: Tests fail after adding new dependencies**
- Clear Jest cache: `npm test -- --clearCache`

**Issue: localStorage not working in tests**
- Mock localStorage or use `beforeEach` to clear it:
```javascript
beforeEach(() => {
  localStorage.clear();
});
```

**Issue: Seeing deprecation warnings during tests**
All deprecation warnings have been suppressed through configuration:

**Suppressed warnings:**
- ✅ **Node.js `punycode` deprecation warnings**: Suppressed via `NODE_OPTIONS='--no-deprecation'` in the test script (`package.json`)
- ✅ **`ReactDOMTestUtils.act` deprecated**: Suppressed in `setupTests.js` - this warning came from React Testing Library's internal code
- ✅ **React Router Future Flag Warnings**: Suppressed via future flags configured in both the main app (`App.js`) and test utilities (`test-utils.js`)

Your tests should run without deprecation warnings. If you see any warnings, they are from dependencies and don't indicate problems with your code.

### Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🔍 Current Routes

The application has the following routes:
- `/` or `/home` - Home page
- `/about` - About page
- `/login-register` - Login/Register form
- `/jd-analyzer` - Job Description Analyzer
- `*` (any other path) - 404 Not Found page

## 📝 Key Features

### Login/Register Form
- Form validation using Yup schema
- Email validation
- Password requirements:
  - At least 8 characters
  - Must contain an uppercase letter
  - Must contain a number
  - Must contain a special character (!@#$%^&*)
- Error messages displayed inline

### Navigation
- Header navigation links
- Sidebar navigation
- React Router for client-side routing

### Error Handling
- **Error Boundary**: Catches React errors and displays a user-friendly error page
- **404 Page**: Displays when users navigate to invalid routes
- Graceful error recovery with "Try Again" functionality

### Loading States
- **Loading Component**: Reusable loading spinner with customizable size and messages
- Supports inline and full-screen loading states
- Can be integrated into forms and async operations

## ⚠️ Known Issues / TODO

For a comprehensive list of missing features and improvements needed for production readiness, see:

👉 **[MISSING_FEATURES.md](./MISSING_FEATURES.md)**

### Quick Summary:

1. **JDAnalyzer Component**: Basic form implemented, but analysis functionality needs to be added
   - Form structure is complete with all fields
   - Word analysis and JD comparison features to be implemented
   - Missing route in App.js (component exists but not accessible)

2. **Services Folder**: Empty - API integration needed for backend services

3. **Authentication**: Login/Register form currently only validates client-side, no backend integration

4. **Error Handling**: Missing error boundaries and 404 page

5. **User Feedback**: Missing loading states, success messages, and toast notifications

## 🔧 Troubleshooting

### Issue: `npm start` fails with errors
**Solution**: Make sure you've run `npm install` first to install all dependencies.

### Issue: Port 3000 is already in use
**Solution**: You can specify a different port:
```bash
PORT=3001 npm start
```

### Issue: Dependencies out of sync
**Solution**: Delete `node_modules` and `package-lock.json`, then reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🆕 How to Create a React App from Scratch

For detailed instructions on creating a new React application from scratch using different methods (Create React App, Vite, Next.js, or manual setup), please see the comprehensive guide:

👉 **[CREATE-REACT-APP-GUIDE.md](./CREATE-REACT-APP-GUIDE.md)**

This guide includes:
- Step-by-step instructions for all methods
- Comparison tables and recommendations
- Prerequisites and troubleshooting tips
- Next steps after creating an app

---

## 📚 Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Yup Validation Documentation](https://github.com/jquense/yup)
- [Vite Documentation](https://vitejs.dev/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📄 License

This project is private.

---

**Note**: Fixed `react-scripts` version issue (was set to 0.0.0, now set to 5.0.1) and removed duplicate/invalid package entry.
