# Complete Storage & Persistence Guide

This comprehensive guide covers all aspects of data storage and persistence in the JD Analyzer application, including PostgreSQL database setup, schemas, REST API schemas, and client-side session storage.

---

## Table of Contents

1. [Overview](#overview)
2. [PostgreSQL Database Setup](#postgresql-database-setup)
3. [PostgreSQL Database Schema](#postgresql-database-schema)
4. [REST API Schemas](#rest-api-schemas)
5. [User Session Storage](#user-session-storage)
6. [Database Connection](#database-connection)
7. [Security Best Practices](#security-best-practices)

---

## Overview

The JD Analyzer application uses a multi-tier storage approach:

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React)                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │  localStorage: JWT Token + User Data            │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/REST API
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Server (Express/Node.js)                    │
│  ┌─────────────────────────────────────────────────┐    │
│  │  JWT Authentication + Request Validation        │    │
│  └─────────────────────────────────────────────────┘    │
└───────────────────────┬─────────────────────────────────┘
                        │ PostgreSQL Connection Pool
                        ▼
┌─────────────────────────────────────────────────────────┐
│          PostgreSQL Database (Port 5432)                 │
│  ┌─────────────────────────────────────────────────┐    │
│  │  users table + job_descriptions table           │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Storage Components

1. **PostgreSQL Database** - Persistent server-side storage
2. **REST API** - Interface between client and database
3. **Client localStorage** - Browser-based session storage

---

## PostgreSQL Database Setup

### Docker Compose Configuration

The PostgreSQL database is configured in `docker-compose.yml`:

```yaml
postgres:
  image: postgres:15-alpine
  container_name: jd_analyzer_postgres
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-jduser}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-jdpassword}
    POSTGRES_DB: ${POSTGRES_DB:-jdanalyzer}
  ports:
    - "${POSTGRES_PORT:-5432}:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./server/database/init.sql:/docker-entrypoint-initdb.d/init.sql
  networks:
    - jd_analyzer_network
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-jduser}"]
    interval: 10s
    timeout: 5s
    retries: 5
  restart: unless-stopped
```

### Default Configuration

- **Image**: `postgres:15-alpine` (PostgreSQL 15 on Alpine Linux)
- **Port**: `5432` (configurable via `POSTGRES_PORT`)
- **Database Name**: `jdanalyzer` (configurable via `POSTGRES_DB`)
- **Username**: `jduser` (configurable via `POSTGRES_USER`)
- **Password**: `jdpassword` (configurable via `POSTGRES_PASSWORD`)
- **Data Persistence**: Docker volume `postgres_data`

### Environment Variables

Set these in `.env` file (project root):

```env
POSTGRES_USER=jduser
POSTGRES_PASSWORD=jdpassword
POSTGRES_DB=jdanalyzer
POSTGRES_PORT=5432
```

**⚠️ Security Note**: Change default passwords in production!

### Starting the Database

#### Using Database Initialization Script (Recommended)

The easiest way to set up and initialize the database:

```bash
# Initialize database (starts container, creates DB, runs schema)
npm run db:init
```

This script:
- Starts PostgreSQL container (if not running)
- Waits for database to be ready
- Creates database if needed
- Creates UUID extension
- Initializes all tables, indexes, and triggers
- Verifies the setup

📖 **See [scripts/README.md](../scripts/README.md) for detailed information**

#### Using Docker Compose Directly

```bash
# Start all services (including database)
docker-compose up -d

# Start only PostgreSQL
docker-compose up postgres -d

# Start with automatic schema initialization
docker-compose up --build
```

The database schema is automatically initialized from `server/database/init.sql` on first startup via Docker's initialization mechanism.

#### Using npm Scripts

```bash
npm run db:start      # Start database container
npm run db:stop       # Stop database container
npm run db:restart    # Restart database container
npm run db:status     # Check container status
npm run db:logs       # View database logs
npm run db:shell      # Open PostgreSQL shell
```

#### Database Initialization

When the PostgreSQL container starts for the first time:
1. Creates the database `jdanalyzer`
2. Creates user `jduser` with password `jdpassword`
3. Executes `init.sql` to create tables, indexes, and triggers
4. Sets up UUID extension

### Accessing the Database

#### Command Line Access

```bash
# Connect to PostgreSQL container
docker-compose exec postgres psql -U jduser -d jdanalyzer

# Run SQL commands directly
docker-compose exec postgres psql -U jduser -d jdanalyzer -c "SELECT * FROM users;"

# List all tables
docker-compose exec postgres psql -U jduser -d jdanalyzer -c "\dt"

# Describe table structure
docker-compose exec postgres psql -U jduser -d jdanalyzer -c "\d users"
```

#### Using Database Client

Connect using any PostgreSQL client:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `jdanalyzer`
- **Username**: `jduser`
- **Password**: `jdpassword`

Popular clients:
- pgAdmin (GUI)
- DBeaver (GUI)
- psql (command line)
- TablePlus (GUI)

### Database Logs

```bash
# View database logs
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f postgres
```

### Database Backup & Restore

#### Backup

```bash
# Create backup
docker-compose exec postgres pg_dump -U jduser jdanalyzer > backup.sql

# Create compressed backup
docker-compose exec postgres pg_dump -U jduser -F c jdanalyzer > backup.dump
```

#### Restore

```bash
# Restore from SQL file
docker-compose exec -T postgres psql -U jduser jdanalyzer < backup.sql

# Restore from compressed dump
docker-compose exec postgres pg_restore -U jduser -d jdanalyzer backup.dump
```

### Database Data Persistence

Data is stored in a Docker volume `postgres_data`, which persists even when containers are stopped.

**To reset database** (⚠️ deletes all data):
```bash
docker-compose down -v
docker-compose up --build
```

---

## PostgreSQL Database Schema

### Schema Initialization

The database schema is defined in `server/database/init.sql` and is automatically executed when the PostgreSQL container is first created.

### Tables

#### 1. Users Table

Stores user account information.

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - UUID primary key (auto-generated)
- `name` - User's full name (2-50 characters)
- `email` - Unique email address (used for login)
- `password_hash` - Bcrypt hash of password (never store plain text!)
- `created_at` - Timestamp of account creation (auto-set)
- `updated_at` - Timestamp of last update (auto-updated)

**Constraints:**
- `id` is PRIMARY KEY
- `email` is UNIQUE
- `name` and `email` are NOT NULL

**Indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
```

#### 2. Job Descriptions Table

Stores job description data (for future use).

```sql
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    description TEXT,
    keywords TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` - UUID primary key (auto-generated)
- `user_id` - Foreign key to users table (CASCADE delete)
- `title` - Job title
- `company` - Company name (optional)
- `description` - Full job description text
- `keywords` - Array of keywords (TEXT[])
- `created_at` - Timestamp of creation (auto-set)
- `updated_at` - Timestamp of last update (auto-updated)

**Constraints:**
- `id` is PRIMARY KEY
- `user_id` REFERENCES `users(id)` with CASCADE delete
- `title` is NOT NULL

**Indexes:**
```sql
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON job_descriptions(user_id);
```

### Database Functions & Triggers

#### Auto-Update Timestamp Function

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

#### Timestamp Triggers

Automatically updates `updated_at` column when rows are modified:

```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON job_descriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### UUID Extension

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Enables UUID generation using `uuid_generate_v4()`.

### Schema Relationships

```
users
  │
  │ (1:N)
  │
  ▼
job_descriptions
  └─ user_id (Foreign Key)
```

- One user can have many job descriptions
- Deleting a user automatically deletes their job descriptions (CASCADE)

### Example Queries

#### Insert User

```sql
INSERT INTO users (name, email, password_hash)
VALUES ('John Doe', 'john@example.com', '$2a$10$...');
```

#### Select Users

```sql
-- Get all users
SELECT id, name, email, created_at FROM users;

-- Get user by email
SELECT * FROM users WHERE email = 'john@example.com';

-- Get user by ID
SELECT * FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

#### Update User

```sql
UPDATE users 
SET name = 'John Updated', updated_at = CURRENT_TIMESTAMP
WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

#### Delete User

```sql
-- This will also delete all associated job_descriptions (CASCADE)
DELETE FROM users WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

---

## REST API Schemas

### Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: Configure via `REACT_APP_API_URL` environment variable

### Authentication

All user routes require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <JWT_TOKEN>
```

### API Endpoints

#### Authentication Endpoints

##### POST `/api/auth/register`

Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `name`: 2-50 characters, letters/spaces/hyphens/apostrophes only
- `email`: Valid email format
- `password`: 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (400):**
```json
{
  "errors": [
    {
      "msg": "Email must be valid",
      "param": "email",
      "location": "body"
    }
  ]
}
```

**Error Response (400) - Duplicate Email:**
```json
{
  "error": "User with this email already exists"
}
```

##### POST `/api/auth/login`

Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `email`: Valid email format
- `password`: Required (not empty)

**Success Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

#### User Endpoints (Requires Authentication)

All user endpoints require the `Authorization: Bearer <token>` header.

##### GET `/api/users`

Get all users (admin only - can be enhanced later).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

##### GET `/api/users/me`

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Unauthorized"
}
```

##### GET `/api/users/:id`

Get user by ID (only own profile allowed).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Response (403):**
```json
{
  "error": "Access denied"
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

##### PUT `/api/users/:id`

Update user (only own profile allowed).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

**Validation Rules:**
- `name`: Optional, 2-50 characters if provided
- `email`: Optional, valid email format if provided

**Success Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Updated",
    "email": "newemail@example.com",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:05:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "errors": [
    {
      "msg": "Name must be between 2 and 50 characters",
      "param": "name",
      "location": "body"
    }
  ]
}
```

**Error Response (400) - Duplicate Email:**
```json
{
  "error": "Email already in use"
}
```

##### DELETE `/api/users/:id`

Delete user (only own profile allowed).

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Response (403):**
```json
{
  "error": "Access denied"
}
```

**Error Response (404):**
```json
{
  "error": "User not found"
}
```

#### Health Check Endpoint

##### GET `/health`

Check server health (no authentication required).

**Success Response (200):**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Error Response Format

All error responses follow consistent formats:

**Validation Errors (400):**
```json
{
  "errors": [
    {
      "msg": "Error message",
      "param": "fieldName",
      "location": "body"
    }
  ]
}
```

**Single Error (400/401/403/404/500):**
```json
{
  "error": "Error message"
}
```

### JWT Token

JWT tokens are included in successful authentication responses and should be stored client-side for subsequent authenticated requests.

**Token Payload:**
```json
{
  "userId": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john@example.com",
  "iat": 1704110400,
  "exp": 1704196800
}
```

**Token Expiration**: 24 hours (configurable via `JWT_EXPIRES_IN`)

---

## User Session Storage

### Storage Strategy

The client application uses **localStorage** for session storage, storing:
- JWT authentication token
- User data (id, name, email)

### ❌ NEVER Store

- **Passwords** - Never store passwords in browser storage
- **Plain text credentials** - Always use encrypted/hashed tokens
- **Password hashes** - Not needed client-side

### ✅ Safe to Store

- **Authentication tokens** (JWT) - Store securely
- **User ID** - Can be stored (non-sensitive)
- **User name/display name** - Can be stored (non-sensitive)
- **User email** - Can be stored (non-sensitive)

### Storage Options Comparison

#### 1. localStorage (Current Implementation)

- **Persistence**: Survives browser restart, persists until explicitly cleared
- **Scope**: Domain-specific, accessible across tabs
- **Security**: ⚠️ Accessible via JavaScript, vulnerable to XSS attacks
- **Best for**: Non-sensitive user preferences, user ID, display name, JWT tokens (with XSS protection)

#### 2. sessionStorage

- **Persistence**: Cleared when tab/window closes
- **Scope**: Tab-specific (not shared across tabs)
- **Security**: ⚠️ Accessible via JavaScript, vulnerable to XSS attacks
- **Best for**: Temporary session data, form drafts

#### 3. HTTP-only Cookies (Recommended for Production)

- **Persistence**: Configurable expiration, can be persistent or session-based
- **Scope**: Automatically sent with HTTP requests
- **Security**: ✅ Can be httpOnly (not accessible via JavaScript) - **MOST SECURE**
- **Best for**: Authentication tokens, session IDs

### Current Implementation Schema

#### localStorage Keys

```javascript
{
  // JWT Token (from server)
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // User data (JSON string, without password!)
  "user": "{\"id\":\"123\",\"name\":\"John Doe\",\"email\":\"john@example.com\"}"
}
```

#### User Object Structure

```javascript
{
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "John Doe",
  email: "john@example.com"
}
```

### API Service Implementation

The client-side API service (`src/services/api.js`) handles token management:

```javascript
// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Get headers with token
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};
```

### Authentication Flow

```
1. User submits login/register form
   → Password sent to server (HTTPS only)
   │
   ▼
2. Server validates credentials
   → Hashes password, compares with database
   → Generates JWT token with user data
   │
   ▼
3. Server sends JWT token in response
   │
   ▼
4. Client stores token in localStorage
   localStorage.setItem('authToken', token);
   localStorage.setItem('user', JSON.stringify(userData));
   │
   ▼
5. Subsequent requests include token
   Authorization: Bearer <token>
```

### Recommended Authentication Service

```javascript
// src/services/authService.js

class AuthService {
  // Store token after login/register
  setAuth(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email
    }));
  }
  
  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // Get auth token
  getToken() {
    return localStorage.getItem('authToken');
  }
  
  // Check if user is logged in
  isAuthenticated() {
    return !!this.getToken();
  }
  
  // Logout - clear storage
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
  
  // Update user data in localStorage
  updateUser(userData) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }
}
```

---

## Database Connection

### Server-Side Connection Pool

The server uses a PostgreSQL connection pool (`server/src/database/connection.js`):

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'jduser',
  password: process.env.DB_PASSWORD || 'jdpassword',
  database: process.env.DB_NAME || 'jdanalyzer',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query helper function
const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = { query, pool };
```

