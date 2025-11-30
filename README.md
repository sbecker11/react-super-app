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

## 📊 Project Status

**Architecture**: Full-stack React application with Express.js REST API and PostgreSQL database

**Current Status**:
- ✅ **Client**: React app with routing, forms, validation, and UI components
- ✅ **Server**: Express.js REST API with authentication endpoints
- ✅ **Database**: PostgreSQL with Docker Compose setup
- ✅ **Testing**: 96+ tests with 98% statement coverage
- 🔄 **Integration**: Backend ready, client-backend integration in progress

**Completion Rate**: ~31% (10 completed / 32 total features tracked)

**Next Steps** (High Priority):
1. Connect LoginRegister form to backend API
2. Implement Authentication Context for state management
3. Create protected routes

📖 **See [Features Summary](./docs/FEATURES_SUMMARY.md) for complete feature status and roadmap**

## 🚀 Getting Started

**Quick Start:**

1. Copy the environment template: `cp .env.example .env`
2. (Optional) Update `NODE_ENV` and `REACT_APP_ENV` in `.env` if needed
3. Start all services:
```bash
docker-compose up --build
```

Access at: [http://localhost:3000](http://localhost:3000) (Client) | [http://localhost:3001](http://localhost:3001) (API)

📖 **For complete setup instructions, prerequisites, troubleshooting, and alternative local development options, see [Getting Started Guide](./docs/GETTING_STARTED.md)**

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

**Quick Commands:**
```bash
npm test                    # Run tests in watch mode
npm run test:coverage       # Generate coverage report
```

**Test Status**: 96+ tests with 98% statement coverage

📖 **For comprehensive testing documentation including test structure, coverage analysis, best practices, troubleshooting, and server-side tests, see [Testing Guide](./docs/TESTING_GUIDE.md)**

## 🔍 Current Routes

The application has the following routes:
- `/` or `/home` - Home page
- `/about` - About page
- `/login-register` - Login/Register form
- `/jd-analyzer` - Job Description Analyzer
- `*` (any other path) - 404 Not Found page

## 📝 Key Features

- **Form Validation**: Yup-based validation with real-time feedback and enhanced error messages
- **Routing**: React Router with multiple routes including 404 handling
- **Error Handling**: Error boundaries for graceful error recovery
- **Loading States**: Reusable loading spinner component
- **Authentication Forms**: Login/Register with comprehensive validation

📖 **For detailed validation rules, error handling, and UI feedback patterns, see [Validation Guide](./docs/VALIDATION_GUIDE.md)**

## ⚠️ Known Issues / TODO

For a comprehensive overview of feature status (completed, in progress, and planned), see:

👉 **[Features Summary](./docs/FEATURES_SUMMARY.md)**

**Quick Summary:**
- Backend API ready; client integration needed
- Authentication Context implementation pending
- Protected routes need to be created
- Toast notification system needed for API feedback
- JDAnalyzer core functionality pending

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

## 📚 Documentation

This project includes comprehensive documentation covering all aspects of development, deployment, testing, and more. All documentation files are located in the [`docs/`](./docs/) directory.

### 🚀 Getting Started & Setup

- **[Getting Started Guide](./docs/GETTING_STARTED.md)** - Quick start guide to get the application up and running with Docker Compose, PostgreSQL, and REST API
- **[Create React App Guide](./docs/CREATE-REACT-APP-GUIDE.md)** - Detailed instructions for creating a new React application from scratch using different methods (Create React App, Vite, Next.js, or manual setup)

### 🐳 Docker & Deployment

- **[Docker Setup Guide](./docs/DOCKER_SETUP_GUIDE.md)** - Comprehensive guide for setting up and running the application using Docker Compose
- **[Docker Compose Summary](./docs/DOCKER_COMPOSE_SUMMARY.md)** - Quick reference for the Docker Compose setup and services

### 💾 Storage & Persistence

- **[Storage Guide](./docs/STORAGE_GUIDE.md)** - Complete guide covering PostgreSQL database setup, schemas, REST API schemas, and client-side session storage

### 🧪 Testing

- **[Testing Guide](./docs/TESTING_GUIDE.md)** - Comprehensive testing documentation including client-side tests, server-side tests, coverage analysis, and best practices

### ✅ Validation

- **[Validation Guide](./docs/VALIDATION_GUIDE.md)** - Complete guide to form validation including Yup implementation, error handling, UI feedback, and centralized configuration

### 📋 Project Planning

- **[Features Summary](./docs/FEATURES_SUMMARY.md)** - Comprehensive overview of feature status including completed features, in-progress items, and planned improvements, organized by priority

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
