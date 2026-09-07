# Full-Stack Task Management Application

A production-ready Full-Stack Task Management Application built using **Next.js 15, React, Node.js, Express, MongoDB, and Mongoose**.

---

## 🚀 Live Demo & Deployment Links

* **Frontend Live Application (Vercel)**: [https://full-stack-practical-task-1zuz.vercel.app/](https://full-stack-practical-task-1zuz.vercel.app/)
* **Backend REST API (Render)**: [https://full-stack-practical-task-1.onrender.com](https://full-stack-practical-task-1.onrender.com)
* **Screen Recording Video (Loom)**: [https://www.loom.com/share/620944f6f6004858a4694d21a4aab402](https://www.loom.com/share/620944f6f6004858a4694d21a4aab402)
* **GitHub Repository**: [https://github.com/tankr556/Full_Stack_Practical_Task.git](https://github.com/tankr556/Full_Stack_Practical_Task.git)

---

## 🔐 Test Credentials (Admin Account)

| Role | Email | Password |
|---|---|---|
| **Admin / Lead** | `admin@example.com` | `Admin@123` |
| **Member** | `member@example.com` | `Member@123` |

---

## 📂 Project Architecture

```text
Full_Stack_Practical_Task/
├── backend/
│   ├── src/
│   │   ├── config/database.js               # MongoDB Mongoose connection
│   │   ├── controllers/
│   │   │   ├── airtable.controller.js        # Server-side Airtable export
│   │   │   ├── auth.controller.js            # User Auth & JWT token creation
│   │   │   └── project.controller.js         # Tasks, Comments & Activity feed
│   │   ├── middleware/
│   │   │   ├── admin.middleware.js           # Admin role check
│   │   │   ├── auth.middleware.js            # JWT protection middleware
│   │   │   └── project.middleware.js         # Project membership & RBAC
│   │   ├── models/
│   │   │   ├── ActivityLog.js                # Project activity history schema
│   │   │   ├── Comment.js                    # Immutable task comments schema
│   │   │   ├── Project.js                    # Project schema with member roles
│   │   │   ├── Task.js                       # Task model with status & indexes
│   │   │   └── User.js                       # User schema with bcrypt password hooks
│   │   ├── routes/
│   │   │   ├── auth.routes.js                # Auth endpoints (/api/auth)
│   │   │   └── project.routes.js             # Task & project routes (/api/projects)
│   │   ├── seed/admin.seed.js                # Admin & default project seeder
│   │   ├── app.js                            # Express app configuration & middlewares
│   │   └── server.js                         # HTTP server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── globals.css                   # Modern dark mode design tokens
│   │       ├── layout.js                     # Root layout component
│   │       └── page.js                       # Project Dashboard (Tasks, Comments, Activity Feed)
│   └── package.json
├── REVIEW.md                                 # Category audit & reproduction steps
├── DESIGN_NOTES.md                           # Database & architectural tradeoffs
├── DEBUGGING.md                             # Production debugging guide
├── AI_NOTES.md                               # AI interaction & verification summary
└── RECORDING.md                              # Video recording walkthrough & link
```

---

## ✨ Key Features & Technical Accomplishments

### 1. Backend REST API (Node.js + Express + MongoDB)
* **Role-Based Access Control (RBAC)**: Enforces `admin`, `member`, and `viewer` permissions at the API middleware level (`checkProjectAccess`).
* **Task Comments (Immutable)**: Strict write-only comments without edit/delete endpoints to maintain auditing integrity.
* **Activity Feed with DB Transactions**: Ensures task creations, comment additions, and status changes write atomically using MongoDB sessions.
* **Database Optimization (Part 4)**: Pagination, text search, and compound indexes (`{ project: 1, status: 1, createdAt: -1 }`).
* **Server-side Airtable Export (Part 6)**: Idempotent task sync with exponential backoff retry logic for transient 429/5xx status codes.

### 2. Frontend Application (Next.js 15 + React + Tailwind/CSS)
* **Interactive Project Dashboard**: Real-time task creation, interactive status cycling (`TODO` -> `IN PROGRESS` -> `DONE` -> `TODO`), and active task comments.
* **Live Recent Activity Feed**: Scrollable activity log box with instant optimistic feed updates.
* **Optimistic UI Updates**: State-first updates with instant UI feedback and graceful error rollbacks.

---

## 📄 Submission Artifacts Included

1. **`REVIEW.md`**: Top 4 codebase issues analyzed across Security, Performance, Database, and Architecture categories with exact `curl` reproduction commands.
2. **`DESIGN_NOTES.md`**: Technical trade-offs detailing database transactions vs. eventual consistency, indexing strategies, and pagination.
3. **`DEBUGGING.md`**: Step-by-step diagnostic strategy for production 500 error investigations.
4. **`AI_NOTES.md`**: Honest reflection detailing AI prompt engineering, code modifications, and empirical verification.
5. **`RECORDING.md`**: Video recording overview and workflow timestamps.

---

## 🛠️ Local Installation & Setup Guide

### 1. Prerequisites
* Node.js v20+
* MongoDB local instance or MongoDB Atlas Connection String

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Set PORT=5000 and MONGODB_URI in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
