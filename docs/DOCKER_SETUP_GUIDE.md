# Docker Compose Setup Guide

This guide explains how to set up and run the React Super App application using Docker Compose with PostgreSQL database and REST API server.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Client     │  │   Server     │  │  PostgreSQL  │  │
│  │  (React)     │  │  (Express)   │  │  (Database)  │  │
│  │  Port 3000   │  │  Port 3001   │  │  Port 5432   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

1. **Docker** (version 20.10 or higher)
   - Install from: https://www.docker.com/get-started
   - Verify installation: `docker --version`

2. **Docker Compose** (usually comes with Docker Desktop)
   - Verify installation: `docker-compose --version`

## 🚀 Quick Start

### 1. Clone/Prepare Repository

Make sure you're in the project root directory:
```bash
cd /Users/sbecker11/workspace-react/react-super-app
```

### 2. Create Environment File

Copy the example environment template:
```bash
cp .env.example .env
```

### 3. Configure Environment Variables

**Important:** Update the following in your `.env` file based on your environment:

- **`NODE_ENV`**: Set to `development` (default), `testing` (for running tests), or `production` (for deployment)
- **`REACT_APP_ENV`**: Set to match `NODE_ENV` for consistency

The `.env.example` file includes all default values:
- Database configuration (PostgreSQL)
- Server and client port configuration
- API URL configuration
- JWT secret (⚠️ change this in production!)

**Default values are fine for development**, but you should:
- Update `NODE_ENV` and `REACT_APP_ENV` to `testing` when running tests
- Update `NODE_ENV` and `REACT_APP_ENV` to `production` for deployment
- Change `JWT_SECRET` to a secure random string in production (use: `openssl rand -base64 32`)

### 4. Start All Services

```bash
docker-compose up --build
```

This will:
- Build Docker images for client, server, and database
- Start PostgreSQL database
- Initialize database schema
- Start Express REST API server
- Start React development server

### 5. Access the Application

- **React Client**: http://localhost:3000
- **REST API Server**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **PostgreSQL**: localhost:5432 (for direct database access)

## 📝 Available Commands

### Start Services

```bash
# Start all services (detached mode)
docker-compose up -d

# Start with build
docker-compose up --build

# Start specific service
docker-compose up server
docker-compose up client
docker-compose up postgres
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs server
docker-compose logs client
docker-compose logs postgres

# Follow logs (like tail -f)
docker-compose logs -f server
```

### Database Access

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U superapp_user -d react_super_app

# Run SQL commands
docker-compose exec postgres psql -U superapp_user -d react_super_app -c "SELECT * FROM users;"
```

### Database Management Commands (npm scripts)

```bash
# Initialize database (starts container + creates schema)
npm run db:init

# Start database container
npm run db:start

# Stop database container
npm run db:stop

# Restart database
npm run db:restart

# Check database status
npm run db:status

# View database logs
npm run db:logs

# Connect to PostgreSQL shell
npm run db:shell
```

**Note:** The `db:init` script automatically checks if Docker Desktop is running and starts it if needed (macOS).

### Rebuild Services

```bash
# Rebuild all services
docker-compose build

# Rebuild specific service
docker-compose build server
docker-compose build client
```

### Test Commands Summary

| Command | Description |
|---------|-------------|
| `npm test` | Run client tests (watch mode) |
| `npm test -- --watchAll=false` | Run client tests once |
| `npm run test:coverage` | Client tests with coverage |
| `cd server && npm test` | Run server tests |
| `cd server && npm test -- --coverage` | Server tests with coverage |
| `cd server && npm test -- middleware/auth.test.js` | Run specific test file |

**Note:** Server API integration tests require PostgreSQL to be running. Start it with `npm run db:init` before running server tests.

## 🗄️ Database Schema

The database is automatically initialized with the following schema:

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Job Descriptions Table (for future use)
```sql
CREATE TABLE job_descriptions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    description TEXT,
    keywords TEXT[],
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🔌 REST API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### POST `/api/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Users (Requires Authentication)

#### GET `/api/users`
Get all users (admin only)

#### GET `/api/users/me`
Get current authenticated user

#### GET `/api/users/:id`
Get user by ID

#### PUT `/api/users/:id`
Update user
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

#### DELETE `/api/users/:id`
Delete user

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
```

## 🔧 Development Workflow

### Making Changes

1. **Client Changes**: Files are mounted as volumes, so changes auto-reload
2. **Server Changes**: Files are mounted as volumes, nodemon auto-restarts
3. **Database Changes**: Restart postgres service or run migrations

### Running Migrations

```bash
# Connect to server container and run migrations
docker-compose exec server npm run migrate
```

### Testing the API

```bash
# Health check
curl http://localhost:3001/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## 🐛 Troubleshooting

### Port Already in Use

If port 3000, 3001, or 5432 is already in use:

1. **Change ports in `.env` file:**
```bash
CLIENT_PORT=3002
SERVER_PORT=3003
POSTGRES_PORT=5433
```

2. **Or stop conflicting services:**
```bash
# Find process using port
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Kill process
kill -9 <PID>
```

### Database Connection Errors

```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Container Won't Start

```bash
# Check logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Data Persistence

Data is stored in a Docker volume `postgres_data`. To reset:

```bash
# ⚠️ WARNING: This deletes all data!
docker-compose down -v
docker-compose up
```

## 📦 Production Deployment

For production:

1. **Update `.env` file:**
   - Change `JWT_SECRET` to a strong random string
   - Update `NODE_ENV=production`
   - Use secure passwords for database
   - Update `CLIENT_URL` to production domain

2. **Build production images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Use production docker-compose file** (create separately with optimized settings)

4. **Set up reverse proxy** (nginx/traefik) for SSL/HTTPS

5. **Backup database regularly:**
   ```bash
   docker-compose exec postgres pg_dump -U superapp_user react_super_app > backup.sql
   ```

## 📚 Additional Resources

- **Quick Commands**: See [`COMMANDS.md`](./COMMANDS.md) for a quick command reference
- **Getting Started**: See [`GETTING_STARTED.md`](./GETTING_STARTED.md) for complete setup guide
- **Troubleshooting**: See [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) for common issues and solutions
- **Testing**: See [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) for comprehensive testing information
- **Storage & Database**: See [`STORAGE_GUIDE.md`](./STORAGE_GUIDE.md) for database schemas and API details

### External Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

## 🎯 Next Steps

1. Integrate React client with REST API
2. Add authentication context to React app
3. Implement protected routes
4. Add job description CRUD operations
5. Add database migrations system
6. Add API request/response logging
7. Add rate limiting
8. Add API documentation (Swagger/OpenAPI)

