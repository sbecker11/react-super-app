# 🚀 Testing Quick Start

## One Command to Rule Them All

```bash
npm run test:e2e
```

**Interactive Prompt** - Choose your cleanup level:
1. **Quick start** (default) - Keep database data, remove old images
2. **Fresh start** - Remove everything including database
3. **Skip cleanup** - Fastest, use existing containers

Then it will:
1. ✅ Check Docker Desktop
2. ✅ Check for port conflicts
3. ✅ Clean up (based on your choice)
4. ✅ Start database
5. ✅ Run migration
6. ✅ Start server (port 3001)
7. ✅ Start client (port 3000)
8. ✅ Open browser to http://localhost:3000

---

## 📋 9-Step Testing Flow

### Admin Credentials
- **Email**: `admin@react-super-app.local`
- **Password**: `Admin123!`

### Test User Credentials (you'll create)
- **Email**: `test@example.com`
- **Password**: `Test123!@#` → `NewTest123!@#` (after admin updates)

---

### The Flow

1. **Register User** → Create test@example.com
2. **Logout** → Log out test user
3. **Login** → Log back in as test user (verify no admin access)
4. **Logout** → Log out again
5. **Admin Login** → Log in as admin (verify admin link appears)
6. **List Users** → View user management page
7. **Update Password** → Change test user's password to NewTest123!@#
8. **Admin Logout** → Log out admin
9. **Login with New Password** → Log in as test user with new password

---

## 🛑 Stop Everything

```bash
npm run stop:services
```

---

## 📖 Documentation

- **[E2E Testing Flow](./docs/E2E_TESTING_FLOW.md)** - Detailed 9-step testing guide
- **[Manual Setup Guide](./docs/MANUAL_SETUP.md)** - Step-by-step manual commands
- **[Credentials Reference](./CREDENTIALS.md)** - All default credentials in one place
- **[Database Isolation](./docs/DATABASE_ISOLATION.md)** - How databases are isolated

---

## ⏱️ Estimated Time

- **Setup**: 2-3 minutes (automated)
- **Manual Testing**: 5-7 minutes
- **Total**: ~10 minutes

---

## ✅ Success = All 9 Steps Pass

If all steps complete successfully, your RBAC system is working perfectly! 🎉

---

**Ready? Let's go!**

```bash
npm run test:e2e
```

