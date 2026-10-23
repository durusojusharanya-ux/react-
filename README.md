# 🚀 TaskFlow — Full-Stack Task Management System
### Integrated Internship Project: Task 2 (CRUD REST API) + Task 3 (Responsive React Frontend)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B%20%7C%2022%2B-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.18-lightgrey?logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-blue?logo=sqlite)](https://www.sqlite.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-orange?logo=jsonwebtokens)](https://jwt.io/)
[![React](https://img.shields.io/badge/Frontend-React%2019-cyan?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-purple?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 📌 Project Overview

**TaskFlow** is a modern, production-ready, full-stack task management web application designed and built to complete both **Internship Task 2** (Backend RESTful API with Authentication & Database Persistence) and **Internship Task 3** (Responsive, Dynamic React Single-Page Application).

The backend delivers a secure REST API with JWT-based authentication, user password hashing with bcrypt, input validation with `express-validator`, and persistent data storage using **SQLite** with Write-Ahead Logging (WAL) and cascading foreign keys. The frontend is built with **React 19** and **Vite**, featuring dynamic dashboard metrics, client-side route protection, responsive mobile/desktop interfaces, search/filter capabilities, form validation, and full CRUD operations.

---

## 🎯 Internship Objectives

| Internship Task | Scope | Status |
| :--- | :--- | :---: |
| **Task 2: Backend REST API** | Build a robust Express.js API with SQLite database persistence, JWT authentication, user registration/login, password hashing, and complete CRUD endpoints with input validation. | ✅ **Complete & Tested** |
| **Task 3: React Frontend** | Develop a responsive React application consuming the Task 2 REST API with state management, client validation, protected routing, loading/error states, and polished UI design. | ✅ **Complete & Tested** |

---

## ✨ Features

### 🔐 Backend API (Task 2)
- **User Authentication**:
  - Secure registration (`POST /api/auth/register`) with email normalization and duplicate check.
  - Login (`POST /api/auth/login`) with bcrypt hash verification (12 salt rounds) and JWT signing.
  - Profile retrieval (`GET /api/auth/me`) using the JWT bearer token.
  - Strict password exclusion: passwords are never stored in plain text and are always stripped from JSON responses.
- **Full CRUD Task Management**:
  - **Create**: Add tasks with title, description, status (`pending`, `in-progress`, `completed`), priority (`low`, `medium`, `high`), and optional due date (`POST /api/tasks`).
  - **Read All**: Retrieve tasks owned by the authenticated user with optional `?status=` and `?priority=` filters (`GET /api/tasks`).
  - **Read Single**: Fetch an owned task by ID (`GET /api/tasks/:id`).
  - **Update**: Update task properties (`PUT /api/tasks/:id`).
  - **Delete**: Remove an owned task (`DELETE /api/tasks/:id`).
- **Data Isolation & Ownership**: All queries are parameterized (`?`) to prevent SQL injection, and enforce user ownership in SQL (`WHERE id = ? AND userId = ?`).
- **SQLite Engine**: Zero-configuration, file-based persistence using Node.js built-in SQLite (`DatabaseSync`), configured with `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON`.
- **Validation & Error Handling**: Request bodies and parameters are strictly validated with centralized 400, 401, 403, 404, 409, and 500 JSON error responses.

### 💻 Frontend Application (Task 3)
- **Modern React Architecture**: Built with React 19, Vite, and React Router DOM v7.
- **Centralized Authentication Context**: Global `AuthContext` managing tokens in `localStorage`, auto-verifying user profile on page load, and handling seamless login/logout state transitions.
- **Protected Routing**: Custom `ProtectedRoute` component preventing unauthenticated access to private dashboard and task routes.
- **Interactive Dashboard**: Real-time KPI summary cards (Total, Pending, In-Progress, Completed, High Priority) computed directly from API data, with quick actions and recent tasks preview.
- **Dynamic Task Board**:
  - Search tasks by title or description keywords.
  - Filter tasks by status and priority.
  - Color-coded badges for status and priority.
  - Custom delete confirmation dialog modal with backdrop to prevent accidental removals.
- **Form Validation & UX**:
  - Client-side validation with real-time feedback for missing/invalid fields.
  - Show/hide password toggles.
  - Inline loading spinners and full-screen loading states.
  - Error banners with retry buttons on network or server errors.
  - Friendly empty states when no records exist.
- **Responsive Design**: Designed with CSS variables, custom typography (Google Fonts Inter), and media queries supporting desktop, tablet, and mobile (with hamburger navigation).

---

## 🛠️ Technology Stack

```
TaskFlow Architecture
├── Backend (Task 2)
│   ├── Runtime: Node.js (v18+ or v22+)
│   ├── Framework: Express.js (v4.18)
│   ├── Database: SQLite 3 (node:sqlite with WAL mode)
│   ├── Auth & Crypto: JSON Web Tokens (jsonwebtoken) & bcryptjs
│   ├── Validation: express-validator
│   └── Config: dotenv & cors
│
└── Frontend (Task 3)
    ├── Framework: React (v19)
    ├── Tooling / Bundler: Vite (v8)
    ├── Routing: React Router DOM (v7)
    ├── HTTP Client: Fetch API (modular service wrapper)
    └── Styling: Vanilla CSS3 (Custom Design System, Responsive Media Queries)
```

---

## 📂 Project Structure

```
taskflow-project/
├── README.md                      # Comprehensive project documentation
├── .gitignore                     # Root gitignore (ignoring node_modules, .env, *.db)
├── package.json                   # Root package runner scripts
│
├── backend/                       # Task 2: Backend REST API
│   ├── package.json
│   ├── .env.example               # Backend environment template
│   ├── data/                      # Persistent SQLite database storage
│   │   ├── .gitkeep
│   │   └── tasks.db               # SQLite database file (auto-generated)
│   ├── postman/                   # Postman API Collection
│   │   └── Task-Management-API.postman_collection.json
│   └── src/
│       ├── server.js              # Application entry point & port listener
│       ├── app.js                 # Express app configuration & middleware
│       ├── config/
│       │   └── db.js              # SQLite connection & schema initialization
│       ├── controllers/
│       │   ├── authController.js  # Register, login, getMe handlers
│       │   └── taskController.js  # CRUD handlers with ownership enforcement
│       ├── middleware/
│       │   ├── authMiddleware.js  # JWT verification middleware
│       │   ├── errorMiddleware.js # Centralized 404 & error handlers
│       │   └── validateRequest.js # express-validator error mapper
│       ├── routes/
│       │   ├── authRoutes.js      # /api/auth routes
│       │   └── taskRoutes.js      # /api/tasks routes
│       └── validators/
│           ├── authValidators.js  # Validation rules for auth
│           └── taskValidators.js  # Validation rules for tasks & IDs
│
└── frontend/                      # Task 3: React Frontend Application
    ├── package.json
    ├── vite.config.js             # Vite configuration with React plugin
    ├── index.html                 # HTML5 template with Google Fonts (Inter)
    ├── .env.example               # Frontend environment template
    └── src/
        ├── main.jsx               # Application root mounting React
        ├── App.jsx                # Router declaration & layout structure
        ├── services/
        │   └── api.js             # Reusable Fetch API client with JWT injection
        ├── context/
        │   └── AuthContext.jsx    # React Context for authentication state
        ├── components/
        │   ├── Navbar.jsx         # Responsive navigation bar with mobile toggle
        │   ├── ProtectedRoute.jsx # Route guard for private pages
        │   ├── Loading.jsx        # Accessible loading spinner component
        │   ├── ErrorMessage.jsx   # Alert component with retry action
        │   └── ConfirmDialog.jsx  # Confirmation modal for delete operations
        ├── pages/
        │   ├── Login.jsx          # Login view with validation & show/hide pwd
        │   ├── Register.jsx       # Registration view with validation
        │   ├── Dashboard.jsx      # Metrics overview & quick actions
        │   ├── TaskList.jsx       # Task cards, search, filter & delete modal
        │   ├── TaskDetails.jsx    # Single task view with complete metadata
        │   ├── CreateTask.jsx     # Validated task creation form
        │   ├── EditTask.jsx       # Prefilled task update form
        │   └── NotFound.jsx       # Custom 404 page
        └── styles/
            └── global.css         # Custom CSS design system & media queries
```

---

## ⚙️ Prerequisites

Before running the application, ensure you have installed:
- **Node.js**: `v18.0.0` or higher (Node.js `v22+` recommended for built-in SQLite support)
- **npm**: `v9.0.0` or higher
- **Git**: For version control

Verify versions in your terminal:
```bash
node -v
npm -v
```

---

## 🚀 Quick Start Guide (Beginner Friendly)

### 1. Clone the Repository
```bash
git clone https://github.com/durusojusharanya-ux/crud.git
cd crud
```

---

### 2. Backend Setup & Startup (Terminal 1)

1. Open a terminal and enter the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On macOS / Linux:
     ```bash
     cp .env.example .env
     ```
   Verify `.env` contents:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=replace_with_a_long_random_secret_string
   JWT_EXPIRES_IN=1d
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
   *For live auto-reloading during development:*
   ```bash
   npm run dev
   ```
5. You should see:
   ```text
   ✅ SQLite database initialized at: .../backend/data/tasks.db
   🚀 Server running on http://localhost:5000
   📋 Health check: http://localhost:5000/api/health
   🌍 Environment: development
   ```

---

### 3. Frontend Setup & Startup (Terminal 2)

1. Open a **second terminal** and enter the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` configuration file:
   - On Windows (PowerShell):
     ```powershell
     Copy-Item .env.example .env
     ```
   - On macOS / Linux:
     ```bash
     cp .env.example .env
     ```
   Verify `.env` contents:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```
4. Start the React development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 REST API Reference

Base URL: `http://localhost:5000/api`

### 1. Health Check
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/health` | No | Server heartbeat and timestamp |

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task Management API is running.",
  "timestamp": "2026-10-23T15:03:33.178Z"
}
```

---

### 2. Authentication Endpoints
| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login and receive a signed JWT |
| `GET` | `/auth/me` | Bearer JWT | Retrieve profile of authenticated user |

#### Register (`POST /api/auth/register`)
**Request Body:**
```json
{
  "name": "Sharanya Dev",
  "email": "sharanya@example.com",
  "password": "Password@123"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "Sharanya Dev",
      "email": "sharanya@example.com",
      "createdAt": "2026-10-23T15:03:55.748Z",
      "updatedAt": "2026-10-23T15:03:55.748Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login (`POST /api/auth/login`)
**Request Body:**
```json
{
  "email": "sharanya@example.com",
  "password": "Password@123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": {
      "id": 1,
      "name": "Sharanya Dev",
      "email": "sharanya@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Task Management Endpoints (All require `Authorization: Bearer <TOKEN>`)

| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `POST` | `/tasks` | Create a new task | — |
| `GET` | `/tasks` | List all tasks owned by current user | `?status=pending` & `?priority=high` |
| `GET` | `/tasks/:id` | Get details of a single task by ID | — |
| `PUT` | `/tasks/:id` | Update an existing task | — |
| `DELETE` | `/tasks/:id` | Permanently delete an existing task | — |

#### Create Task (`POST /api/tasks`)
**Request Body:**
```json
{
  "title": "Complete Internship Task 3 Frontend",
  "description": "Implement React UI with state management and API integration.",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2026-12-31"
}
```
**Response (201 Created):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "task": {
      "id": 1,
      "title": "Complete Internship Task 3 Frontend",
      "description": "Implement React UI with state management and API integration.",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2026-12-31T00:00:00.000Z",
      "userId": 1,
      "createdAt": "2026-10-23T15:20:00.000Z",
      "updatedAt": "2026-10-23T15:20:00.000Z"
    }
  }
}
```

#### Update Task (`PUT /api/tasks/:id`)
**Request Body (Partial updates supported):**
```json
{
  "status": "completed",
  "priority": "medium"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": {
    "task": {
      "id": 1,
      "title": "Complete Internship Task 3 Frontend",
      "status": "completed",
      "priority": "medium",
      "updatedAt": "2026-10-23T15:25:00.000Z"
    }
  }
}
```

#### Delete Task (`DELETE /api/tasks/:id`)
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully."
}
```

---

## 🛡️ HTTP Status Code Standards

| Status Code | Description | Scenario |
| :---: | :--- | :--- |
| `200 OK` | Request succeeded | Successful GET, PUT, DELETE operations and login |
| `201 Created` | Resource created | Successful user registration and task creation |
| `400 Bad Request` | Invalid input | Validation error in request body or invalid task ID |
| `401 Unauthorized` | Authentication failed | Missing/expired JWT, invalid email or password |
| `403 Forbidden` | Access denied | Attempting to access or alter another user's task |
| `404 Not Found` | Resource not found | Task ID does not exist or unmatched API route |
| `409 Conflict` | Duplicate resource | Registering an email that already exists |
| `500 Server Error` | Unexpected failure | Internal database error (safely logged without leaking secrets) |

---

## 🧪 Postman Collection Testing

A complete Postman collection is included in the repository at:
`backend/postman/Task-Management-API.postman_collection.json`

### How to Use:
1. Open **Postman**.
2. Click **Import** and select `backend/postman/Task-Management-API.postman_collection.json`.
3. The collection has pre-configured variables:
   - `baseUrl`: `http://localhost:5000`
   - `authToken`: (dynamically set upon login/register)
4. Run the **Auth > Register** or **Auth > Login** request. The test script will **automatically store the JWT token** into `authToken`.
5. Run any of the **Tasks** endpoints — they will automatically include the token in the `Authorization: Bearer {{authToken}}` header!

---

## 🏗️ Production Build Instructions

To build the React frontend for production deployment:
```bash
cd frontend
npm run build
```
The optimized static bundle will be generated in `frontend/dist/`.

To preview the production bundle locally:
```bash
npm run preview
```

---

## 🌐 Deployment Guidelines

### Backend Deployment (e.g. Render, Railway, Fly.io)
1. Set the root directory or working directory to `backend`.
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000` (or host provided port)
   - `JWT_SECRET=your_super_secret_production_key`
   - `JWT_EXPIRES_IN=7d`
5. Ensure persistent disk storage is mounted for the `backend/data` directory so SQLite data persists across redeploys.

### Frontend Deployment (e.g. Vercel, Netlify)
1. Set root directory to `frontend`.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Configure Environment Variable:
   - `VITE_API_BASE_URL=https://your-deployed-backend-url.com`
5. Configure single-page application (SPA) rewrites so all routes point to `index.html`.

---

## 📋 Verification & Testing Results

| Test Category | Test Case | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Backend** | Server Startup | Connects to SQLite & listens on port 5000 | Port 5000 active, DB initialized | ✅ Passed |
| **Backend** | Health Check | `GET /api/health` returns 200 | Returns `{ success: true }` | ✅ Passed |
| **Backend** | User Registration | `POST /api/auth/register` creates user & token | HTTP 201 + valid JWT | ✅ Passed |
| **Backend** | Duplicate Email | Re-registering existing email | HTTP 409 Conflict | ✅ Passed |
| **Backend** | Authentication Guard | Accessing `/api/tasks` without token | HTTP 401 Unauthorized | ✅ Passed |
| **Backend** | CRUD Operations | Create, read, update, delete tasks | HTTP 201, 200 with data isolation | ✅ Passed |
| **Frontend** | Build Integrity | `npm run build` runs Vite build | 38 modules transformed, 0 errors | ✅ Passed |
| **Frontend** | Route Protection | Direct visit to `/dashboard` while unauthenticated | Redirects to `/login` | ✅ Passed |
| **Frontend** | User Registration | Valid registration through React form | Account created, auto logged in | ✅ Passed |
| **Frontend** | Task Creation | Form validation & POST to `/api/tasks` | Task created, navigated to details | ✅ Passed |
| **Frontend** | Task Edit & Update | Prefilled form & PUT to `/api/tasks/:id` | Data updated, redirected with new title | ✅ Passed |
| **Frontend** | Task Deletion | Modal dialog confirmation & DELETE request | Record deleted, list updated | ✅ Passed |
| **Frontend** | Responsive Design | 375px mobile viewport testing | Hamburger nav works, 0 overflow | ✅ Passed |
| **Frontend** | Session Management | Logout & re-login flow | Token cleared, re-authenticated smoothly | ✅ Passed |

---

## 👩‍💻 Author & Submission
- **Intern Name**: Sharanya
- **Repository**: [https://github.com/durusojusharanya-ux/crud](https://github.com/durusojusharanya-ux/crud)
- **Internship Project Submission**: Task 2 (REST API Backend) + Task 3 (React Frontend)
