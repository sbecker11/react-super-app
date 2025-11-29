# User Session Storage Guide

## 🚨 Critical Security Rules

### ❌ NEVER Store:
- **Passwords** - Never store passwords in browser storage (localStorage, sessionStorage, or cookies)
- **Plain text credentials** - Always use encrypted/hashed tokens instead

### ✅ Safe to Store:
- **Authentication tokens** (JWT, session tokens) - Store securely
- **User ID** - Can be stored (non-sensitive)
- **User name/display name** - Can be stored (non-sensitive)
- **User email** - Can be stored (non-sensitive)

---

## Storage Options Comparison

### 1. **localStorage** (Persistent Storage)
- **Persistence**: Survives browser restart, persists until explicitly cleared
- **Scope**: Domain-specific, accessible across tabs
- **Security**: ❌ Accessible via JavaScript, vulnerable to XSS attacks
- **Best for**: Non-sensitive user preferences, user ID, display name

### 2. **sessionStorage** (Session Storage)
- **Persistence**: Cleared when tab/window closes
- **Scope**: Tab-specific (not shared across tabs)
- **Security**: ❌ Accessible via JavaScript, vulnerable to XSS attacks
- **Best for**: Temporary session data, form drafts

### 3. **Cookies** (HTTP-only Cookies)
- **Persistence**: Configurable expiration, can be persistent or session-based
- **Scope**: Automatically sent with HTTP requests
- **Security**: ✅ Can be httpOnly (not accessible via JavaScript) - **MOST SECURE**
- **Best for**: Authentication tokens, session IDs

### 4. **Server-Side Sessions**
- **Persistence**: Stored on server, referenced by session ID in cookie
- **Scope**: Application-wide
- **Security**: ✅ Most secure, data never leaves server
- **Best for**: Production applications with sensitive data

---

## Recommended Approach for Your React App

### **Best Practice: JWT Token Authentication**

```
┌─────────────────────────────────────────────────────────┐
│ 1. User submits login form                             │
│    → Password sent to server (HTTPS only)              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Server validates credentials                        │
│    → Hashes password, compares with database           │
│    → Generates JWT token with user data                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Server sends JWT token in httpOnly cookie           │
│    (Option A) OR returns token in response body        │
│    (Option B)                                          │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌──────────────┐   ┌──────────────────────┐
│ Option A:    │   │ Option B:            │
│ httpOnly     │   │ localStorage +       │
│ Cookie       │   │ Manual token         │
│ (Most        │   │ management           │
│  Secure)     │   │                      │
└──────────────┘   └──────────────────────┘
```

---

## Implementation Options

### **Option 1: httpOnly Cookies (RECOMMENDED for Production)**

**Pros:**
- ✅ Most secure - not accessible via JavaScript
- ✅ Automatically sent with requests
- ✅ Protected from XSS attacks

**Cons:**
- ⚠️ Requires server-side cookie handling
- ⚠️ More complex setup

**Implementation:**
```javascript
// Server sets cookie:
// Set-Cookie: authToken=xxx; HttpOnly; Secure; SameSite=Strict

// Client: Just send requests, cookie sent automatically
fetch('/api/user/profile', {
  credentials: 'include' // Include cookies
});
```

---

### **Option 2: JWT Token in localStorage (Common for SPAs)**

**Pros:**
- ✅ Simple implementation
- ✅ Works well with React
- ✅ No server cookie configuration needed

**Cons:**
- ⚠️ Vulnerable to XSS attacks
- ⚠️ Must manually attach token to requests
- ⚠️ Requires careful XSS prevention

**Implementation:**
```javascript
// After successful login:
const { token, user } = await login(credentials);
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify({
  id: user.id,
  name: user.name,
  email: user.email
}));

// In API requests:
const token = localStorage.getItem('authToken');
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### **Option 3: Hybrid Approach (RECOMMENDED for Development)**

Store:
- **JWT Token** in localStorage (for API requests)
- **User data** (id, name, email) in localStorage (for UI display)
- **NEVER store password**

**Security Measures:**
1. Use HTTPS in production
2. Set short token expiration times
3. Implement token refresh mechanism
4. Sanitize all user inputs (prevent XSS)
5. Use Content Security Policy (CSP) headers

---

## Recommended Implementation for Your App

### Step 1: Create Authentication Service

```javascript
// src/services/authService.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
  // Login - send credentials, receive token
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    
    // Store token
    localStorage.setItem('authToken', data.token);
    
    // Store user data (without password!)
    localStorage.setItem('user', JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email
    }));
    
    return data.user;
  }
  
  // Register - send user data, receive token
  async register(name, email, password) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    const data = await response.json();
    
    // Store token and user data
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify({
      id: data.user.id,
      name: data.user.name,
      email: data.user.email
    }));
    
    return data.user;
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
  
  // Update user data in localStorage (after profile update)
  updateUser(userData) {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }
}

export default new AuthService();
```

---

### Step 2: Create Auth Context (React Context API)

```javascript
// src/contexts/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Load user from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    return userData;
  };
  
  const register = async (name, email, password) => {
    const userData = await authService.register(name, email, password);
    setUser(userData);
    return userData;
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const updateUser = (userData) => {
    authService.updateUser(userData);
    setUser(authService.getCurrentUser());
  };
  
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

### Step 3: Update LoginRegister Component

```javascript
// src/components/LoginRegister.js
// Add this to handleSubmit:

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  // ... existing state ...
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await validationSchema.validate(profileData, { abortEarly: false });
      
      // Clear errors
      setErrors({});
      
      try {
        // Call registration/login API
        if (isRegisterMode) {
          await register(profileData.name, profileData.email, profileData.password);
        } else {
          await login(profileData.email, profileData.password);
        }
        
        // Navigate to home or dashboard
        navigate('/home');
      } catch (authError) {
        setErrors({ submit: authError.message });
      }
    } catch (validationErrors) {
      // ... existing validation error handling ...
    }
  };
  
  // ... rest of component ...
};
```

---

### Step 4: Protected Routes

```javascript
// src/components/ProtectedRoute.js

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login-register" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

---

## Storage Schema

### What to Store in localStorage:

```javascript
{
  // JWT Token (from server)
  authToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // User data (without password!)
  user: {
    id: "123",
    name: "John Doe",
    email: "john@example.com"
  }
}
```

### What NOT to Store:
- ❌ `password` - Never store passwords
- ❌ `passwordHash` - Not needed client-side
- ❌ `refreshToken` - Use httpOnly cookie instead

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Token Expiration**: Set short expiration times (15-30 minutes)
3. **Token Refresh**: Implement refresh token mechanism
4. **XSS Prevention**: 
   - Sanitize all user inputs
   - Use Content Security Policy (CSP)
   - Avoid `dangerouslySetInnerHTML`
5. **CSRF Protection**: Use SameSite cookies or CSRF tokens
6. **Password Hashing**: Server should hash passwords (bcrypt, argon2)
7. **Rate Limiting**: Implement on login/register endpoints

---

## Summary

**For your React app, I recommend:**

1. ✅ Store JWT token in `localStorage`
2. ✅ Store user data (id, name, email) in `localStorage`
3. ❌ NEVER store password in browser
4. ✅ Use React Context API for auth state management
5. ✅ Implement protected routes
6. ✅ Add token refresh mechanism
7. ✅ Use HTTPS in production

**Next Steps:**
1. Create `src/services/authService.js`
2. Create `src/contexts/AuthContext.js`
3. Wrap App with `AuthProvider`
4. Update LoginRegister component
5. Create ProtectedRoute component
6. Set up backend API for authentication

