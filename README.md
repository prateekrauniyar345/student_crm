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


### 4. **RESTful API**
- Full CRUD operations on all entities
- Advanced filtering and search capabilities
- Async/await architecture for performance
- Bearer token authentication on all endpoints

### 5. **AI-Powered Analytics** (Planned)
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

#### 1. **Organization & System Users**
- `institutions` — University/college organizations
- `users` — CRM system staff (not students)
- `institution_memberships` — User-Institution relationships with role assignments

#### 2. **Academic Structure**
- `programs` — Degree programs offered by institutions
- `academic_terms` — Semesters, quarters, sessions (e.g., Fall 2025, Spring 2026)

#### 3. **People & Student Records**
- `people` — Core student/prospect records (one record per person throughout lifecycle)
- `student_profiles` — Extended enrollment data for enrolled students
- `applications` — Admissions applications
- `student_term_records` — Per-term academic performance data

#### 4. **CRM Activity**
- `interactions` — Audit trail of all CRM activity (emails, calls, meetings, advising sessions)

#### 5. **Classifications** (Pending)
- `tags` — Reusable labels/categories
- `person_tags` — Tag-person associations

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
