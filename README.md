# 🏛️ GS Enrollment Analytics & AI Co-Pilot

A **full-stack student CRM platform** designed for higher education enrollment management, built with modern technologies and AI-powered analytics. Specifically tailored for tracking non-traditional, transfer, and first-generation students through their complete lifecycle—from prospect to alumni.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Development Phases](#development-phases)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## 🎯 Project Overview

### What This Project Does

**GS Enrollment Analytics & AI Co-Pilot** is a comprehensive student relationship management (CRM) system designed for higher education enrollment management. It replaces fragmented spreadsheets and manual reporting with:

1. **Centralized Student Data Management** — Track students from first prospect contact through enrollment and beyond
2. **AI-Powered Analytics** — Ask natural language questions and get intelligent SQL queries + interactive charts
3. **Enrollment Intelligence** — Monitor real-time KPIs, yield rates, cohort analytics, and enrollment trends
4. **Routine Reporting Automation** — Create, save, and auto-generate standard enrollment reports
5. **Multi-Institutional Support** — Manage multiple institutions, programs, and terms from one platform

### Problem Statement

Columbia University School of General Studies (and similar institutions) track student data across multiple systems:
- **Slate** for admissions
- **Salesforce Advisor Link** for advising
- **Crystal Reports** for routine reporting
- **Spreadsheets** for ad-hoc analysis

This project consolidates that fragmented data into a unified, modern platform with AI-assisted reporting capabilities.

### Target Users

- **Admissions Professionals** — Track applications, manage yield, monitor acceptance rates
- **Advisors & Staff** — Access student profiles, interaction history, term records
- **Data Analysts** — Generate custom reports using natural language queries
- **Institution Leadership** — Monitor cohort trends, enrollment patterns, and key metrics

---

## ✨ Key Features

### 1. **Student Lifecycle Tracking**
- Track students through complete lifecycle: Prospect → Applicant → Admitted → Committed → Enrolled → Alumni
- Maintain unified person record throughout all stages
- Support for non-traditional, transfer, and first-generation student classifications

### 2. **Authentication & Access Control**
- Microsoft Entra ID (Azure AD) OAuth 2.0 integration
- Supabase JWT token management
- Role-based access control (Admin, Analyst, Staff, Faculty, Viewer)
- Multi-institution user memberships

### 3. **Comprehensive Dashboard**
- **Overview** — High-level KPIs and enrollment metrics
- **Student Roster** — Searchable, filterable student database
- **Admissions Analytics** — Yield analysis, acceptance rates, cohort tracking
- **Advising Management** — Interaction logs, task tracking, communication history
- **AI SQL Co-Pilot** — Text-to-SQL natural language query interface
- **Reports & Audits** — Degree audits, routine reporting, enrollment summaries
- **Administration** — User access control, institution settings
- **Profile Management** — User account settings and preferences

### 4. **Database Schema** (10 Core Entities)
See [Database Schema](#database-schema) section below for detailed design.

### 5. **RESTful API**
- Full CRUD operations on all entities
- Advanced filtering and search capabilities
- Async/await architecture for performance
- Bearer token authentication on all endpoints

### 6. **AI-Powered Analytics** (Planned)
- LangChain/LangGraph orchestration
- Text-to-SQL query generation
- Dynamic chart configuration
- Save and reuse AI-generated reports

---

## 🛠️ Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| **Framework** | FastAPI (Python 3.13) |
| **ORM** | SQLAlchemy 2.x (async) |
| **Database** | PostgreSQL (Supabase) |
| **Migrations** | Alembic |
| **Authentication** | Supabase Auth + Supabase JWT |
| **Async Driver** | asyncpg |
| **API Schema** | Pydantic v2 |

### Frontend
| Component | Technology |
|-----------|-----------|
| **Framework** | React 19.2.4 |
| **Build Tool** | Vite 8.2.0 |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Authentication** | Supabase Auth SDK |
| **Auth Provider** | Microsoft Entra ID (Azure AD) |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| **Database** | Supabase PostgreSQL |
| **Auth** | Supabase Auth + Microsoft Entra ID |
| **Hosting** | Ready for Docker/Cloud deployment |

---

## 🗄️ Database Schema

### Overview

The database consists of **10 core entities** organized into 5 functional areas:

```
1. Organization & System Users
   ├── institutions
   ├── users
   └── institution_memberships

2. Academic Structure
   ├── programs
   └── academic_terms

3. People & Student Records
   ├── people
   ├── student_profiles
   ├── applications
   └── student_term_records

4. CRM Activity
   └── interactions

5. Classifications
   └── (tags & person_tags - pending implementation)
```

### Core Entities

#### 1. **Institutions**
University/College organization records.

```sql
CREATE TABLE institutions (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,        -- "Columbia University"
    code VARCHAR(10) UNIQUE,            -- "CU"
    timezone VARCHAR(50),               -- "America/New_York"
    created_at TIMESTAMPTZ
);
```

**Purpose:** Multi-tenant support for different institutions using the platform.

---

#### 2. **Users**
CRM system users (staff, advisors, administrators).

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    preferred_first_name VARCHAR(50),
    created_at TIMESTAMPTZ
);
```

**Purpose:** Employees who *use* the CRM system.
**Key Distinction:** Different from `people` table (prospective/enrolled students).

---

#### 3. **Institution Memberships**
User-Institution relationships with role assignments.

```sql
CREATE TABLE institution_memberships (
    institution_id UUID,
    user_id UUID,
    role VARCHAR(50),                  -- Admin, Analyst, Staff, Faculty, Viewer
    created_at TIMESTAMPTZ,
    PRIMARY KEY (institution_id, user_id)
);
```

**Purpose:** Enables multi-institution staff access with role-based permissions.

---

#### 4. **Programs**
Degree programs offered by institutions.

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,        -- "B.S. Computer Science"
    code VARCHAR(20),                  -- "CS101"
    degree_type VARCHAR(50),           -- Bachelor, Masters, PhD
    description TEXT,
    created_at TIMESTAMPTZ
);
```

**Purpose:** Define all degree programs; links to applications and enrollments.

---

#### 5. **Academic Terms**
Semesters, quarters, sessions (e.g., Fall 2025, Spring 2026).

```sql
CREATE TABLE academic_terms (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    term_code VARCHAR(20),             -- "FA2025"
    term_name VARCHAR(100),            -- "Fall 2025"
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    enrollment_deadline DATE,
    created_at TIMESTAMPTZ
);
```

**Purpose:** Organize all data by academic term for cohort analysis.

---

#### 6. **People**
Core student/prospect records. **One record per person throughout their lifecycle.**

```sql
CREATE TABLE people (
    id UUID PRIMARY KEY,
    institution_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    
    -- Lifecycle stage (prospect → applicant → admitted → enrolled → alumni)
    lifecycle_stage VARCHAR(50),
    
    -- Student classifications
    student_type VARCHAR(50),          -- First-Gen, Transfer, International, Veteran, Traditional
    enrollment_status VARCHAR(50),     -- Active, Graduated, Withdrawn, On Leave
    
    -- Contact & demographics
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    postal_code VARCHAR(10),
    country VARCHAR(100),
    
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Critical Design:** One `people` record tracks the entire lifecycle. `lifecycle_stage` changes over time, but the person row remains the same.

**Example:**
```
Emma Carter
lifecycle_stage = 'prospect'   (initial contact)
    ↓ (applies)
lifecycle_stage = 'applicant'   (application submitted)
    ↓ (admitted)
lifecycle_stage = 'admitted'    (decision rendered)
    ↓ (accepts offer)
lifecycle_stage = 'committed'   (commitment deposit)
    ↓ (starts class)
lifecycle_stage = 'enrolled'    (active student)
    ↓ (graduates)
lifecycle_stage = 'alumni'      (graduation)
```

---

#### 7. **Applications**
Admissions applications linking people to programs and terms.

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY,
    person_id UUID NOT NULL,
    program_id UUID NOT NULL,
    academic_term_id UUID NOT NULL,
    
    application_date DATE,
    submission_date DATE,
    
    -- Decision information
    application_status VARCHAR(50),    -- Submitted, Under Review, Decision Ready
    decision_status VARCHAR(50),       -- Accepted, Waitlisted, Denied, Withdrawn
    decision_date DATE,
    
    -- Academic credentials
    gpa NUMERIC(3,2),                  -- 3.65
    standardized_test_score NUMERIC(4,1),
    
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Purpose:** Track individual program applications per person per term.
**One-to-Many:** One person → multiple applications (different programs/terms).

---

#### 8. **Student Profiles**
Extended student academic data (only for enrolled students).

```sql
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY,
    person_id UUID UNIQUE NOT NULL,
    institution_id UUID NOT NULL,
    program_id UUID NOT NULL,
    
    entry_term_id UUID,                -- First enrolled term
    expected_graduation_term_id UUID,
    
    -- Academic standing
    cumulative_gpa NUMERIC(3,2),
    total_credits_earned NUMERIC(5,1),
    current_credits_enrolled NUMERIC(5,1),
    
    -- Status
    student_status VARCHAR(50),        -- Active, Good Standing, On Probation, Graduated
    academic_level VARCHAR(50),        -- Freshman, Sophomore, Junior, Senior
    
    major VARCHAR(100),
    minor VARCHAR(100),
    concentration VARCHAR(100),
    
    notes TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Purpose:** Detailed enrollment and academic progress data.
**One-to-One:** One person → one student profile (if enrolled).

---

#### 9. **Student Term Records**
Per-term academic performance and enrollment data.

```sql
CREATE TABLE student_term_records (
    id UUID PRIMARY KEY,
    person_id UUID NOT NULL,
    program_id UUID,
    academic_term_id UUID NOT NULL,
    
    term_gpa NUMERIC(3,2),             -- GPA for this specific term
    credits_earned NUMERIC(5,1),
    credits_enrolled NUMERIC(5,1),
    credits_transferred NUMERIC(5,1),
    
    enrollment_status VARCHAR(50),     -- Full-Time, Part-Time, Leave of Absence
    
    -- Academic standing
    academic_standing VARCHAR(50),     -- Good, Probation, Suspension
    dean_list BOOLEAN,
    
    notes TEXT,
    created_at TIMESTAMPTZ
);
```

**Purpose:** Historical academic performance data per term.
**One-to-Many:** One person → multiple term records (one per enrolled term).

---

#### 10. **Interactions**
CRM activity log (emails, calls, advising sessions, meetings).

```sql
CREATE TABLE interactions (
    id UUID PRIMARY KEY,
    person_id UUID NOT NULL,
    user_id UUID NOT NULL,             -- Staff member who recorded interaction
    
    interaction_type VARCHAR(50),      -- Email, Call, Meeting, Advising, Campus Visit
    interaction_date TIMESTAMP,
    
    subject VARCHAR(255),
    notes TEXT,
    
    -- Optional: Link to specific program/term if relevant
    program_id UUID,
    academic_term_id UUID,
    
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Purpose:** Complete audit trail of all CRM activity.
**One-to-Many:** One person → many interactions.

---

### Entity Relationship Diagram

```mermaid
erDiagram
    INSTITUTIONS ||--o{ USERS : memberships
    INSTITUTIONS ||--o{ PROGRAMS : offers
    INSTITUTIONS ||--o{ ACADEMIC_TERMS : defines
    INSTITUTIONS ||--o{ PEOPLE : tracks
    
    USERS ||--o{ INSTITUTION_MEMBERSHIPS : belongs_to
    
    PROGRAMS ||--o{ APPLICATIONS : "applied to"
    PROGRAMS ||--o{ STUDENT_PROFILES : "current program"
    PROGRAMS ||--o{ STUDENT_TERM_RECORDS : "enrollment in"
    
    ACADEMIC_TERMS ||--o{ APPLICATIONS : "application term"
    ACADEMIC_TERMS ||--o{ STUDENT_TERM_RECORDS : "academic term"
    ACADEMIC_TERMS ||--o{ STUDENT_PROFILES : "entry term"
    
    PEOPLE ||--o{ APPLICATIONS : submits
    PEOPLE ||--o{ STUDENT_PROFILES : has
    PEOPLE ||--o{ STUDENT_TERM_RECORDS : has
    PEOPLE ||--o{ INTERACTIONS : receives
    
    USERS ||--o{ INTERACTIONS : creates
```

---

## 📁 Project Structure

```
student-CRM/
├── backend/                          # FastAPI backend (Python)
│   ├── main.py                       # FastAPI app initialization
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables (Supabase, API keys)
│   ├── alembic/                      # Database migrations
│   │   ├── env.py                    # Migration environment
│   │   ├── alembic.ini               # Alembic configuration
│   │   └── versions/                 # Auto-generated migration files
│   │
│   └── app/
│       ├── auth/                     # Authentication
│       │   ├── auth.py               # JWT validation, get_current_user
│       │   └── supabase_client.py    # Supabase SDK init
│       │
│       ├── db/                       # Database layer
│       │   ├── base.py               # SQLAlchemy Base
│       │   ├── db.py                 # AsyncEngine, AsyncSession
│       │   └── __init__.py
│       │
│       ├── models/                   # Pydantic v2 models (10 entities)
│       │   ├── user.py
│       │   ├── institution.py
│       │   ├── program.py
│       │   ├── academic_term.py
│       │   ├── people.py
│       │   ├── student_profile.py
│       │   ├── application.py
│       │   ├── student_term_record.py
│       │   ├── interaction.py
│       │   ├── institution_membership.py
│       │   └── __init__.py
│       │
│       ├── schema/                   # SQLAlchemy models (10 ORM entities)
│       │   ├── user.py
│       │   ├── institutions.py
│       │   ├── programs.py
│       │   ├── academic_terms.py
│       │   ├── people.py
│       │   ├── students_profile.py
│       │   ├── applications.py
│       │   ├── student_term_records.py
│       │   ├── interactions.py
│       │   ├── institution_memberships.py
│       │   └── __init__.py
│       │
│       ├── routes/                   # API endpoints
│       │   ├── default.py            # GET /api/v1/
│       │   ├── auth.py               # GET /api/v1/auth/me
│       │   ├── users.py              # User CRUD endpoints
│       │   ├── institutions.py       # (pending)
│       │   ├── programs.py           # (pending)
│       │   └── __init__.py
│       │
│       └── services/                 # Business logic (pending)
│
├── frontend/                         # React + Vite frontend
│   ├── package.json                  # Dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── index.html                    # HTML entry point
│   ├── .env                          # Frontend environment variables
│   │
│   └── src/
│       ├── main.jsx                  # React app entry
│       ├── App.jsx                   # React Router setup
│       ├── index.css                 # Global styles + design tokens
│       │
│       ├── context/
│       │   └── AuthContext.jsx       # Global auth state management
│       │
│       ├── lib/
│       │   ├── apiClient.jsx         # Axios with Bearer token interceptor
│       │   └── supabaseClient.js     # Supabase SDK
│       │
│       ├── services/
│       │   └── AuthService.js        # Supabase OAuth methods
│       │
│       ├── models/
│       │   ├── user.js
│       │   └── default.js
│       │
│       ├── api/
│       │   ├── default.js
│       │   └── users.js
│       │
│       ├── pages/
│       │   ├── landing/              # Public landing page
│       │   │   ├── LandingPage.jsx
│       │   │   ├── Header.jsx
│       │   │   └── Footer.jsx
│       │   │
│       │   ├── auth/                 # Authentication pages
│       │   │   ├── LoginPage.jsx     # Microsoft Entra ID login
│       │   │   └── AuthCallbackPage.jsx
│       │   │
│       │   └── dashboard/            # Protected dashboard
│       │       ├── DashboardPage.jsx # Main dashboard container
│       │       ├── components/
│       │       │   ├── DashboardTopNav.jsx
│       │       │   ├── DashboardSidebar.jsx
│       │       │   └── DashboardTopNav.css
│       │       │
│       │       └── views/            # Dashboard tab views
│       │           ├── OverviewView.jsx
│       │           ├── ProfileView.jsx
│       │           ├── AdminView.jsx
│       │           ├── SettingsView.jsx
│       │           └── (5 pending views)
│       │
│       └── components/
│           ├── ProtectedRoute.jsx    # Route guard
│           └── landingDashboard/     # Landing page components
│
├── notes/                            # Project documentation
│   ├── project-deisgn-strategy.md    # Phase-by-phase execution plan
│   ├── student_crm_schema_notes.md   # Schema explanation
│   ├── design.md                     # Design system
│   ├── db-schema.sql                 # SQL schema DDL
│   ├── student_crm_full_setup.sql    # Sample data setup
│   └── css_style_guide.md            # CSS guidelines
│
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.13+** (backend)
- **Node.js 18+** (frontend)
- **PostgreSQL** (Supabase account recommended)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/your-org/student-crm.git
cd student-crm
```

### 2. Backend Setup

#### 2a. Create Python Virtual Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# or on Windows: .venv\Scripts\activate
```

#### 2b. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 2c. Environment Configuration

Create `.env` file in `backend/` directory:

```env
# FastAPI
VERSION=0.1.0
VERSION_TAG=v1
API_PREFIX=/api/v1

# Supabase Database (Async - for FastAPI)
SUPABASE_ASYNC_DATABASE_URL=postgresql+asyncpg://postgres.xxxxx:password@host:6543/postgres

# Supabase Database (Sync - for Alembic migrations)
SUPABASE_MIGRATION_DATABASE_URL=postgresql://postgres.xxxxx:password@host:5432/postgres

# Supabase Auth
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx
```

#### 2d. Run Database Migrations

```bash
cd backend
alembic upgrade head
```

This creates all 10 tables in your Supabase PostgreSQL database.

#### 2e. Start Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server runs at `http://localhost:8000`
- Docs: `http://localhost:8000/api/v1/docs` (Swagger UI)
- Redoc: `http://localhost:8000/api/v1/redoc`

---

### 3. Frontend Setup

#### 3a. Install Dependencies

```bash
cd frontend
npm install
```

#### 3b. Environment Configuration

Create `.env` file in `frontend/` directory:

```env
# Supabase
VITE_SUPABASE_URL=https://your-supabase-instance.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxx

# Microsoft Entra ID (Azure AD)
MICROSOFT_CLIENT_ID=your-app-registration-id
MICROSOFT_TENANT_ID=your-tenant-id

# API Base URL
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

#### 3c. Start Development Server

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:3000` (proxied to backend at port 8000)

---

### 4. Verify Setup

1. **Open Frontend:** `http://localhost:3000`
2. **Click "Sign in with Microsoft"** → OAuth flow
3. **After auth callback:** Redirected to `/dashboard`
4. **Test API:** Visit `http://localhost:8000/api/v1/docs`

---

## 🏗️ Architecture

### High-Level Data Flow

```
Frontend (React)
    ↓ (Axios request)
Supabase Auth (JWT token)
    ↓ (Bearer token)
API Client Interceptor (adds token)
    ↓
FastAPI Backend (port 8000)
    ├─ auth.py → Validates JWT with Supabase
    ├─ db.py → AsyncSession from connection pool
    └─ routes/*.py → CRUD operations
        ↓
Supabase PostgreSQL
    ├─ institutions
    ├─ users
    ├─ programs
    ├─ people
    ├─ applications
    ├─ student_profiles
    ├─ student_term_records
    └─ interactions
```

### Authentication Flow

1. User visits `/login`
2. User clicks "Sign in with Microsoft"
3. Redirect to Microsoft Entra ID login
4. Supabase handles OAuth 2.0 code exchange
5. JWT token issued by Supabase
6. Frontend redirects to `/auth/callback`
7. AuthContext loads session + user data
8. Protected routes check `isAuthenticated`
9. All API calls include Bearer token

### Database Connection Pooling

**FastAPI Runtime:** Uses transaction pooler (port 6543)
- Lighter connection overhead
- Better for high-concurrency APIs

**Alembic Migrations:** Uses direct connection (port 5432)
- Full SQL statement support
- Required for migration execution

---

## 📊 Development Phases

### Phase 1: Database Design ✅ COMPLETE
- ✅ Schema created (10 entities)
- ✅ Alembic configured for migrations
- ✅ All relationships defined
- ✅ Indexes and constraints applied

### Phase 2: Backend API 🟡 IN PROGRESS
- ✅ FastAPI setup + CORS
- ✅ Supabase Auth integration
- ✅ User endpoints (GET, PATCH)
- ❌ 9 remaining entity endpoints (Institutions, Programs, etc.)
- ❌ Advanced filtering/search

### Phase 3: Frontend Dashboard 🟡 IN PROGRESS
- ✅ React Router setup
- ✅ AuthContext state management
- ✅ Microsoft Entra ID OAuth
- ✅ Dashboard shell + 5 views
- ❌ 4 remaining views (Students, Admissions, Advising, AI Co-Pilot, Reports)
- ❌ Data tables + filters

### Phase 4: AI Analytics ❌ NOT STARTED
- ❌ LangChain/LangGraph setup
- ❌ Text-to-SQL agent
- ❌ Chart generation
- ❌ Query history/save

### Phase 5: Deployment ❌ NOT STARTED
- ❌ Docker containerization
- ❌ Cloud deployment (Render, Railway, Vercel)
- ❌ CI/CD pipeline
- ❌ Monitoring & logging

---

## 🎨 Design System

The application follows a **professional, minimalist design** optimized for data-heavy interfaces.

### Design Principles

1. **Task-Oriented** — Maximize focus on student data and enrollment metrics
2. **High Contrast** — Dark Slate text (`#212121`) on white/light backgrounds
3. **Consistent Spacing** — 8px grid system (4px, 8px, 16px, 24px, 32px, 48px)
4. **Status Badges** — Color-coded lifecycle stages (Enrolled, Admitted, Action Needed, etc.)
5. **Structured Grid** — Vertical rhythm and alignment across all pages

### Color Palette

| Variable | Color | Usage |
|----------|-------|-------|
| `--color-primary` | `#007BFF` | Primary actions, buttons |
| `--color-success` | `#28A745` | Enrolled, verified, yield |
| `--color-danger` | `#DC3545` | Withdrawn, rejected |
| `--color-warning` | `#FFC107` | Action needed, review |
| `--color-info` | `#17A2B8` | Cohort tags, admitted |
| `--color-text-primary` | `#212121` | Main text, headings |
| `--color-text-secondary` | `#757575` | Labels, subtitles |
| `--color-bg-primary` | `#F8F9FA` | Layout background |
| `--color-bg-secondary` | `#FFFFFF` | Card containers |

### Typography

- **Base Font:** System UI (`-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto`)
- **Monospace:** `SFMono-Regular, Consolas, Liberation Mono` (for GPA, IDs, counts)
- **Scale:** 5xl (44px) → base (16px) → xs (12px)

### Components

- **Status Pills** — Inline badges for lifecycle stages
- **Data Tables** — Searchable, filterable student records
- **Modals** — Consistent dialogs for forms and confirmations
- **Navigation** — Breadcrumb + sidebar + top nav

---

## 📚 Documentation

Detailed documentation available in `notes/` folder:

- **`project-deisgn-strategy.md`** — Phase-by-phase execution plan
- **`student_crm_schema_notes.md`** — Schema explanation & relationships
- **`design.md`** — Design system & style guide
- **`db-schema.sql`** — SQL DDL for all tables
- **`student_crm_full_setup.sql`** — Sample data setup script
- **`css_style_guide.md`** — CSS best practices

---

## 🔄 API Endpoints (Implemented)

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/me` | Get current authenticated user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/` | List users (with filters) |
| PATCH | `/api/v1/users/` | Update current user profile |

### Default
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/` | Health check / status |

### Pending Endpoints (9 entities)
```
POST   /api/v1/institutions/
GET    /api/v1/institutions/
GET    /api/v1/institutions/{id}
PATCH  /api/v1/institutions/{id}
DELETE /api/v1/institutions/{id}

POST   /api/v1/programs/
GET    /api/v1/programs/
... (etc for programs, people, applications, student_profiles, etc.)
```

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. **Create feature branch:** `git checkout -b feature/your-feature`
2. **Follow code style:** Use existing patterns in codebase
3. **Test thoroughly:** Run migrations, test API endpoints
4. **Document changes:** Update schema notes if DB changes
5. **Submit PR:** Include description of changes

---

## 📝 License

[Your License Here]

---

## 📞 Support

For questions or issues:
1. Check `notes/` documentation folder
2. Review existing API endpoint patterns
3. Consult database schema diagram

---

## 🎯 Key Alignment Points

This project demonstrates expertise in **Higher Education Technology** by:

### 1. **Data Modeling**
- Non-traditional student tracking
- Complete lifecycle management (prospect → alumni)
- Multi-institutional support
- Academic term organization

### 2. **Database Architecture**
- PostgreSQL with advanced relationships
- Async performance optimization
- Migration management with Alembic
- Connection pooling strategies

### 3. **Backend Development**
- FastAPI async patterns
- SQLAlchemy ORM best practices
- JWT authentication integration
- RESTful API design

### 4. **Frontend Engineering**
- Modern React architecture
- OAuth 2.0 integration
- Responsive dashboard design
- Accessibility-focused UI

### 5. **AI/Analytics Readiness**
- Clean data architecture for LLM agents
- Text-to-SQL query capability
- Routine report generation
- Cohort analysis patterns

---

**Built with ❤️ for Columbia University School of General Studies**

*Last Updated: August 2026*
