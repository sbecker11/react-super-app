# 🚀 Quick Command Reference

Quick reference guide for starting, testing, and running all components of the JD Analyzer application.

For detailed explanations, troubleshooting, and more commands, see the [Documentation](#-more-information) section below.

---

## 1. 📦 Start All Components

### Start Everything (Recommended)
```bash
npm run start:services          # Checks ports first, then starts
npm run start:services:detached # Checks ports, starts in background
# OR
docker-compose up --build       # Direct docker-compose (no port check)
```

**Port Checking:** The `start:services` commands automatically check all ports (3000, 3001, 5432) before starting. If a port is in use, you'll be prompted to:
1. Kill the process using the port
2. Skip and continue (may cause errors)
3. Exit and free the port manually

You can also check ports manually:
```bash
npm run check-ports
```

**Access:**
- 🌐 React Client: http://localhost:3000
- 🔌 API Server: http://localhost:3001
- ❤️ Health: http://localhost:3001/health
- 🗄️ PostgreSQL: localhost:5432

**Stop:** `docker-compose down`

### Database Only (for Testing)
```bash
npm run db:init
```
**Note:** This also checks the PostgreSQL port and prompts to kill conflicting processes if needed.

### Start in Background
```bash
docker-compose up -d --build
```
View logs: `docker-compose logs -f [service-name]`

---

## 2. 🧪 Test All Components

### Client Tests
```bash
npm test                          # Watch mode
npm test -- --watchAll=false     # Run once
npm run test:coverage            # With coverage
```

### Server Tests
```bash
# Start database first
npm run db:init

# Run tests
cd server && npm test
cd server && npm test -- --coverage
```

### All Tests
```bash
npm test -- --watchAll=false && cd server && npm test
```

---

## 3. 🎮 Start App for Interactive Usage

### Full Stack (Docker)
```bash
docker-compose up --build
```
Open http://localhost:3000 in your browser.

### Development Mode (Local)
See [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md) for multi-terminal setup.

---

## 📚 More Information

- **Getting Started**: [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md) - Complete setup guide, verification steps, development mode
- **Testing Guide**: [`docs/TESTING_GUIDE.md`](docs/TESTING_GUIDE.md) - Comprehensive testing documentation
- **Docker Setup**: [`docs/DOCKER_SETUP_GUIDE.md`](docs/DOCKER_SETUP_GUIDE.md) - All Docker commands, database commands, API endpoints
- **Troubleshooting**: [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) - Common issues and solutions
- **Storage/Database**: [`docs/STORAGE_GUIDE.md`](docs/STORAGE_GUIDE.md) - Database setup and schemas
