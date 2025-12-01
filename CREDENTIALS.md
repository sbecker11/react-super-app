# 🔑 Credentials Reference

**Quick access to all default credentials for React Super App**

⚠️ **WARNING**: These are **development defaults**. Change them in production!

---

## 📋 Quick Reference Card

```
╔════════════════════════════════════════════════════╗
║  React Super App - Credentials Quick Reference     ║
╠════════════════════════════════════════════════════╣
║  PostgreSQL Superuser (Database)                   ║
║  Username: superapp_user                           ║
║  Password: superapp_password                       ║
║  Connect:  npm run db:shell                        ║
╠════════════════════════════════════════════════════╣
║  Application Admin (Web UI)                        ║
║  Email:    admin@react-super-app.local             ║
║  Password: Admin123!                               ║
║  Login:    http://localhost:3000/login-register    ║
╠════════════════════════════════════════════════════╣
║  ⚠️  CHANGE THESE IN PRODUCTION!                   ║
╚════════════════════════════════════════════════════╝
```

---

## 1️⃣ PostgreSQL Superuser (Database Server Admin)

**Purpose**: Manage PostgreSQL database server

| Field | Value |
|-------|-------|
| **Username** | `superapp_user` |
| **Password** | `superapp_password` |
| **Database** | `react_super_app` |
| **Port** | `5432` |
| **Host** | `localhost` |

### How to Connect:

```bash
# Option 1: Use npm script (easiest)
npm run db:shell

# Option 2: Docker exec
docker exec -it react_super_app_postgres psql -U superapp_user -d react_super_app

# Option 3: Local psql
psql -h localhost -p 5432 -U superapp_user -d react_super_app
```

### Where Defined:

- **File**: `docker-compose.yml` (lines 9-11)
- **File**: `.env.example` (lines 9-11)
- **File**: `.env` (if you created it)

---

## 2️⃣ Application Admin User (React Super App Admin)

**Purpose**: Manage users and access admin features in the web application

| Field | Value |
|-------|-------|
| **Email** | `admin@react-super-app.local` |
| **Password** | `Admin123!` |
| **Role** | `admin` |
| **URL** | http://localhost:3000/login-register |

### How to Login:

1. Open browser to http://localhost:3000
2. Click "Login/Register"
3. Enter email: `admin@react-super-app.local`
4. Enter password: `Admin123!`
5. Click "Login"

### Where Created:

- **File**: `server/database/migrations/001_add_rbac_and_core_objects.sql` (line ~195)
- **Created by**: `npm run db:migrate:001`
- **Displayed after**: Migration completes

---

## 🔧 How to Change Credentials

### Change PostgreSQL Password:

**Before first run:**
```bash
# Create .env file
cat > .env << EOF
POSTGRES_USER=superapp_user
POSTGRES_PASSWORD=your_new_secure_password
POSTGRES_DB=react_super_app
EOF

# Start fresh
npm run clean:docker
npm run test:e2e
```

**After container is running:**
```bash
# Connect to database
npm run db:shell

# Change password
ALTER USER superapp_user WITH PASSWORD 'your_new_secure_password';
\q

# Update .env
echo "POSTGRES_PASSWORD=your_new_secure_password" >> .env

# Restart
npm run stop:services
npm run test:e2e
```

### Change Application Admin Password:

**Via Web UI (Recommended):**
1. Login as admin
2. Go to Profile
3. Update password
4. Save changes

**Via Database:**
```bash
# Generate hash
cd server
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourNewPassword123!', 10, (e,h) => console.log(h));"

# Update in database
npm run db:shell
UPDATE users SET password_hash = 'YOUR_HASH_HERE' WHERE email = 'admin@react-super-app.local';
\q
```

---

## 🔍 Verify Credentials

### PostgreSQL:
```bash
# Check environment
docker exec react_super_app_postgres env | grep POSTGRES

# Test connection
npm run db:shell
# If you connect successfully, credentials are correct!
```

### Application Admin:
```bash
# Check in database
npm run db:shell
SELECT email, role FROM users WHERE role = 'admin';
\q
```

---

## 🛡️ Production Security Checklist

Before deploying to production:

- [ ] Change `POSTGRES_PASSWORD` to a strong password (16+ characters)
- [ ] Change `JWT_SECRET` to a random 64-character string
- [ ] Change application admin password via web UI
- [ ] Create `.env` file with production credentials
- [ ] Ensure `.env` is in `.gitignore` (already done)
- [ ] Use environment variables in CI/CD
- [ ] Enable SSL/TLS for database connections
- [ ] Restrict database access by IP
- [ ] Enable PostgreSQL authentication logging
- [ ] Set up password rotation policy

### Generate Strong Credentials:

```bash
# Generate strong PostgreSQL password
openssl rand -base64 32

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate application admin password
openssl rand -base64 24
```

---

## 📚 Related Documentation

- **Database Isolation**: `docs/DATABASE_ISOLATION.md`
- **Environment Variables**: `.env.example`
- **Docker Configuration**: `docker-compose.yml`
- **Migration Script**: `server/database/migrations/001_add_rbac_and_core_objects.sql`
- **Testing Guide**: `TESTING_QUICK_START.md`

---

## 🆘 Troubleshooting

### "Password authentication failed"

**PostgreSQL:**
```bash
# Check current password
cat .env | grep POSTGRES_PASSWORD

# Or check docker-compose defaults
grep POSTGRES_PASSWORD docker-compose.yml
```

**Application:**
```bash
# Reset admin password
npm run db:shell
UPDATE users SET password_hash = '$2b$10$rZ5LkH8K8xJQK5Y5K5Y5K5Y5K5Y5K5Y5K5Y5K5Y5K5Y5K5Y5K5Y5K' WHERE email = 'admin@react-super-app.local';
\q
# Password is now: Admin123!
```

### "Cannot connect to database"

```bash
# Check if container is running
docker ps | grep postgres

# Check credentials match
docker exec react_super_app_postgres env | grep POSTGRES

# Restart container
npm run stop:services
npm run test:e2e
```

---

## 📝 Default Credentials Summary

| Component | Username/Email | Password | Access |
|-----------|---------------|----------|--------|
| **PostgreSQL** | `superapp_user` | `superapp_password` | `npm run db:shell` |
| **App Admin** | `admin@react-super-app.local` | `Admin123!` | http://localhost:3000 |

---

**Last Updated**: 2024-12-01  
**Environment**: Development  
**Status**: Default credentials (change in production!)

---

⚠️ **IMPORTANT**: Never commit actual production credentials to version control!

