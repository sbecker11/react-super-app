#!/bin/bash

echo "🚀 Starting React Super App (Local Development Mode)"
echo ""

# Check if PostgreSQL is running in Docker
echo "1️⃣ Starting PostgreSQL in Docker..."
docker run -d \
  --name react_super_app_postgres_local \
  -p 5432:5432 \
  -e POSTGRES_USER=superapp_user \
  -e POSTGRES_PASSWORD=superapp_password \
  -e POSTGRES_DB=react_super_app \
  postgres:15-alpine 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ PostgreSQL started in Docker"
else
  echo "⚠️  PostgreSQL container already exists or Docker isn't running"
  docker start react_super_app_postgres_local 2>/dev/null
fi

echo ""
echo "2️⃣ Waiting for PostgreSQL to be ready..."
sleep 5

# Initialize database (if needed)
echo ""
echo "3️⃣ Initializing database..."
cd server
npm run db:init 2>/dev/null || echo "⚠️  Database may already be initialized"

echo ""
echo "4️⃣ Starting services..."
echo "   - PostgreSQL: http://localhost:5432"
echo "   - Backend API: http://localhost:3001 (start in another terminal: cd server && npm run dev)"
echo "   - React Client: http://localhost:3000 (start in another terminal: npm start)"
echo ""
echo "To start backend: cd server && npm run dev"
echo "To start frontend: npm start"
echo ""
echo "To stop PostgreSQL: docker stop react_super_app_postgres_local"
