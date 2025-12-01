# 🗄️ Database Schema Documentation

## Overview

This document describes the complete PostgreSQL database schema for the React Super App job search tracking system.

---

## 📊 High-Level Objects in PostgreSQL

### **Phase 1: Foundation with RBAC (7 objects)** ✅

| # | Object | Purpose | Status |
|---|--------|---------|--------|
| 1 | **Users** | Application users with role-based access | ✅ Enhanced |
| 2 | **User Auth Logs** | Audit trail for authentication and admin actions | ✅ New |
| 3 | **Companies** | Organizations offering jobs | ✅ New |
| 4 | **Recruiters** | Recruiting contacts | ✅ New |
| 5 | **Resumes** | Resume versions tracking | ✅ New |
| 6 | **Cover Letters** | Cover letter versions | ✅ New |
| 7 | **Job Description Sources** | Where JDs came from | ✅ New |
| 8 | **Job Descriptions** | Job postings (enhanced) | ✅ Enhanced |

### **Phase 2: Submissions & Tracking (3 objects)** 🔄 *Next*
| # | Object | Purpose | Status |
|---|--------|---------|--------|
| 9 | **Submissions** | Application submissions | 🔄 Planned |
| 10 | **Responses** | Company/recruiter responses | 🔄 Planned |
| 11 | **Interviews** | Interview appointments | 🔄 Planned |

### **Phase 3: Advanced Features (3 objects)** 🔮 *Future*
| # | Object | Purpose | Status |
|---|--------|---------|--------|
| 12 | **Interview Attendees** | Who attended interviews | 🔮 Future |
| 13 | **Thank You Messages** | Post-interview communications | 🔮 Future |
| 14 | **Skills** | Skill tracking and analysis | 🔮 Future |

---

## 🔐 **RBAC (Role-Based Access Control)**

### **User Roles**
- **`admin`**: Full system access including user management
- **`user`**: Standard user access to own data only

### **Admin Privileges**
✅ List all users (with filters, sorting, pagination)
✅ Update user roles (user ↔ admin)
✅ Reset user passwords
✅ Activate/deactivate users
✅ View user activity logs
❌ Cannot delete users (soft delete only via is_active)

### **User Privileges**
✅ Full CRUD on own data (job descriptions, resumes, etc.)
✅ View own profile
✅ Update own profile (name, email, password)
❌ Cannot access other users' data
❌ Cannot access admin endpoints

### **Admin Authentication for Sensitive Operations**
- Admin must re-authenticate with password before:
  - Changing user roles
  - Resetting user passwords
  - Viewing sensitive user data
- Elevated session expires after 15 minutes
- All admin actions logged in `user_auth_logs`

---

## 📋 **Detailed Schema Descriptions**

### **1. Users** 👤

**Purpose**: Application users with role-based access control

