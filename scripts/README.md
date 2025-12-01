# Docker and Database Scripts

This directory contains scripts for Docker management and PostgreSQL database operations.

## init-docker.sh

Docker initialization and checking script that ensures Docker Desktop is properly configured and running.

### Usage

This script is primarily used by other scripts but can also be sourced directly:

```bash
# Source the script to use its functions
source scripts/init-docker.sh

# Initialize Docker (main function)
init_docker

# Check if Docker is running
check_docker

# Start Docker Desktop on macOS
start_docker_desktop

# Check docker-compose availability
check_docker_compose
```

### Functions

- **`init_docker()`** - Main initialization function that checks Docker status and attempts auto-start
- **`check_docker()`** - Verifies Docker installation and daemon status
- **`start_docker_desktop()`** - Attempts to start Docker Desktop on macOS automatically
- **`check_docker_compose()`** - Verifies docker-compose availability and sets command

### Features

- **Auto-detection** - Detects Docker installation and daemon status
- **Auto-start** - Attempts to start Docker Desktop automatically on macOS
- **Cross-platform** - Provides manual instructions for non-macOS platforms
- **Timeout handling** - Waits up to 60 seconds for Docker to start
- **Clear feedback** - Provides detailed status messages and error handling

### Example Output

```
Step 0: Checking Docker...
Docker daemon is not running
Attempting to start Docker Desktop...
✓ Docker Desktop launch command sent
Waiting for Docker Desktop to start (this may take 30-60 seconds)...
✓ Docker Desktop is now running!
✓ Docker is running
✓ Using: docker compose
```

## init-database.sh

Comprehensive database initialization script that:
- Starts PostgreSQL container (if not running)
- Waits for database to be ready
- Creates database if it doesn't exist
- Creates UUID extension
- Initializes database schema (tables, indexes, triggers)
- Verifies all tables are present

### Usage

#### Using npm script (recommended):
```bash
npm run db:init
```

#### Direct execution:
```bash
./scripts/init-database.sh
```

### What it does:

0. **Initialize Docker** - Ensures Docker Desktop is installed and running (via `init-docker.sh`)
1. **Starts PostgreSQL** - Uses Docker Compose to start the database container
2. **Waits for readiness** - Waits up to 60 seconds for PostgreSQL to be ready
3. **Creates database** - Creates `react_super_app` database if it doesn't exist
4. **Creates UUID extension** - Enables `uuid-ossp` extension for UUID generation
5. **Initializes schema** - Runs `server/database/init.sql` to create:
   - `users` table with indexes
   - `job_descriptions` table with indexes
   - Triggers for automatic timestamp updates
6. **Verifies setup** - Checks that all tables and indexes exist

### Environment Variables

The script uses environment variables from `.env` file or defaults:
- `POSTGRES_USER` (default: `superapp_user`)
- `POSTGRES_PASSWORD` (default: `superapp_password`)
- `POSTGRES_DB` (default: `react_super_app`)
- `POSTGRES_PORT` (default: `5432`)

### Example Output

```
========================================
Database Initialization Script
========================================

Step 0: Checking Docker...
✓ Docker is running
✓ Using: docker compose

Step 1: Starting PostgreSQL container...
✓ PostgreSQL container is already running

Step 2: Waiting for PostgreSQL to be ready...
✓ PostgreSQL is ready!

Step 3: Checking database...
✓ Database 'react_super_app' already exists

Step 4: Checking UUID extension...
✓ UUID extension already exists

Step 5: Checking database schema...
✓ Tables already exist
✓ All tables are present

Step 6: Verifying database schema...
✓ Table 'users' exists
✓ Table 'job_descriptions' exists

Step 7: Verifying indexes...
✓ Indexes are present (4 found)

========================================
Database Initialization Complete!
========================================
```

## Available npm Scripts

All scripts can be run from the project root:

- `npm run db:init` - Initialize database (full setup)
- `npm run db:start` - Start PostgreSQL container
- `npm run db:stop` - Stop PostgreSQL container
- `npm run db:restart` - Restart PostgreSQL container
- `npm run db:status` - Check container status
- `npm run db:logs` - View database logs (follow mode)
- `npm run db:shell` - Open PostgreSQL shell

## Troubleshooting

### Database won't start
- Check if port 5432 is already in use: `lsof -i :5432`
- Check Docker is running: `docker ps`
- View logs: `npm run db:logs`

### Tables not created
- Ensure `server/database/init.sql` exists
- Check database logs for errors
- Try removing and recreating: `docker-compose down -v && npm run db:init`

### Connection errors
- Verify container is running: `npm run db:status`
- Check environment variables in `.env`
- Wait a bit longer - database might still be initializing

