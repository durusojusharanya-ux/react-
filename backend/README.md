# Task Management API

A production-quality CRUD REST API with JWT User Authentication built with Node.js, Express.js, and SQLite. Designed as an internship assignment demonstrating real-world backend development practices.

## Features

- 🔐 JWT-based user authentication (register, login, profile)
- ✅ Full task CRUD — create, read, update, delete
- 🗄️ SQLite database — zero cloud setup, works 100% locally
- 🛡️ Task ownership enforcement — users can only access their own tasks
- 🔒 Bcrypt password hashing — passwords never stored in plain text
- 📋 Input validation with express-validator
- 🎯 Consistent JSON responses with proper HTTP status codes
- 🚫 SQL injection prevention via parameterized queries
- 📦 Postman collection included for easy testing

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Postman](https://www.postman.com/downloads/) (for testing)
- No database account, no cloud setup, no API keys needed

---

## Installation

```bash
# 1. Clone the repository (or navigate to the project folder)
cd task-management-api

# 2. Install dependencies
npm install

# 3. Create your environment file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

---

## Environment Setup

Open `.env` and update the values:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_characters
JWT_EXPIRES_IN=1d
```

> **Important:** Change `JWT_SECRET` to a long, random string before deploying. Never commit `.env` to Git.

**Generate a strong secret (optional):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## How SQLite Works (No Setup Needed)

When you run `npm run dev`, the server:

1. Checks if the `data/` folder exists — creates it if not.
2. Opens (or creates) `data/tasks.db`.
3. Runs `CREATE TABLE IF NOT EXISTS` for `users` and `tasks`.
4. Foreign keys and WAL mode are enabled automatically.

**You never need to run SQL commands manually.**

---

## Starting the Server

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# Production mode
npm start
```

You should see:
```
✅ SQLite database initialized at: .../data/tasks.db
🚀 Server running on http://localhost:5000
📋 Health check: http://localhost:5000/api/health
```

---

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Health Check

| Method | Endpoint       | Auth | Description          |
|--------|----------------|------|----------------------|
| GET    | `/api/health`  | No   | Check server status  |

### Authentication

| Method | Endpoint              | Auth | Description                    |
|--------|-----------------------|------|--------------------------------|
| POST   | `/api/auth/register`  | No   | Create a new user account      |
| POST   | `/api/auth/login`     | No   | Log in and receive a JWT       |
| GET    | `/api/auth/me`        | Yes  | Get authenticated user profile |

### Tasks

| Method | Endpoint          | Auth | Description                       |
|--------|-------------------|------|-----------------------------------|
| POST   | `/api/tasks`      | Yes  | Create a new task                 |
| GET    | `/api/tasks`      | Yes  | List all your tasks               |
| GET    | `/api/tasks/:id`  | Yes  | Get one task by ID                |
| PUT    | `/api/tasks/:id`  | Yes  | Update an owned task              |
| DELETE | `/api/tasks/:id`  | Yes  | Delete an owned task              |

**Optional query parameters for GET /api/tasks:**
- `?status=pending` — filter by status (`pending`, `in-progress`, `completed`)
- `?priority=high` — filter by priority (`low`, `medium`, `high`)

---

## Example Request Bodies & Responses

### Register — `POST /api/auth/register`

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
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
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login — `POST /api/auth/login`

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Create Task — `POST /api/tasks`

**Request headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request body:**
```json
{
  "title": "Complete internship assignment",
  "description": "Build a CRUD REST API with Node.js and SQLite",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2025-12-31"
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
      "title": "Complete internship assignment",
      "description": "Build a CRUD REST API with Node.js and SQLite",
      "status": "in-progress",
      "priority": "high",
      "dueDate": "2025-12-31T00:00:00.000Z",
      "userId": 1,
      "createdAt": "2025-01-01T10:00:00.000Z",
      "updatedAt": "2025-01-01T10:00:00.000Z"
    }
  }
}
```

### Update Task — `PUT /api/tasks/1`

**Request body (only include fields to change):**
```json
{
  "status": "completed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task updated successfully.",
  "data": { "task": { ... } }
}
```

---

## JWT Authentication

Protected endpoints require this header:

```
Authorization: Bearer <token>
```

- Tokens expire after `1d` (configurable via `JWT_EXPIRES_IN` in `.env`).
- A `401` response means the token is missing, invalid, or expired.
- Log in again to get a new token.

---

## HTTP Status Codes

| Code | Meaning                          |
|------|----------------------------------|
| 200  | Success (read, update, delete)   |
| 201  | Created (register, create task)  |
| 400  | Bad request / validation error   |
| 401  | Unauthenticated                  |
| 403  | Forbidden                        |
| 404  | Not found                        |
| 409  | Conflict (duplicate email)       |
| 500  | Internal server error            |

---

## Postman Testing

### Import the Collection

1. Open Postman.
2. Click **Import** (top-left).
3. Select `postman/Task-Management-API.postman_collection.json`.
4. The collection appears in your sidebar.

### Quick Start Test Flow

1. **Health Check** — verify the server is running.
2. **Register** — creates your account and auto-saves the JWT token.
3. **Login** — logs in and refreshes the saved JWT token.
4. **Create Task** — creates a task and saves the task ID.
5. **List Tasks** — view all your tasks.
6. **Get Task by ID** — view the task you created.
7. **Update Task** — change the status to `completed`.
8. **Delete Task** — remove the task.
9. **Error Cases** — test validation and 404 responses.

> The "Register" and "Login" requests include **test scripts** that automatically save the token to the `authToken` collection variable. All protected requests use `{{authToken}}` automatically.

---

## Task Fields

| Field         | Type    | Required | Description                                      |
|---------------|---------|----------|--------------------------------------------------|
| `title`       | string  | Yes      | Task title (max 255 chars)                       |
| `description` | string  | No       | Optional details (max 1000 chars)                |
| `status`      | string  | No       | `pending` (default), `in-progress`, `completed`  |
| `priority`    | string  | No       | `low`, `medium` (default), `high`                |
| `dueDate`     | string  | No       | ISO 8601 date (e.g. `2025-12-31`)                |

---

## Troubleshooting

**`Error: Cannot find module 'better-sqlite3'`**
```bash
npm install
```

**`Error: JWT_SECRET is not defined`**
- Make sure you created `.env` from `.env.example` and set `JWT_SECRET`.

**`Port 5000 is already in use`**
- Change `PORT=5001` in `.env`, or kill the process using port 5000.

**`401 Unauthorized` on protected endpoints**
- Run the Login request first so the token is saved to `{{authToken}}`.
- Check that the token hasn't expired (default: 1 day).

**SQLite database issues**
- Delete `data/tasks.db` and restart the server — it will be recreated fresh.

**`better-sqlite3` build error on Windows**
```bash
npm install --global windows-build-tools
npm install
```
Or install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).

---

## Project Structure

```
task-management-api/
├── src/
│   ├── config/
│   │   └── db.js                 # SQLite connection + table creation
│   ├── controllers/
│   │   ├── authController.js     # Register, login, getMe
│   │   └── taskController.js     # CRUD task operations
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── errorMiddleware.js    # Global error handler + 404
│   │   └── validateRequest.js   # express-validator runner
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── taskValidators.js
│   ├── app.js                   # Express app setup
│   └── server.js                # Entry point
├── data/
│   └── tasks.db                 # Created automatically (git-ignored)
├── postman/
│   └── Task-Management-API.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Publishing to GitHub

> ⚠️ Review all files before pushing. The `.gitignore` excludes `.env` and `data/tasks.db` — never commit those.

```bash
# 1. Initialize a git repository
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "feat: initial CRUD REST API with JWT authentication and SQLite"

# 4. Create a new repository on GitHub (https://github.com/new)
#    Do NOT initialize it with a README

# 5. Link your local repo to GitHub (replace with your details)
git remote add origin https://github.com/YOUR_USERNAME/task-management-api.git

# 6. Push to GitHub
git branch -M main
git push -u origin main
```

### Make the repository public for your internship submission:
1. Go to your repository on GitHub.
2. Click **Settings** → **General** → scroll to **Danger Zone**.
3. Click **Change repository visibility** → **Make public**.

---

## Security Notes

- Passwords are hashed with bcrypt (12 salt rounds) — plain-text passwords are never stored.
- JWTs contain only the user ID — no sensitive data.
- All SQL queries use parameterized statements — SQL injection is prevented.
- Task ownership is enforced at the database level (`WHERE id = ? AND userId = ?`).
- Secrets and the database file are excluded from Git via `.gitignore`.
