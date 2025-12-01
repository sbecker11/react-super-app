# 🔧 Manual Setup Guide

**Alternative to automated `npm run test:e2e` - Step-by-step manual commands**

Use this guide when you need more control over the setup process or when troubleshooting.

---

## 📋 Table of Contents

1. [Complete Manual Setup](#complete-manual-setup)
2. [Individual Service Management](#individual-service-management)
3. [Troubleshooting Common Issues](#troubleshooting-common-issues)
4. [When to Use Manual Setup](#when-to-use-manual-setup)

---

## 🚀 Complete Manual Setup

### **Step 1: Clean Existing Resources**

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove old images (optional)
docker images | grep -E "react-super-app|react_super_app" | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
```

### **Step 2: Start PostgreSQL**

```bash
# Start only the database service
docker-compose up -d postgres

# Wait for database to be ready
sleep 5

# Verify database is running
docker ps | grep postgres
```

### **Step 3: Run Database Migration**

```bash
# Run the migration to create tables and admin user
npm run db:migrate:001

# Verify migration succeeded
npm run db:shell
\dt  # List tables
SELECT * FROM users WHERE role = 'admin';  # Check admin user
\q
```

### **Step 4: Start Backend Server**

```bash
# Navigate to server directory
cd server

# Install dependencies (if needed)
npm install

# Start server in background
npm start &

# Save the process ID
echo $! > ../.server.pid

# Wait for server to start
sleep 3

# Verify server is running
curl http://localhost:3001/health

# Return to project root
cd ..
```

### **Step 5: Start Frontend Client**

```bash
# Install dependencies (if needed)
npm install

# Start React app (will open browser automatically)
npm start
```

### **Step 6: Open Browser**

```bash
# macOS
open http://localhost:3000

# Linux
xdg-open http://localhost:3000

# Windows (WSL)
explorer.exe http://localhost:3000
```

---

## 🎛️ Individual Service Management

### **Database Only**

```bash
# Start
docker-compose up -d postgres

# Stop
docker-compose stop postgres

# Restart
docker-compose restart postgres

# View logs
docker-compose logs -f postgres

# Connect to shell
npm run db:shell
```

### **Backend Server Only**

```bash
# Start (foreground)
cd server && npm start

# Start (background)
cd server && npm start > ../server.log 2>&1 &

# Stop (if running in background)
kill $(cat .server.pid)

# View logs
tail -f server.log
```

### **Frontend Client Only**

```bash
# Start (foreground)
npm start

# Start (background)
BROWSER=none npm start > client.log 2>&1 &

# Stop (if running in background)
kill $(cat .client.pid)

# View logs
tail -f client.log
```

---

## 🔍 Troubleshooting Common Issues

### **Issue: "role superapp_user does not exist"**

**Cause**: PostgreSQL container was created without proper environment variables.

**Solution**:
```bash
# 1. Complete cleanup
docker-compose down -v

# 2. Verify environment variables
cat .env | grep POSTGRES  # If .env exists
# OR check docker-compose.yml defaults

# 3. Start fresh
docker-compose up -d postgres
sleep 5

# 4. Verify user exists
docker exec react_super_app_postgres psql -U postgres -c "\du"

# 5. If superapp_user doesn't exist, create it
docker exec react_super_app_postgres psql -U postgres -c "CREATE USER superapp_user WITH PASSWORD 'superapp_password' CREATEDB;"
docker exec react_super_app_postgres psql -U postgres -c "CREATE DATABASE react_super_app OWNER superapp_user;"

# 6. Run migration
npm run db:migrate:001
```

### **Issue: "Port 5432 already in use"**

**Cause**: Local PostgreSQL or another Docker container is using port 5432.

**Solution**:
```bash
# Option 1: Stop local PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql  # Linux

# Option 2: Use different port
export POSTGRES_PORT=5433
docker-compose up -d postgres

# Option 3: Find and stop conflicting process
lsof -i :5432
kill -9 <PID>
```

### **Issue: "Port 3001 already in use"**

**Cause**: Another process is using the backend port.

**Solution**:
```bash
# Find process
lsof -i :3001

# Kill process
kill -9 $(lsof -t -i:3001)

# Start server
cd server && npm start
```

### **Issue: "Port 3000 already in use"**

**Cause**: Another React app or process is using the frontend port.

**Solution**:
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 $(lsof -t -i:3000)

# Start client
npm start
```

### **Issue: "Cannot connect to database"**

**Cause**: Database container not running or not ready.

**Solution**:
```bash
# Check if container is running
docker ps | grep postgres

# If not running, start it
docker-compose up -d postgres

# Wait for it to be ready
docker exec react_super_app_postgres pg_isready -U superapp_user

# Check logs for errors
docker-compose logs postgres
```

### **Issue: "Migration fails"**

**Cause**: Database not ready or connection issues.

**Solution**:
```bash
# 1. Verify database is running
docker ps | grep postgres

# 2. Test connection
docker exec react_super_app_postgres psql -U superapp_user -d react_super_app -c "SELECT 1;"

# 3. Check if migration already applied
npm run db:shell
SELECT * FROM schema_migrations;
\q

# 4. If needed, manually drop and recreate
npm run db:shell
DROP DATABASE react_super_app;
CREATE DATABASE react_super_app OWNER superapp_user;
\q

# 5. Run migration again
npm run db:migrate:001
```

---

## 🎯 When to Use Manual Setup

### **Use Manual Setup When:**

1. **Debugging Issues**
   - Need to see each step's output
   - Want to verify each service individually
   - Troubleshooting connection problems

2. **Custom Configuration**
   - Using non-standard ports
   - Running services on different machines
   - Custom environment variables

3. **Development Workflow**
   - Only need database running
   - Want to run server/client separately
   - Testing specific components

4. **Learning/Understanding**
   - Want to understand the setup process
   - Learning Docker and service orchestration
   - Teaching others

### **Use Automated Setup (`npm run test:e2e`) When:**

1. **Quick Testing**
   - Need everything running fast
   - Standard configuration
   - E2E testing

2. **Clean Start**
   - Want fresh environment
   - No debugging needed
   - Standard workflow

---

## 📊 Service Startup Order

**Correct Order** (with dependencies):

```
1. PostgreSQL Database
   ↓ (wait for ready)
2. Database Migration
   ↓ (wait for completion)
3. Backend Server
   ↓ (wait for health check)
4. Frontend Client
   ↓
5. Browser Opens
```

**Why Order Matters:**
- Backend needs database to be ready
- Frontend needs backend API to be available
- Migration needs database to exist

---

## 🔄 Restart Individual Services

### **Restart Database Only**

```bash
docker-compose restart postgres

# Wait for ready
sleep 3
docker exec react_super_app_postgres pg_isready -U superapp_user
```

### **Restart Backend Only**

```bash
# Find and kill process
kill $(cat .server.pid) 2>/dev/null || kill -9 $(lsof -t -i:3001)

# Start again
cd server && npm start &
echo $! > ../.server.pid
cd ..
```

### **Restart Frontend Only**

```bash
# Find and kill process
kill $(cat .client.pid) 2>/dev/null || kill -9 $(lsof -t -i:3000)

# Start again
BROWSER=none npm start &
echo $! > .client.pid
```

---

## 🧹 Cleanup Commands

### **Stop All Services**

```bash
# Stop Docker services
docker-compose down

# Stop Node processes
kill $(cat .server.pid) 2>/dev/null
kill $(cat .client.pid) 2>/dev/null

# Clean up PID files
rm -f .server.pid .client.pid
```

### **Complete Cleanup (Keep Database Data)**

```bash
# Stop services
docker-compose down

# Remove images
docker images | grep -E "react-super-app|react_super_app" | awk '{print $3}' | xargs docker rmi -f

# Keep volumes (database data persists)
```

### **Complete Cleanup (Remove Everything)**

```bash
# Stop and remove everything including volumes
docker-compose down -v

# Remove images
docker images | grep -E "react-super-app|react_super_app" | awk '{print $3}' | xargs docker rmi -f

# Remove networks
docker network ls | grep react_super_app | awk '{print $1}' | xargs docker network rm
```

---

## 📝 Quick Reference Commands

```bash
# Database
npm run db:shell          # Connect to PostgreSQL
npm run db:migrate:001    # Run migration
npm run db:logs           # View database logs

# Backend
cd server && npm start    # Start server
curl http://localhost:3001/health  # Health check

# Frontend
npm start                 # Start React app

# Docker
docker-compose up -d postgres     # Start database
docker-compose down              # Stop all
docker-compose down -v           # Stop and remove volumes
docker-compose logs -f postgres  # Follow logs
docker ps                        # List running containers

# Ports
lsof -i :5432            # Check database port
lsof -i :3001            # Check backend port
lsof -i :3000            # Check frontend port
```

---

## 🔗 Related Documentation

- **[E2E Testing Flow](./E2E_TESTING_FLOW.md)** - Automated testing guide
- **[Credentials Reference](../CREDENTIALS.md)** - All default credentials
- **[Database Isolation](./DATABASE_ISOLATION.md)** - Database setup details
- **[Troubleshooting Guide](./TROUBLESHOOTING.md)** - Common issues and solutions

---

## 💡 Pro Tips

1. **Use tmux or screen** for running multiple services in one terminal
2. **Create aliases** for frequently used commands
3. **Use Docker Desktop** GUI to monitor containers
4. **Check logs first** when debugging issues
5. **Keep .env file** for custom configuration

---

**Last Updated**: 2024-12-01  
**For Automated Setup**: Use `npm run test:e2e` instead

