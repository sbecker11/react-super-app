# 🧪 Admin RBAC Testing Guide

## Quick Start - Manual Testing

### Step 1: Run the Database Migration

```bash
# Make sure Docker is running
npm run db:migrate:001
```

**Expected Output**:
```
✅ Migration completed successfully!
🔑 ADMIN CREDENTIALS (save these securely!)
═══════════════════════════════════════════════════
Email:    admin@react-super-app.local
Password: Admin123!
═══════════════════════════════════════════════════
⚠️  IMPORTANT: Change this password after first login!
```

---

### Step 2: Start the Services

```bash
# Terminal 1: Start Docker services
docker-compose up --build

# Terminal 2: Start the React app
npm start
```

**Services**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

---

### Step 3: Test User Registration (Regular User)

1. Navigate to http://localhost:3000
2. Click **"Login/Register"**
3. Switch to **"Register"** mode
4. Fill in the form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test123!@#`
5. Click **"Register"**

**Expected Results**:
- ✅ Success toast: "Welcome, Test User! Your account has been created."
- ✅ Redirected to home page
- ✅ Header shows: Home | About | Analyzer | Profile
- ✅ **NO** "Admin" link (regular user)

---

### Step 4: Test Admin Login

1. Click **"Profile"** → **"Logout"**
2. Click **"Login/Register"**
3. Login with admin credentials:
   - Email: `admin@react-super-app.local`
   - Password: `Admin123!`
4. Click **"Login"**

**Expected Results**:
- ✅ Success toast: "Welcome back, System Admin!"
- ✅ Header shows: Home | About | Analyzer | Profile | **Admin** (gold/bold)
- ✅ Left sidebar also shows **"⚙️ Admin"** link

---

### Step 5: Test Admin Dashboard

1. Click **"Admin"** in the header or sidebar
2. You should see the Admin Dashboard

**Expected Results**:
- ✅ Page title: "Admin Dashboard"
- ✅ Welcome message: "Welcome, System Admin"
- ✅ Four cards:
  - **User Management** (clickable) ✅
  - Analytics (coming soon) 🚧
  - System Settings (coming soon) 🚧
  - Audit Logs (coming soon) 🚧
- ✅ Security and Audit Trail info boxes

---

### Step 6: Test User Management

1. Click **"User Management"** card
2. You should see a list of users

**Expected Results**:
- ✅ Table with columns: Name, Email, Role, Status, Last Login, Created, Actions
- ✅ Two users visible:
  - System Admin (admin, active)
  - Test User (user, active)
- ✅ Filters: Search, Role, Status, Per Page
- ✅ Sortable columns (click headers to sort)
- ✅ Pagination controls at bottom

---

### Step 7: Test User Filtering

1. **Filter by Role**:
   - Select "Admin" from Role dropdown
   - Should show only System Admin

2. **Filter by Status**:
   - Select "Active" from Status dropdown
   - Should show all active users

3. **Search**:
   - Type "test" in search box
   - Should show only Test User

4. **Clear Filters**:
   - Reset all dropdowns to "All"
   - Should show all users again

---

### Step 8: Test User Editing (Without Elevated Session)

1. Click the **✏️ (edit)** button next to "Test User"
2. The User Edit Modal should open

**Expected Results**:
- ✅ Modal shows user info: Name, Email, Created, Last Login
- ✅ Three sections:
  - Role (dropdown: User/Admin)
  - Account Status (dropdown: Active/Inactive)
  - Reset Password (two password fields)
- ✅ Warning box about elevated privileges
- ✅ "Cancel" and "Save Changes" buttons

3. Change the role from "User" to "Admin"
4. Click **"Save Changes"**

**Expected Results**:
- ✅ **Admin Auth Modal** appears
- ✅ Prompt: "This action requires elevated privileges. Please enter your admin password to continue."
- ✅ Password input field
- ✅ "Cancel" and "Authenticate" buttons

---

### Step 9: Test Elevated Session Authentication

1. In the Admin Auth Modal, enter your admin password: `Admin123!`
2. Click **"Authenticate"**

**Expected Results**:
- ✅ Success toast: "Elevated session granted (15 minutes)"
- ✅ Modal closes
- ✅ User role is updated
- ✅ Success toast: "User role updated successfully"
- ✅ User Management page refreshes
- ✅ Test User now shows "admin" role badge

---

### Step 10: Test Elevated Session Persistence

1. Click the **✏️** button next to "Test User" again
2. Change the status from "Active" to "Inactive"
3. Click **"Save Changes"**

**Expected Results**:
- ✅ **NO** Admin Auth Modal (elevated session still valid)
- ✅ Success toast: "User account deactivated successfully"
- ✅ Test User now shows "Inactive" status badge

---

### Step 11: Test Password Reset

1. Click the **✏️** button next to "Test User"
2. Scroll to "Reset Password" section
3. Enter:
   - New Password: `NewTest123!@#`
   - Confirm Password: `NewTest123!@#`
4. Click **"Save Changes"**

**Expected Results**:
- ✅ Success toast: "Password reset successfully"
- ✅ Password fields are cleared
- ✅ Modal stays open (in case you want to make more changes)

---

### Step 12: Test Self-Edit Protection

1. Click the **✏️** button next to "System Admin" (yourself)
2. Try to change your own role or status

**Expected Results**:
- ✅ Role dropdown is **disabled**
- ✅ Status dropdown is **disabled**
- ✅ Note: "You cannot change your own role"
- ✅ Note: "You cannot change your own status"
- ✅ Password reset still works (you can change your own password)

