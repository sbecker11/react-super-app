# Docker File Sharing Configuration

## Issue
Docker Desktop needs access to the project directory to mount files into containers.

## Folder to Share
```
/Users/sbecker11/workspace-react/react-app
```

## Solution: Configure Docker Desktop File Sharing

### macOS Instructions

1. **Open Docker Desktop**
   - Click the Docker icon in the menu bar
   - Or open Docker Desktop from Applications

2. **Open Settings**
   - Click on the gear icon (⚙️) in the top right
   - Or go to Docker Desktop → Settings

3. **Go to Resources → File Sharing**
   - Click "Resources" in the left sidebar
   - Click "File Sharing" in the Resources section

4. **Add the Project Directory**
   - Click the "+" button or "Add folder" button
   - Navigate to: `/Users/sbecker11/workspace-react/react-app`
   - Click "Apply & Restart"

5. **Wait for Docker to Restart**
   - Docker Desktop will restart to apply the changes
   - Wait for Docker to fully start (whale icon in menu bar should be steady)

### Alternative: Share Parent Directory

If the exact folder doesn't work, you can share the parent directory:
```
/Users/sbecker11/workspace-react
```

This will give Docker access to all projects in that directory.

### Verify Configuration

After configuring, verify with:
```bash
docker run --rm -v /Users/sbecker11/workspace-react/react-app:/test alpine ls /test
```

This should list the files in your project directory without errors.

## Quick Check Script

Run this to check if the folder is already shared:
```bash
docker run --rm -v /Users/sbecker11/workspace-react/react-app:/test alpine ls /test/server/database/init.sql 2>&1
```

If it shows the file, file sharing is configured correctly!

