# 🧪 End-to-End Testing Flow

## 🚀 One-Command Setup

```bash
npm run test:e2e
```

This single command will:
1. ✅ Check Docker Desktop is running
2. ✅ Clean up existing containers
3. ✅ Start database
4. ✅ Run migration (create admin user)
5. ✅ Start backend server (port 3001)
6. ✅ Start frontend client (port 3000)
7. ✅ Open browser to http://localhost:3000

---

## 📋 Manual Testing Steps (After Setup)

### **Test Flow Overview**
```
1. Register User → 2. Logout → 3. Login → 4. Logout → 
5. Admin Login → 6. List Users → 7. Update Password → 
8. Admin Logout → 9. Login with New Password
```

---

### **Step 1: Register a New User** 👤

**Actions:**
1. Browser opens to http://localhost:3000
2. Click **"Login/Register"** in header
3. Click **"Register"** tab
4. Fill in form:
   - **Name**: `Test User`
   - **Email**: `test@example.com`
   - **Password**: `Test123!@#`
5. Click **"Register"** button

**Expected Results:**
- ✅ Toast: "Welcome, Test User! Your account has been created."
- ✅ Redirected to home page
- ✅ Header shows: Home | About | Analyzer | Profile
- ✅ **NO** "Admin" link visible
- ✅ Left sidebar shows same links

**Screenshot Location:** `Home page after registration`

---

### **Step 2: User Logout** 🚪

**Actions:**
1. Click **"Profile"** in header
2. Click **"Logout"** button in profile page

**Expected Results:**
- ✅ Toast: "You have been logged out."
- ✅ Redirected to home page
- ✅ Header shows: Home | About | Login/Register
- ✅ Profile and Analyzer links removed

---

### **Step 3: User Login** 🔑

**Actions:**
1. Click **"Login/Register"** in header
2. Ensure **"Login"** tab is selected
3. Fill in form:
   - **Email**: `test@example.com`
   - **Password**: `Test123!@#`
4. Click **"Login"** button

**Expected Results:**
- ✅ Toast: "Welcome back, Test User!"
- ✅ Redirected to home page
- ✅ Header shows: Home | About | Analyzer | Profile
- ✅ **NO** "Admin" link (still regular user)

---

### **Step 4: User Logout (Again)** 🚪

**Actions:**
1. Click **"Profile"** in header
2. Click **"Logout"** button

**Expected Results:**
- ✅ Toast: "You have been logged out."
- ✅ Back to logged-out state

---

### **Step 5: Admin Login** 👑

**Actions:**
1. Click **"Login/Register"** in header
2. Fill in form:
   - **Email**: `admin@react-super-app.local`
   - **Password**: `Admin123!`
3. Click **"Login"** button

**Expected Results:**
- ✅ Toast: "Welcome back, System Admin!"
- ✅ Header shows: Home | About | Analyzer | Profile | **Admin** (gold/bold)
- ✅ Left sidebar shows: **"⚙️ Admin"** link (gold/bold)

**Screenshot Location:** `Header with Admin link`

---

### **Step 6: Admin Lists Users** 📋

**Actions:**
1. Click **"Admin"** link in header or sidebar
2. You see the Admin Dashboard
3. Click **"User Management"** card

**Expected Results:**
- ✅ Page title: "User Management"
- ✅ Table with 2 users:
  
  | Name | Email | Role | Status | Last Login | Created | Actions |
  |------|-------|------|--------|------------|---------|---------|
  | System Admin | admin@react-super-app.local | admin (gold badge) | Active (green) | Just now | Today | ✏️ |
  | Test User | test@example.com | user (blue badge) | Active (green) | Just now | Today | ✏️ |

- ✅ Filters visible: Search, Role, Status, Per Page
- ✅ Pagination controls at bottom

**Screenshot Location:** `User Management page`

---

### **Step 7: Admin Updates User Password** 🔐

**Actions:**
1. Click **✏️ (edit)** button next to "Test User"
2. User Edit Modal opens
3. Scroll to **"Reset Password"** section
4. Fill in:
   - **New Password**: `NewTest123!@#`
   - **Confirm Password**: `NewTest123!@#`
