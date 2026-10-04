# 🎓 CampusFlow

> **Smart Campus Information & Notice Intelligence Platform**  
> Built for **PES Modern College of Engineering (PES MCOE)** to unify official circulars, academic deadlines, and campus event registrations into a single, organized, role-aware system.

---

## 📌 Problem & Overview

Colleges often distribute critical circulars, exam dates, and notices across disparate channels (WhatsApp groups, notice boards, PDFs, and departmental emails). This leads to missed deadlines, confusion around exam schedules, and missed event opportunities.

**CampusFlow** provides:
1. **Intelligent Circular Extraction**: Upload official notices (PDF/Images), extract text, and generate structured summaries (What Changed, Who Is Affected, Required Actions, Deadlines).
2. **Precision Audience Targeting**: Filter notices strictly based on cohort parameters (Department, Academic Year, Division, Batch) or broadcast campus-wide.
3. **Role-Based Portals & RBAC**:
   - **Student Portal**: Personalized dashboard, active deadlines checklist, calendar, and student-only event RSVP registration.
   - **Administrative Portal**: Notice upload pipeline, AI extraction review & edit, publishing workflows, event creation, and audit logging.
4. **Strict Authorization**: Multi-layer RBAC guarantees students cannot publish or edit official circulars, and administrators/faculty cannot perform student-only actions (such as RSVP registrations).

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (v18+) & Express
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL with Prisma ORM
- **Authentication**: JWT cookies with bcrypt password hashing
- **File Handling**: Multer for PDF/image uploads
- **Resilience**: Dual-mode engine (PostgreSQL primary with automatic in-memory fallback for local development)
- **Validation**: Zod schema validation

### Frontend
- **Framework**: React 19 & Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query (server cache) & Zustand with `persist` (client session)
- **Routing**: React Router v7 with role-guarded routes
- **Forms**: React Hook Form with Zod resolvers
- **Icons**: Lucide React

---

## 🚀 Quick Start & Setup

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** (optional for dev mode; built-in in-memory fallback included)

---

### 2. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env

# Optional: Run Prisma migrations and seed database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development server (runs on http://localhost:3000)
npm run dev
```

#### Backend Environment Variables (`backend/.env`)
```env
PORT="3000"
APP_URL="http://localhost:5173"
API_URL="http://localhost:3000"
DATABASE_URL="postgresql://campusflow:campusflow_password@localhost:5432/campusflow_db?schema=public"
AUTH_SECRET="dev-secret-key-32-chars-long-minimum-campusflow"
```

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory in a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env
cp .env.example .env

# Start development server (runs on http://localhost:5173)
npm run dev
```

#### Frontend Environment Variables (`frontend/.env`)
```env
VITE_API_URL="http://localhost:3000/api"
```

---

## 🔑 Demo Test Accounts

The platform includes pre-configured demo accounts for all core campus roles:

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Student** | `omkar_mankar_mca@moderncoe.edu.in` | `Pesmodern#123` | Student Dashboard (`/dashboard`), Notices, Deadlines, Event RSVP |
| **Administrator** | `admin@moderncoe.edu.in` | `DemoPass123!` | Admin Portal (`/admin/dashboard`), Notice Ingestion, Event Management, Audit Logs |
| **Faculty Coordinator** | `faculty_mca@moderncoe.edu.in` | `DemoPass123!` | Admin Portal (`/admin/dashboard`), Notice & Event Publishing |

---

## 🏛️ System Architecture & Access Control

```
                      ┌───────────────────────────────────────┐
                      │              CampusFlow               │
                      └───────────────────┬───────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │     Student Portal     │                     │     Admin Portal       │
     │      (Role: STUDENT)   │                     │ (Role: ADMIN, FACULTY) │
     └────────────┬───────────┘                     └────────────┬───────────┘
                  │                                               │
      • Personal Notices Feed                       • Document Upload & OCR Ingestion
      • Audience-Filtered Circulars                 • AI Summary & Deadline Extraction
      • Deadlines Checklist                         • Human-in-the-Loop Review & Publish
      • Student-Only Event RSVP                     • Event Capacity & Venue Control
      • Real-time Seat Allocation                   • Tamper-Evident Audit Logs
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          │
                                          ▼
                            ┌───────────────────────────┐
                            │    Dual-Layer Backend     │
                            │   REST API + Prisma DB    │
                            │ (In-Memory Fallback Mode) │
                            └───────────────────────────┘
```

### RBAC Enforcement Matrix