### Environment Variables

Server database connection uses these environment variables:

```env
DB_HOST=postgres          # Docker service name
DB_PORT=5432             # PostgreSQL port
DB_USER=jduser           # Database username
DB_PASSWORD=jdpassword   # Database password
DB_NAME=jdanalyzer       # Database name
```

These are automatically set by Docker Compose from the `.env` file.

### Connection Pool Benefits

- **Reuses connections** - More efficient than creating new connections
- **Handles concurrent requests** - Manages multiple database connections
- **Automatic cleanup** - Closes idle connections
- **Error handling** - Handles connection failures gracefully

---

## Security Best Practices

### Password Security

1. **Never store passwords in plain text**
   - ✅ Server hashes passwords using bcrypt (10 salt rounds)
   - ❌ Never send password hashes to client
   - ❌ Never store passwords in localStorage/sessionStorage/cookies

2. **Password Requirements**
   - Minimum 8 characters
   - At least 1 uppercase letter
   - At least 1 lowercase letter
   - At least 1 number
   - At least 1 special character

### Token Security

1. **JWT Token Storage**
   - Store in localStorage (current implementation)
   - For production: Consider httpOnly cookies for better XSS protection

2. **Token Expiration**
   - Default: 24 hours
   - Configurable via `JWT_EXPIRES_IN` environment variable
   - Implement token refresh mechanism for production