5. Click **"Save Changes"** button
6. **Admin Auth Modal** appears
7. Enter admin password: `Admin123!`
8. Click **"Authenticate"** button

**Expected Results:**
- ✅ Toast: "Elevated session granted (15 minutes)"
- ✅ Admin Auth Modal closes
- ✅ Toast: "Password reset successfully"
- ✅ Password fields are cleared
- ✅ User Edit Modal can be closed or stays open

**Screenshot Location:** `Admin Auth Modal`

---

### **Step 8: Admin Logout** 🚪

**Actions:**
1. Close User Edit Modal (if still open)
2. Click **"Profile"** in header
3. Click **"Logout"** button

**Expected Results:**
- ✅ Toast: "You have been logged out."
- ✅ "Admin" link disappears from navigation

---

### **Step 9: User Login with New Password** ✅

**Actions:**
1. Click **"Login/Register"** in header
2. Fill in form:
   - **Email**: `test@example.com`
   - **Password**: `NewTest123!@#` (NEW PASSWORD)
3. Click **"Login"** button

**Expected Results:**
- ✅ Toast: "Welcome back, Test User!"
- ✅ Login succeeds with new password
- ✅ Old password (`Test123!@#`) no longer works

**Screenshot Location:** `Successful login with new password`

---

## ✅ Success Criteria

All 9 steps completed successfully means:
- ✅ User registration works
- ✅ User authentication works
- ✅ Role-based access control works (admin vs user)
- ✅ Admin can view all users
- ✅ Admin can update user passwords
- ✅ Elevated session authentication works
- ✅ Password changes take effect immediately
- ✅ Logout/login flow works correctly

---

## 🛑 Stop Services

When done testing:

```bash
npm run stop:services
```

This will stop:
- Frontend client (port 3000)
- Backend server (port 3001)
- Docker containers (database)

---

## 🔍 Troubleshooting

### Issue: "Docker is not running"
**Solution:** Start Docker Desktop first, then run `npm run test:e2e`

### Issue: "Port 3000 already in use"
**Solution:** The script will automatically kill the existing process

### Issue: "Database failed to start"
**Solution:** 
```bash
docker-compose down
docker-compose up -d db
npm run db:migrate:001
```

### Issue: "Admin login fails"
**Solution:** Check if migration ran successfully:
```bash
npm run db:shell
SELECT email, role FROM users WHERE role = 'admin';
\q
```

### Issue: "Cannot update password"
**Solution:** Make sure you're using the correct admin password: `Admin123!`

---

## 📊 Testing Checklist

Use this checklist while testing:

- [ ] Docker Desktop is running
- [ ] Setup script completes successfully
- [ ] Browser opens automatically
- [ ] User registration works
- [ ] User can logout
- [ ] User can login
- [ ] User cannot see Admin link
- [ ] Admin can login
- [ ] Admin sees Admin link (gold/bold)
- [ ] Admin Dashboard loads
- [ ] User Management shows 2 users
- [ ] Can click edit on Test User
- [ ] Can enter new password
- [ ] Admin Auth Modal appears
- [ ] Can authenticate with admin password
- [ ] Password update succeeds
- [ ] Admin can logout
- [ ] User can login with new password
- [ ] Old password no longer works

---

## 🎥 Recording the Test

To record your test session:
- **macOS**: Use QuickTime Player → File → New Screen Recording
- **Windows**: Use Xbox Game Bar (Win + G)
- **Linux**: Use SimpleScreenRecorder or Kazam

---

## 📝 Reporting Issues

If you find issues, please note:
1. Which step failed
2. Error message (if any)
3. Browser console errors (F12 → Console)
4. Network errors (F12 → Network)
5. Screenshots

---

## 🚀 Next Steps

After successful E2E testing:
1. Run automated tests: `npm test`
2. Check test coverage: `npm run test:coverage`
3. Review audit logs in database:
   ```bash
   npm run db:shell
   SELECT * FROM user_auth_logs ORDER BY created_at DESC LIMIT 10;
   ```

---

**Last Updated**: 2024-12-01  
**Test Duration**: ~5-10 minutes