| Endpoint / Action | Student | Faculty | Admin |
| :--- | :---: | :---: | :---: |
| View Published Notices & Events | ✅ | ✅ | ✅ |
| View Draft Notices & Events | ❌ (404) | ✅ | ✅ |
| Upload & OCR Notice Documents | ❌ (403) | ✅ | ✅ |
| Publish / Edit / Delete Notices | ❌ (403) | ✅ | ✅ |
| Create / Edit / Publish Events | ❌ (403) | ✅ | ✅ |
| Register (RSVP) for Events | ✅ | ❌ (403) | ❌ (403) |
| Cancel Event Registration | ✅ | ❌ (403) | ❌ (403) |
| Access Audit Trail (`/api/admin/audit`) | ❌ (403) | ❌ (403) | ✅ |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/login` – Authenticate user and issue secure HTTP-only JWT cookie.
- `POST /api/auth/logout` – Clear user session and cookie.
- `GET /api/auth/me` – Retrieve currently logged-in user profile.

### Student Portal (`/api`)
- `GET /api/dashboard` – Student overview (priority notices, upcoming deadlines, featured events).
- `GET /api/notices` – Audience-filtered list of published notices for the current student.
- `GET /api/notices/:id` – Fetch notice details, summary, and attachments.
- `GET /api/events` – List published events with live registration count and user RSVP state.
- `GET /api/events/:id` – Detailed event specifications.
- `POST /api/events/:id/register` – Student-only RSVP seat registration.
- `DELETE /api/events/:id/register` – Student-only RSVP cancellation.
- `GET /api/deadlines` – Active academic deadlines.
- `GET /api/notifications` – In-app alerts for published circulars and events.

### Administrative Management (`/api/admin`)
- `GET /api/admin/dashboard` – High-level statistics, pending reviews, upcoming events.
- `GET /api/admin/notices` – List all notices across all states (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- `POST /api/admin/notices/upload` – Upload notice PDF/Image for OCR processing.
- `PUT /api/admin/notices/:id` – Update draft notice metadata and summary.
- `POST /api/admin/notices/:id/publish` – Publish notice with target audience cohort rules.
- `DELETE /api/admin/notices/:id` – Delete notice.
- `GET /api/admin/events` – Manage event list.
- `POST /api/admin/events` – Create new event.
- `POST /api/admin/events/:id/publish` – Publish draft event.
- `GET /api/admin/audit` – Immutable audit logging trail (*Admin role only*).

---

## 🧪 Automated Verification & Testing

Dedicated test suites verify RBAC, audience isolation, and lifecycle workflows:

```bash
# Run RBAC and Access Control verification
npx ts-node src/scripts/test_rbac_workflow.ts

# Run Student Role Restriction verification (confirms staff cannot RSVP)
npx ts-node src/scripts/test_student_role_restrictions.ts

# Run Notice Management & Publishing verification
npx ts-node src/scripts/test_notice_management.ts

# Run Real-Time Student Audience Matching verification
npx ts-node src/scripts/test_student_notices_update.ts
```

---

## 📁 Repository Structure

```
CampusFlow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema definitions
│   │   └── seed.ts                # Seed script with test users & departments
│   ├── src/
│   │   ├── controllers/           # Admin, Auth, Student controllers
│   │   ├── middlewares/           # JWT Auth, Role Guard, Upload middleware
│   │   ├── routes/                # Admin, Auth, Student API routes
│   │   ├── services/              # In-memory store, Notice, OCR, Summary services
│   │   ├── scripts/               # End-to-end verification scripts
│   │   └── app.ts                 # Express application setup
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── router.tsx         # React Router configuration with RoleGuard
│   │   ├── components/            # Layout, Navigation, Error Boundary
│   │   ├── features/
│   │   │   ├── admin/             # Notice Review, Upload, Audit Logs, Event Management
│   │   │   ├── auth/              # Student & Admin Login interfaces
│   │   │   ├── dashboard/         # Main Student Dashboard
│   │   │   ├── notices/           # Student Notices List & Details
│   │   │   ├── events/            # Events List & Registration Details
│   │   │   ├── deadlines/         # Deadlines Tracker
│   │   │   └── calendar/          # Academic Calendar View
│   │   └── lib/
│   │       ├── api.ts             # Axios client with interceptors
│   │       └── auth.ts            # Zustand persistent auth store
│   └── package.json
└── README.md
```

---

## 📄 License

Developed for academic and campus administration at **PES Modern College of Engineering**.
All rights reserved.
