# Docker Desktop File Sharing Configuration

## Issue
Docker Compose services (server and client) cannot start because Docker Desktop on macOS requires explicit file sharing configuration for mounted volumes.

## Error Message
```
Error response from daemon: Mounts denied: 
The path /Users/sbecker11/workspace-react/react-super-app/server is not shared from the host and is not known to Docker.
You can configure shared paths from Docker -> Preferences... -> Resources -> File Sharing.
```

## Solution: Configure Docker Desktop File Sharing

### Step 1: Open Docker Desktop Settings
1. Open Docker Desktop application
2. Click on the **Settings** (gear icon) in the top right
3. Navigate to **Resources** → **File Sharing**

### Step 2: Add Project Directory
1. Click **"+"** or **"Add"** button
2. Navigate to and select: `/Users/sbecker11/workspace-react/react-super-app`
3. Click **"Apply & Restart"**

### Step 3: Verify Configuration
After Docker Desktop restarts, verify the path is listed in File Sharing:
- Should see: `/Users/sbecker11/workspace-react/react-super-app`

### Step 4: Test Docker Compose
```bash
# Stop any existing containers
docker compose down

# Start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

## Alternative: Use Docker Without Volume Mounts (Development)

If you prefer not to configure file sharing, you can:
1. Run database in Docker: `docker compose up -d postgres`
2. Run server locally: `cd server && npm run dev`
3. Run client locally: `npm start`

This approach works but doesn't provide the full Docker Compose experience.

## Benefits of Full Docker Setup

With file sharing configured:
- ✅ All services run in containers
- ✅ Consistent environment across team
- ✅ Easy to start/stop all services
- ✅ Isolated dependencies
- ✅ Production-like setup

## Troubleshooting

### If file sharing doesn't work:
1. Ensure Docker Desktop is running
2. Check macOS permissions (System Preferences → Security & Privacy)
3. Try restarting Docker Desktop
4. Verify the path is absolute (not relative)
5. Check Docker Desktop logs for errors

### If services still fail to start:
```bash
# Check Docker logs
docker compose logs server
docker compose logs client

# Verify file sharing
docker info | grep -i "file sharing"

# Test volume mount manually
docker run --rm -v /Users/sbecker11/workspace-react/react-super-app:/test alpine ls /test
```

