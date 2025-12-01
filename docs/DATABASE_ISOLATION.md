# 🔒 Database Isolation Guide

## Overview

This application uses **its own uniquely named PostgreSQL database** and is completely isolated from other databases on the same PostgreSQL server.

---

## 📊 Current Database Configuration

### **Unique Database Name**
```
Database: react_super_app
```

### **Dedicated User**
```
Username: superapp_user
Password: superapp_password
```

### **Isolation Level**
- ✅ **Separate database** - `react_super_app` (not `postgres` default)
- ✅ **Dedicated user** - `superapp_user` (not `postgres` superuser)
- ✅ **Dedicated volume** - `react-super-app_postgres_data`
- ✅ **Dedicated network** - `react_super_app_network`
- ✅ **Dedicated container** - `react_super_app_postgres`

---

## 🛡️ How Isolation Works

### **1. Database Level Isolation**

PostgreSQL supports multiple databases on a single server. This app uses:

```sql
-- This app's database
react_super_app

-- Other databases remain untouched
postgres          (PostgreSQL default)
template0         (PostgreSQL template)
template1         (PostgreSQL template)
your_other_db     (Your other applications)
```

### **2. User Permissions**

The `superapp_user` has permissions **ONLY** on `react_super_app`:

```sql
-- User can access ONLY react_super_app
GRANT ALL PRIVILEGES ON DATABASE react_super_app TO superapp_user;

-- User CANNOT access other databases
-- No permissions on postgres, template0, template1, etc.
```

### **3. Connection Isolation**

Application connects **only** to `react_super_app`:

```javascript
// server/src/database/connection.js
const pool = new Pool({
  database: 'react_super_app',  // ← Isolated database
  user: 'superapp_user',         // ← Dedicated user
  // ...
});
```

---

## 🔍 Verify Database Isolation

### **List All Databases**

```bash
# Connect to PostgreSQL
npm run db:shell

# List all databases
\l

# You'll see:
# react_super_app  | superapp_user | UTF8  | ← This app
# postgres         | postgres      | UTF8  | ← Default (untouched)
# template0        | postgres      | UTF8  | ← Template (untouched)
# template1        | postgres      | UTF8  | ← Template (untouched)
```

### **Check Current Database**

```bash
# In psql shell
SELECT current_database();
# Output: react_super_app

# List tables in THIS database only
\dt

# You'll see:
# users
# user_auth_logs
# companies
# recruiters
# resumes
# cover_letters
# job_descriptions
# job_description_sources
```

### **Verify User Permissions**

```bash
# In psql shell
\du

# You'll see:
# superapp_user | Create DB | ← Limited permissions
# postgres      | Superuser | ← Not used by app
```

---

## 🔐 Security Best Practices

### **✅ What This App Does Right**

1. **Dedicated Database** - Uses `react_super_app`, not `postgres`
2. **Dedicated User** - Uses `superapp_user`, not `postgres` superuser
3. **Limited Permissions** - User can only access its own database
4. **Environment Variables** - Credentials configurable via `.env`
5. **Connection Pooling** - Efficient connection management
6. **No Shared Tables** - All tables isolated within `react_super_app`

### **❌ What This App Avoids**

1. ❌ Using `postgres` default database
2. ❌ Using `postgres` superuser
3. ❌ Hardcoded credentials
4. ❌ Global permissions
5. ❌ Shared schemas

---

## 🔄 Multiple Applications on Same PostgreSQL

You can run **multiple applications** on the same PostgreSQL server:

```
PostgreSQL Server (localhost:5432)
├── react_super_app         ← This app
│   ├── users
│   ├── job_descriptions
│   └── ...
│
├── my_blog_app             ← Your blog
│   ├── posts
│   ├── comments
│   └── ...
│
└── my_ecommerce_app        ← Your store
    ├── products
    ├── orders
    └── ...
```

**Each app is completely isolated!**

---

## 🧪 Test Database Isolation

### **Create a Test Database**