---

### Step 13: Test Non-Admin Access

1. Logout from admin account
2. Login as "Test User" (if you didn't deactivate them):
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Try to access http://localhost:3000/admin directly

**Expected Results**:
- ✅ Redirected to home page
- ✅ **NO** "Admin" link in header/sidebar
- ✅ Cannot access admin pages

---

### Step 14: Test Deactivated Account

1. Logout from Test User
2. Login as admin again
3. Go to User Management
4. Reactivate Test User (if you deactivated them):
   - Click ✏️ on Test User
   - Change status to "Active"
   - Save
5. Logout
6. Try to login as Test User (if account was deactivated)

**Expected Results** (if account was deactivated):
- ❌ Error: "Account has been deactivated. Please contact support."
- ❌ Cannot login

**Expected Results** (after reactivation):
- ✅ Can login successfully

---

### Step 15: Test Sorting

1. Login as admin
2. Go to User Management
3. Click on different column headers:
   - **Name** (A-Z, then Z-A)
   - **Email** (A-Z, then Z-A)
   - **Role** (admin first, then user first)
   - **Last Login** (newest first, then oldest first)
   - **Created** (newest first, then oldest first)

**Expected Results**:
- ✅ Table re-sorts on each click
- ✅ Arrow indicator (↑ or ↓) shows sort direction
- ✅ Data loads quickly (< 1 second)

---

### Step 16: Test Pagination

1. Create more test users (optional):
   ```bash
   # In PostgreSQL shell
   npm run db:shell
   
   INSERT INTO users (name, email, password_hash, role)
   VALUES 
     ('User 1', 'user1@example.com', '$2b$10$hash', 'user'),
     ('User 2', 'user2@example.com', '$2b$10$hash', 'user'),
     ('User 3', 'user3@example.com', '$2b$10$hash', 'user');
   ```

2. In User Management:
   - Change "Per Page" to 2
   - Click "Next" and "Previous" buttons

**Expected Results**:
- ✅ Shows 2 users per page
- ✅ Pagination info updates: "Showing 1 to 2 of X users"
- ✅ "Previous" disabled on first page
- ✅ "Next" disabled on last page

---

## 🐛 Common Issues & Solutions

### Issue 1: Migration fails with "relation already exists"

**Solution**: Migration was already run. To re-run:
```bash
# Connect to database
npm run db:shell

# Drop and recreate (WARNING: deletes all data)
DROP TABLE IF EXISTS user_auth_logs, companies, recruiters, resumes, cover_letters, job_description_sources CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS role CASCADE;
ALTER TABLE job_descriptions DROP COLUMN IF EXISTS source_id CASCADE;

# Exit and re-run migration
\q
npm run db:migrate:001
```

---

### Issue 2: "Cannot connect to database"

**Solution**: Make sure Docker is running:
```bash
# Check Docker status
docker ps

# If not running, start services
docker-compose up -d
```

---

### Issue 3: Admin login fails with "Invalid email or password"

**Solution**: Check if admin user exists:
```bash
npm run db:shell
SELECT email, role FROM users WHERE role = 'admin';
```

If no admin user, re-run migration:
```bash
npm run db:migrate:001
```

---

### Issue 4: "Elevated session expired" immediately

**Solution**: Check system time synchronization. Elevated sessions use timestamps.

---

### Issue 5: Admin Auth Modal doesn't appear

**Solution**: Check browser console for errors. Make sure:
1. Backend is running on port 3001
2. CORS is configured correctly
3. JWT_SECRET is set in server/.env

---

## 📊 Backend API Testing (Optional)

### Test Admin Endpoints with curl

```bash
# 1. Login as admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@react-super-app.local","password":"Admin123!"}'

# Save the token from response
TOKEN="your-jwt-token-here"

# 2. List users
curl http://localhost:3001/api/admin/users \
  -H "Authorization: Bearer $TOKEN"

# 3. Get elevated session
curl -X POST http://localhost:3001/api/admin/verify-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password":"Admin123!"}'

# Save the elevated token
ELEVATED_TOKEN="your-elevated-token-here"

# 4. Change user role
curl -X PUT http://localhost:3001/api/admin/users/USER_ID/role \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Elevated-Token: $ELEVATED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

---

## ✅ Testing Checklist

- [ ] Database migration runs successfully
- [ ] Admin user can login
- [ ] Regular user can register
- [ ] Admin sees "Admin" link in navigation
- [ ] Regular user does NOT see "Admin" link
- [ ] Admin Dashboard loads correctly
- [ ] User Management shows all users
- [ ] Filters work (search, role, status)
- [ ] Sorting works (all columns)
- [ ] Pagination works
- [ ] User Edit Modal opens
- [ ] Admin Auth Modal prompts for password
- [ ] Elevated session is granted after authentication
- [ ] Role change works
- [ ] Status change works
- [ ] Password reset works
- [ ] Cannot edit own role/status
- [ ] Deactivated users cannot login
- [ ] Non-admin users cannot access admin pages
- [ ] All actions are logged (check user_auth_logs table)

---

## 🎉 Success Criteria

If all items in the checklist pass, your RBAC system is working correctly!

**Next Steps**:
1. Change the default admin password
2. Create additional admin users if needed
3. Set up automated tests (see TESTING_GUIDE.md)
4. Move to Phase 2 (Submissions & Tracking)

---

**Last Updated**: 2024-12-01  
**Version**: 1.0.0 (Phase 1 Complete)

