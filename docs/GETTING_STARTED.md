# 🚀 Getting Started Guide

This guide will help you get your React Super App application up and running with Docker Compose, PostgreSQL, and REST API in just a few minutes!

## 📋 Prerequisites

- **Docker** (version 20.10 or higher) - [Install Docker](https://www.docker.com/get-started)
- **Docker Compose** (usually comes with Docker Desktop)
- **Git** (if cloning the repository)

Verify installations:
```bash
docker --version
docker-compose --version
```

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/sbecker11/react-super-app.git
cd react-super-app
```

### Step 2: Create Environment File

Create your `.env` file by copying the example template:

```bash
cp .env.example .env
```

**Important:** Update the following variables in your `.env` file based on your needs:

- **`NODE_ENV`**: Set to `development` for local development, `testing` when running tests, or `production` for deployment
- **`REACT_APP_ENV`**: Set to match `NODE_ENV` for consistency (options: `development`, `testing`, `production`)

The `.env.example` file contains all default configuration:
- Database configuration (PostgreSQL)
- Server and client port configuration
- API URL configuration
- JWT secret (⚠️ change this in production!)

**Location**: `.env` in project root

**Note**: The `.env` file is in `.gitignore` and won't be committed to Git. The `.env.example` file is version-controlled and serves as a template.

### Step 3: Start All Services

**Option A: Start Everything (Recommended)**
```bash
docker-compose up --build
```

**Option B: Start Database Only (for testing)**
```bash
npm run db:init
```

**What happens:**
- ✅ Builds Docker images for all services (first time only)
- ✅ Starts PostgreSQL database container
- ✅ Initializes database schema automatically
- ✅ Starts Express REST API server (port 3001) - Option A only
- ✅ Starts React development client (port 3000) - Option A only

**Note**: Use `npm run db:init` if you only need the database for running server tests. This script ensures the database is properly initialized with all tables and indexes.

**Expected output:**
```
postgres_1  | database system is ready to accept connections
server_1    | 🚀 Server running on port 3001
client_1    | Compiled successfully!
client_1    | webpack compiled successfully
```

**First run:** Takes 2-5 minutes (building images and installing dependencies)  
**Subsequent runs:** Takes 30-60 seconds (containers start quickly)

### Step 4: Verify Everything is Running

**Check services:**
```bash
# In a new terminal, check container status
docker-compose ps

# View logs
docker-compose logs server
docker-compose logs client
docker-compose logs postgres
```

**Test the API:**

```bash
# Health check - should return: {"status":"ok","message":"Server is running"}
curl http://localhost:3001/health

# Register a new user - save the token from response!
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Login - should return token and user info
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Access the application:**
- 🌐 **React Client**: http://localhost:3000
- 🔌 **API Server**: http://localhost:3001
- ❤️ **Health Check**: http://localhost:3001/health
- 🗄️ **PostgreSQL**: localhost:5432 (for direct database access)

---

## ✅ Success Checklist

After starting Docker Compose, verify everything is working:

### 1. Check Containers Are Running
```bash
docker-compose ps
```
**Expected:** All containers show "Up" status

### 2. Test API Health Endpoint
```bash
curl http://localhost:3001/health
```
**Expected result:**
```json
{"status":"ok","message":"Server is running"}
```

### 3. Test API Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"TestPass123!"}'
```
**Expected result:** Returns token and user data

### 4. Open Browser to React App
```bash
open http://localhost:3000  # macOS
# OR
xdg-open http://localhost:3000  # Linux
```
**Expected:** React app loads in browser

### Verification Checklist
- [ ] PostgreSQL container is running
- [ ] Server responds to `/health` endpoint
- [ ] You can register a user via API (returns token)
- [ ] You can login via API (returns token)
- [ ] React app loads at http://localhost:3000
- [ ] No errors in Docker Compose logs

---

## 💻 Development Mode (Local, No Docker)

If you prefer to run client and server locally (outside Docker) for faster development:

### Setup

#### Terminal 1: Start Database
```bash
npm run db:init
```

#### Terminal 2: Start Server
```bash
cd server
npm install  # First time only
npm run dev
```
Server runs on http://localhost:3001

#### Terminal 3: Start React Client
```bash
npm install  # First time only
npm start
```
Client runs on http://localhost:3000 (opens automatically)

### Advantages of Local Development
- **Faster hot reload** - Changes reflect immediately
- **Easier debugging** - Direct access to console logs
- **Better IDE integration** - Breakpoints and debugging tools work better
- **No Docker overhead** - Faster startup and less resource usage

### Notes
- Database still runs in Docker (via `npm run db:init`)
- Environment variables from `.env` are still used
- API URL should be configured in `.env` as `REACT_APP_API_URL=http://localhost:3001/api`

---

## 🎯 Next Steps

Once everything is running:

### 1. **Integrate React Client with API**
   - Update `LoginRegister` component to use the API service
   - Connect form submission to `/api/auth/register` and `/api/auth/login`
   - Store JWT token in localStorage

### 2. **Add Authentication Context**
   - Create `AuthContext` to share user state across components
   - Wrap app with `AuthProvider`
   - Implement login/logout functionality

### 3. **Create Protected Routes**
   - Add `ProtectedRoute` component
   - Protect routes that require authentication
   - Redirect unauthenticated users to login

### 4. **Test the Full Flow**
   - Register new user through UI
   - Login through UI
   - Access protected pages
   - Update user profile

---

## 📚 Available Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: `react_super_app`
- **User**: `superapp_user`
- **Password**: `superapp_password`
- **Schema**: Auto-initialized from `server/database/init.sql`

### Express REST API Server
- **Port**: 3001
- **Base URL**: http://localhost:3001
- **API Base**: http://localhost:3001/api
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /api/auth/register` - Register user
  - `POST /api/auth/login` - Login user
  - `GET /api/users` - Get all users (requires auth)
  - `GET /api/users/me` - Get current user (requires auth)
  - `GET /api/users/:id` - Get user by ID (requires auth)
  - `PUT /api/users/:id` - Update user (requires auth)
  - `DELETE /api/users/:id` - Delete user (requires auth)

### React Client
- **Port**: 3000
- **URL**: http://localhost:3000
- **Hot Reload**: Enabled (auto-reloads on file changes)

---

## 🔧 Useful Commands

### Docker Compose Commands

```bash
# Start all services
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Rebuild and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs server
docker-compose logs client
docker-compose logs postgres

# Follow logs (like tail -f)
docker-compose logs -f server

# Restart a specific service
docker-compose restart server
docker-compose restart client
docker-compose restart postgres

# Check service status
docker-compose ps
```

### Database Commands

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U superapp_user -d react_super_app

# Run SQL query
docker-compose exec postgres psql -U superapp_user -d react_super_app -c "SELECT * FROM users;"

# Backup database
docker-compose exec postgres pg_dump -U superapp_user react_super_app > backup.sql

# Restore database
docker-compose exec -T postgres psql -U superapp_user react_super_app < backup.sql
```

### Testing Commands

```bash
# Run client tests
npm test

# Run server tests (from server directory)
cd server && npm test

# Run server middleware tests (no database needed)
cd server && npm test -- --testPathPattern="middleware"
```

---

## 🐛 Troubleshooting

For comprehensive troubleshooting information, see [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md).

### Quick Fixes

### Port Already in Use

**Error**: `Error: bind: address already in use`

**Solutions:**

1. **Change ports in `.env` file:**
   ```env
   CLIENT_PORT=3002
   SERVER_PORT=3003
   POSTGRES_PORT=5433
   ```

2. **Find and stop the process using the port:**
   ```bash
   # Find process
   lsof -i :3000  # React client
   lsof -i :3001  # API server
   lsof -i :5432  # PostgreSQL
   
   # Kill process (replace PID with actual process ID)
   kill -9 <PID>
   ```

### Docker Container Won't Start

**Check logs:**
```bash
docker-compose logs <service-name>
```

**Rebuild containers:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Connection Errors

**Check if PostgreSQL is running:**
```bash
docker-compose ps postgres
```

**View database logs:**
```bash
docker-compose logs postgres
```

**Restart database:**
```bash
docker-compose restart postgres
```

**Reinitialize database:**
```bash
# ⚠️ WARNING: This deletes all data!
docker-compose down -v
docker-compose up postgres
```

### "Cannot find module" Errors

**For server:**
```bash
cd server
npm install
docker-compose restart server
```

**For client:**
```bash
npm install
docker-compose restart client
```

### React App Shows "Cannot GET /"

**Solution**: This is normal! React Router handles client-side routing. The server should serve the React app on all routes in production. In development, this is handled by `react-scripts`.

### API Requests Return 404

**Check:**
1. Server container is running: `docker-compose ps server`
2. Server logs show no errors: `docker-compose logs server`
3. API URL is correct: `http://localhost:3001/api`
4. Check `.env` file has correct `REACT_APP_API_URL`

---

## 🔒 Security Notes

**⚠️ Important for Production:**

1. **Change JWT_SECRET** - Use a strong, random secret:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

2. **Change Database Passwords** - Use strong passwords in production

3. **Use HTTPS** - Enable SSL/TLS in production

4. **Environment Variables** - Never commit `.env` file to Git (already in `.gitignore`)

5. **Database Security** - Restrict database access in production

---

## 📖 Additional Documentation

- **Quick Commands**: See [`COMMANDS.md`](./COMMANDS.md) for a quick command reference
- **Docker Setup**: See [`DOCKER_SETUP_GUIDE.md`](./DOCKER_SETUP_GUIDE.md) for detailed Docker information
- **Troubleshooting**: See [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) for common issues and solutions
- **API Documentation**: See [`../server/README.md`](../server/README.md) for API details
- **Testing**: See [`TESTING_GUIDE.md`](./TESTING_GUIDE.md) for comprehensive testing information
- **Storage & Persistence**: See [`STORAGE_GUIDE.md`](./STORAGE_GUIDE.md) for database, API, and authentication storage details

---

## 🎉 You're Ready!

You now have:
- ✅ PostgreSQL database running
- ✅ Express REST API server running
- ✅ React client application running
- ✅ Complete development environment

**Next**: Start integrating the React client with the API, or explore the API endpoints!

---

## 💡 Quick Reference

```bash
# Start everything
docker-compose up --build

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Test API
curl http://localhost:3001/health

# Access app
# Client: http://localhost:3000
# API: http://localhost:3001
```

**Happy coding! 🚀**