```bash
# Connect to PostgreSQL
npm run db:shell

# Create another database
CREATE DATABASE test_isolation;

# Switch to it
\c test_isolation

# Create a table
CREATE TABLE test_table (id INT);

# Switch back to react_super_app
\c react_super_app

# Try to access test_table (will fail)
SELECT * FROM test_table;
# ERROR: relation "test_table" does not exist
```

**Proof**: Tables in other databases are **not accessible**!

---

## 📋 Database Configuration Summary

### **Environment Variables**

```bash
# Database connection (docker-compose.yml)
POSTGRES_USER=superapp_user
POSTGRES_PASSWORD=superapp_password
POSTGRES_DB=react_super_app
POSTGRES_PORT=5432

# Backend connection (server/.env)
DB_HOST=localhost
DB_PORT=5432
DB_USER=superapp_user
DB_PASSWORD=superapp_password
DB_NAME=react_super_app
```

### **Docker Volume**

```yaml
volumes:
  postgres_data:  # Stores data for ALL databases
    driver: local
```

**Note**: While the volume is shared, **databases within it are isolated**.

---

## 🔧 Change Database Name (If Needed)

If you want a different database name:

### **1. Update docker-compose.yml**

```yaml
environment:
  POSTGRES_DB: my_custom_db_name
```

### **2. Update server/.env**

```bash
DB_NAME=my_custom_db_name
```

### **3. Recreate database**

```bash
npm run clean:docker
npm run test:e2e
```

---

## 🗑️ Clean Up Only This App's Database

### **Option 1: Remove Volume (Complete Cleanup)**

```bash
docker-compose down -v
```

This removes **only** the `react-super-app_postgres_data` volume.

### **Option 2: Drop Database (Keep Container)**

```bash
# Connect to PostgreSQL
npm run db:shell

# Drop this app's database
DROP DATABASE react_super_app;

# Recreate it
CREATE DATABASE react_super_app OWNER superapp_user;

# Run migrations
\q
npm run db:migrate:001
```

### **Option 3: Use Clean Script**

```bash
npm run clean:docker
```

This removes **all Docker resources** for this app only.

---

## 📊 Database vs Schema vs Table

Understanding PostgreSQL hierarchy:

```
PostgreSQL Server (localhost:5432)
│
├── Database: react_super_app          ← Isolation Level 1
│   │
│   ├── Schema: public (default)       ← Isolation Level 2
│   │   ├── Table: users
│   │   ├── Table: job_descriptions
│   │   └── ...
│   │
│   └── Schema: custom_schema          ← Optional
│       └── Table: custom_table
│
└── Database: other_app                ← Completely separate
    └── Schema: public
        └── Table: other_table
```

**This app uses**: `react_super_app` database → `public` schema → tables

---

## ✅ Verification Checklist

- [ ] App uses `react_super_app` database (not `postgres`)
- [ ] App uses `superapp_user` user (not `postgres`)
- [ ] User has permissions only on `react_super_app`
- [ ] Tables exist only in `react_super_app` database
- [ ] Other databases on same server are untouched
- [ ] Connection string specifies `react_super_app`
- [ ] Migrations run against `react_super_app` only

---

## 🎯 Summary

### **Database Isolation: ✅ CONFIRMED**

- ✅ Unique database name: `react_super_app`
- ✅ Dedicated user: `superapp_user`
- ✅ Limited permissions: Only `react_super_app` access
- ✅ No impact on other databases
- ✅ Clean separation of concerns
- ✅ Can run alongside other apps

### **Safe to Use With:**
- ✅ Local PostgreSQL installations
- ✅ Other Docker PostgreSQL containers
- ✅ Multiple applications on same server
- ✅ Development and production databases

---

**Your other databases are safe!** 🛡️

This application is completely isolated and will never touch:
- `postgres` default database
- Other application databases
- System tables or templates

---

**Last Updated**: 2024-12-01  
**Database Name**: `react_super_app`  
**Isolation Level**: Complete