3. **Token Transmission**
   - Always use HTTPS in production
   - Include token in `Authorization: Bearer <token>` header
   - Never include token in URL parameters

### Database Security

1. **Connection Security**
   - Use environment variables for credentials (never hardcode)
   - Use connection pooling to prevent connection exhaustion
   - Use parameterized queries to prevent SQL injection

2. **Access Control**
   - Users can only access/modify their own data
   - Validate user permissions on every request
   - Use UUIDs instead of sequential IDs (prevents enumeration)

### Client-Side Security

1. **XSS Prevention**
   - Sanitize all user inputs
   - Use Content Security Policy (CSP)
   - Avoid `dangerouslySetInnerHTML`
   - Validate and escape all data before rendering

2. **CSRF Protection**
   - Use SameSite cookies
   - Implement CSRF tokens for state-changing operations
   - Validate origin headers

3. **HTTPS**
   - Always use HTTPS in production
   - Never send credentials over HTTP

### Production Recommendations

1. **Environment Variables**
   - Change all default passwords
   - Use strong, randomly generated JWT secrets
   - Use separate databases for development/staging/production

2. **Database Backups**
   - Regular automated backups
   - Test restore procedures
   - Store backups securely

3. **Monitoring**
   - Monitor database connections
   - Log authentication failures
   - Set up alerts for suspicious activity

4. **Rate Limiting**
   - Implement rate limiting on authentication endpoints
   - Prevent brute force attacks
   - Monitor for unusual patterns

---

## Summary

✅ **PostgreSQL Database** - Configured via Docker Compose with automatic schema initialization  
✅ **Database Schema** - Users and job_descriptions tables with indexes and triggers  
✅ **REST API** - Complete authentication and user management endpoints  
✅ **Client Storage** - localStorage for JWT tokens and user data  
✅ **Security** - Password hashing, JWT authentication, access control  

The application uses a secure, scalable storage architecture with clear separation between client session storage and persistent database storage.