**Schema**:
```sql
users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Key Features**:
- Self-registration creates 'user' role by default
- First admin created via seed script
- Audit trail (created_by, updated_by)
- Soft delete via is_active flag

**Indexes**:
- email (unique, for login)
- role (for admin queries)
- is_active (for filtering)
- last_login_at (for activity tracking)

---

### **2. User Auth Logs** 📝

**Purpose**: Audit trail for all authentication events and admin actions

**Schema**:
```sql
user_auth_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    failure_reason TEXT,
    performed_by UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP
)
```

**Tracked Actions**:
- `login` - Successful login
- `logout` - User logout
- `failed_login` - Failed login attempt
- `password_change` - User changed own password
- `password_reset` - Admin reset user password
- `role_change` - Admin changed user role
- `account_deactivated` - Admin deactivated user
- `account_activated` - Admin activated user

**Key Features**:
- Immutable (no updates/deletes)
- Tracks who performed admin actions
- Stores additional context in JSONB metadata
- IP address and user agent for security

**Use Cases**:
- Admin audit trail
- Security monitoring
- User activity tracking
- Compliance reporting

---

### **3. Companies** 🏢

**Purpose**: Organizations offering jobs (user-specific records)

**Schema**:
```sql
companies (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    website VARCHAR(500),
    headquarters_location VARCHAR(255),
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    user_rating INTEGER CHECK (1-5),
    glassdoor_rating DECIMAL(2,1),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Key Features**:
- User-specific (each user maintains their own company records)
- User can rate companies (1-5 stars)
- Optional Glassdoor rating for reference
- Notes for personal observations

**Relationships**:
- Has many Job Descriptions
- Has many Recruiters (who work at this company)

**Objectives Addressed**:
- ✅ Track companies
- ✅ Link JDs to companies
- ✅ Identify duplicate JDs from same company

---

### **4. Recruiters** 👔

**Purpose**: Recruiting contacts and hiring managers

**Schema**:
```sql
recruiters (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company_id UUID REFERENCES companies(id),
    recruiter_type VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    linkedin_url VARCHAR(500),
    notes TEXT,
    user_rating INTEGER CHECK (1-5),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Recruiter Types**:
- `internal_hr` - Company HR department
- `external_agency` - Third-party recruiting agency
- `hiring_manager` - Direct hiring manager
- `independent` - Independent recruiter
- `headhunter` - Executive search

**Key Features**:
- Can be linked to company or independent
- Track effectiveness via user rating
- is_active flag to track if still working with them

**Relationships**:
- Belongs to Company (optional)
- Has many Job Descriptions (as source)

**Objectives Addressed**:
- ✅ How did we get the JD? (via recruiter)
- ✅ Track recruiter effectiveness

---

### **5. Job Description Sources** 🔍

**Purpose**: Track where job descriptions originated

**Schema**:
```sql
job_description_sources (
    id UUID PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    source_url TEXT,
    created_at TIMESTAMP
)
```

**Source Types**:
- `linkedin` - LinkedIn Jobs
- `indeed` - Indeed.com
- `glassdoor` - Glassdoor
- `company_website` - Direct from company site
- `recruiter` - From a recruiter
- `referral` - Employee referral
- `job_board` - Other job boards
- `email` - Email notification
- `other` - Other sources

**Key Features**:
- Pre-seeded with common sources
- Immutable reference data
- Can be extended by users

**Objectives Addressed**:
- ✅ How did we get the JD?
- ✅ Track source effectiveness

---

### **6. Resumes** 📄

**Purpose**: Track resume versions and which was used for each submission

**Schema**:
```sql
resumes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(50),
    file_size_bytes INTEGER,
    is_active BOOLEAN DEFAULT true,
    version_number INTEGER DEFAULT 1,
    content_summary TEXT,
    skills_highlighted TEXT[],
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Key Features**:
- Multiple resume versions per user
- Track which is active/current
- Store file metadata
- Optional content extraction for analysis
- Track emphasized skills

**Use Cases**:
- "Which resume did I use for Google application?"
- "What skills are in my consulting resume?"
- "Show me all applications using Resume v3"

**Objectives Addressed**:
- ✅ Which Resume was Submitted with a JD?
- ✅ Track resume versions

---

### **7. Cover Letters** 📝

**Purpose**: Track cover letter versions and templates

**Schema**:
```sql
cover_letters (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_name VARCHAR(255),
    file_path TEXT,
    file_type VARCHAR(50),
    is_template BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Key Features**:
- Store as text or file reference
- Mark as template for reuse
- Track which is active/current

**Use Cases**:
- "Which cover letter did I use for Amazon?"
- "Show me my tech startup template"
- "How many times did I use this cover letter?"

**Objectives Addressed**:
- ✅ Which CoverLetter was Submitted with a JD?
- ✅ Track cover letter versions

---

### **8. Job Descriptions** 📋 *Enhanced*

**Purpose**: Job postings with comprehensive tracking and duplicate detection

**Schema**:
```sql
job_descriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Source tracking
    source_id UUID REFERENCES job_description_sources(id),
    company_id UUID REFERENCES companies(id),
    recruiter_id UUID REFERENCES recruiters(id),
    
    -- Job details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    job_type VARCHAR(50) DEFAULT 'full_time',
    remote_policy VARCHAR(50) DEFAULT 'onsite',
    
    -- Compensation
    salary_range_min DECIMAL(12,2),
    salary_range_max DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    consulting_rate VARCHAR(100),
    consulting_period VARCHAR(100),
    
    -- Contact and additional info
    contact_info TEXT,
    job_info TEXT,
    
    -- Analysis
    keywords TEXT[],
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'saved',
    
    -- Dates
    date_posted DATE,
    date_found DATE DEFAULT CURRENT_DATE,
    application_deadline DATE,
    
    -- Duplicate detection
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of_id UUID REFERENCES job_descriptions(id),
    similarity_score DECIMAL(3,2),
    
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

**Status Values**:
- `saved` - Saved for later review
- `interested` - Interested, planning to apply
- `applied` - Application submitted
- `interviewing` - In interview process
- `offered` - Received job offer
- `rejected` - Application rejected
- `withdrawn` - User withdrew application
- `accepted` - User accepted offer

**Duplicate Detection**:
- Manual marking by user
- Automatic detection (future feature)
- Links to original JD
- Stores similarity score

**Objectives Addressed**:
- ✅ How did we get the JD? (source_id, recruiter_id)
- ✅ Which JDs are duplicates? (is_duplicate, duplicate_of_id)
- ✅ Track JD through entire pipeline (status)

---

## 🔗 **Relationships Summary**

```
User (1) ────┬──── (many) Job Descriptions
             │              ├── (1) Source
             │              ├── (1) Company
             │              └── (1) Recruiter (optional)
             │
             ├──── (many) Companies
             │
             ├──── (many) Recruiters
             │              └── (1) Company (optional)
             │
             ├──── (many) Resumes
             │
             └──── (many) Cover Letters

Admin User ──┬──── (performs) User Management Actions
             │              └── (logged in) User Auth Logs
             │
             └──── (views) All Users (via admin_users_view)
```

---

## 🎯 **Objectives Addressed in Phase 1**

| Objective | Solution | Status |
|-----------|----------|--------|
| How did we get the JD? | `source_id` + `recruiter_id` in job_descriptions | ✅ |
| Which JDs are duplicates? | `is_duplicate` + `duplicate_of_id` fields | ✅ |
| Which Resume was submitted? | *Phase 2: Submissions table* | 🔄 Next |
| Which Cover Letter was submitted? | *Phase 2: Submissions table* | 🔄 Next |
| Which Submissions had responses? | *Phase 2: Responses table* | 🔄 Next |
| Which FollowUpMeetings scheduled? | *Phase 2: Interviews table* | 🔄 Next |
| Who attended meetings? | *Phase 3: Interview Attendees table* | 🔮 Future |
| Thank you emails sent? | *Phase 3: Thank You Messages table* | 🔮 Future |

---

## 🔒 **Security & Access Control**

### **Row-Level Security (RLS)**

Users can only access their own data:
```sql
-- Example: Users can only see their own job descriptions
SELECT * FROM job_descriptions WHERE user_id = current_user_id;
```

### **Admin Access**

Admins can:
- View all users (via `admin_users_view`)
- Update user roles (with re-authentication)
- Reset passwords (with re-authentication)
- View audit logs

Admins cannot:
- Access other users' job search data (companies, JDs, resumes)
- Delete users (only deactivate)
- Bypass audit logging

---

## 📊 **Database Views**

### **admin_users_view**
Provides admin with user overview including:
- User details (name, email, role, status)
- Activity (last login)
- Data counts (JDs, resumes, cover letters)
- Audit info (who created/updated)

**Usage**:
```sql
SELECT * FROM admin_users_view 
WHERE role = 'user' 
  AND is_active = true
ORDER BY last_login_at DESC
LIMIT 50 OFFSET 0;
```

---

## 🔍 **Indexes for Performance**

### **Users Table**:
- `idx_users_email` - Login queries
- `idx_users_role` - Admin user filtering
- `idx_users_is_active` - Active user filtering
- `idx_users_last_login` - Activity sorting

### **Job Descriptions Table**:
- `idx_job_descriptions_user_id` - User's JDs
- `idx_job_descriptions_source_id` - Filter by source
- `idx_job_descriptions_company_id` - Filter by company
- `idx_job_descriptions_recruiter_id` - Filter by recruiter
- `idx_job_descriptions_status` - Filter by status
- `idx_job_descriptions_is_duplicate` - Find duplicates
- `idx_job_descriptions_date_found` - Sort by date

### **Companies, Recruiters, Resumes, Cover Letters**:
- All have `user_id` index for fast user data retrieval
- Additional indexes on frequently queried fields

---

## 🚀 **Migration Strategy**

### **Current State**:
```sql
users (id, name, email, password_hash, created_at, updated_at)
job_descriptions (id, user_id, title, company, description, keywords, created_at, updated_at)
```

### **Migration 001**:
- Enhance users table (add role, is_active, etc.)
- Create 6 new tables
- Enhance job_descriptions table
- Seed admin user
- Seed common sources

### **Rollback Plan**:
```sql
-- If needed, can rollback by:
-- 1. Drop new columns from users
-- 2. Drop new tables
-- 3. Restore from backup
```

---

## 📈 **Expected Data Growth**

### **Typical User (Active Job Seeker)**:
- 1 User
- 3-5 Resumes (different versions)
- 2-3 Cover Letters (templates)
- 20-50 Job Descriptions saved
- 10-20 Companies tracked
- 5-15 Recruiters in network

### **Database Size Estimates**:
- 100 users: ~5-10 MB
- 1,000 users: ~50-100 MB
- 10,000 users: ~500 MB - 1 GB

---

## 🔧 **Next Steps**

1. ✅ Run migration 001
2. ✅ Test schema with sample data
3. ✅ Create backend API endpoints
4. ✅ Update frontend components
5. 🔄 Phase 2: Add Submissions, Responses, Interviews

---

## 📚 **Related Documentation**

- [Storage Guide](./STORAGE_GUIDE.md) - Current storage implementation
- [Testing Guide](./TESTING_GUIDE.md) - Database testing
- [Getting Started](./GETTING_STARTED.md) - Database setup

---

**Last Updated**: 2024-12-01  
**Schema Version**: 1.0.0 (Phase 1)

