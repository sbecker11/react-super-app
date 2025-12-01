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

### Prerequisites

Before you begin, ensure you have the following installed and running:

- **Docker Desktop** (version 20.10 or higher) - [Download here](https://www.docker.com/get-started)
  - **Must be running** before starting services
  - On macOS, our scripts can auto-start Docker Desktop for you
  - Verify Docker is running: `docker info`
  - Verify versions: `docker --version` and `docker-compose --version`
- **Git** - For cloning the repository
- **Ports Available**: Ensure ports 3000 (client), 3001 (server), and 5432 (database) are not in use

**Quick Port Check:**
```bash
# After cloning, run this to verify ports are available
npm run check-ports
```

### Quick Start

**Step 1: Clone the repository**
```bash
git clone https://github.com/sbecker11/react-super-app.git
cd react-super-app
```

**Step 2: Configure environment**
```bash
# Copy the environment template
cp .env.example .env

# (Optional) Edit .env to customize settings
# See Environment Variables section below for available options
```

**Step 3: Initialize the database**
```bash
# This script will:
# - Check/start Docker Desktop (auto-start on macOS)
# - Start PostgreSQL container
# - Create database and schema
npm run db:init
```

**Step 4: Start all services**
```bash
# Start client, server, and database
docker-compose up --build

# Or use our helper script with port checking:
npm run start:services

# Or run in background (detached mode):
npm run start:services:detached
```

**Step 5: Access the application**
- **Client**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)
- **API Health**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

**🎉 That's it!** The application is now running with all services.

📖 **For complete setup instructions, prerequisites, troubleshooting, and alternative local development options, see [Getting Started Guide](./docs/GETTING_STARTED.md)**

---

## 🔧 Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and customize as needed.

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `superapp_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `superapp_password` | PostgreSQL password |
| `POSTGRES_DB` | `react_super_app` | Database name |
| `POSTGRES_PORT` | `5432` | PostgreSQL port |

### Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `3001` | Express server port |
| `NODE_ENV` | `development` | Node environment (`development`, `production`, `test`) |
| `JWT_SECRET` | `your-super-secret-jwt-key-change-in-production` | **⚠️ CHANGE IN PRODUCTION!** JWT signing key |
| `JWT_EXPIRES_IN` | `24h` | JWT token expiration time |

### Client Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `CLIENT_PORT` | `3000` | React app port |
| `REACT_APP_API_URL` | `http://localhost:3001/api` | Backend API URL |
| `REACT_APP_ENV` | `development` | Client environment |

### Example `.env` File

```bash
# Database
POSTGRES_USER=superapp_user
POSTGRES_PASSWORD=superapp_password
POSTGRES_DB=react_super_app
POSTGRES_PORT=5432

# Server
SERVER_PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Client
CLIENT_PORT=3000
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_ENV=development
```

**🔒 Security Note**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

**💾 Data Persistence**: Database data persists in a Docker volume between restarts. To reset the database completely:
```bash
docker-compose down -v  # Removes volumes
npm run db:init         # Reinitialize database
```

---

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

### Client Development Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start** | `npm start` | Run React app in development mode at [http://localhost:3000](http://localhost:3000) |
| **Test** | `npm test` | Launch test runner in interactive watch mode |
| **Coverage** | `npm run test:coverage` | Run all tests and generate coverage report |
| **Build** | `npm run build` | Build optimized production bundle to `build/` folder |
| **Eject** | `npm run eject` | ⚠️ **One-way operation!** Eject from Create React App |

### Docker & Service Management

| Script | Command | Description |
|--------|---------|-------------|
| **Check Ports** | `npm run check-ports` | Verify ports 3000, 3001, 5432 are available |
| **Start Services** | `npm run start:services` | Start all Docker services with port checking |
| **Start Detached** | `npm run start:services:detached` | Start services in background (detached mode) |

### Database Management Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Initialize DB** | `npm run db:init` | 🚀 **Full database setup** - checks Docker, creates DB, runs schema |
| **Start DB** | `npm run db:start` | Start PostgreSQL container only |
| **Stop DB** | `npm run db:stop` | Stop PostgreSQL container |
| **Restart DB** | `npm run db:restart` | Restart PostgreSQL container |
| **DB Status** | `npm run db:status` | Check PostgreSQL container status |
| **DB Logs** | `npm run db:logs` | View PostgreSQL logs (follow mode) |
| **DB Shell** | `npm run db:shell` | Open PostgreSQL interactive shell |

### Common Workflows

**First-time setup:**
```bash
npm run db:init              # Initialize database
docker-compose up --build    # Start all services
```

**Daily development:**
```bash
npm run start:services:detached  # Start in background
npm start                        # Start client (if not using Docker)
```

**Troubleshooting:**
```bash
npm run check-ports          # Check for port conflicts
npm run db:logs              # View database logs
npm run db:status            # Check database status
docker-compose down -v       # Reset everything (removes data!)
npm run db:init              # Reinitialize
```

**Testing:**
```bash
npm test                     # Run tests in watch mode
npm run test:coverage        # Generate coverage report
```

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
- `/analyzer` - Job Description Analyzer
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
- **[Manual Setup Guide](./docs/MANUAL_SETUP.md)** - Step-by-step manual commands for setup and troubleshooting

### ✅ Validation

- **[Validation Guide](./docs/VALIDATION_GUIDE.md)** - Complete guide to form validation including Yup implementation, error handling, UI feedback, and centralized configuration

### 📋 Project Planning

- **[Features Summary](./docs/FEATURES_SUMMARY.md)** - Comprehensive overview of feature status including completed features, in-progress items, and planned improvements, organized by priority

### 🔑 Credentials & Security

- **[Credentials Reference](./CREDENTIALS.md)** - Quick access to all default credentials (PostgreSQL, Application Admin)
- **[Database Isolation](./docs/DATABASE_ISOLATION.md)** - How the app uses its own isolated database

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
