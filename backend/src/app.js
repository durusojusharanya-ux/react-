import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Management API is running.',
    timestamp: new Date().toISOString(),
  });
});

// ─── Interactive API Documentation Endpoint ───────────────────────────────────
app.get('/api/docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TaskFlow REST API Documentation</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Fira+Code&display=swap">
  <style>
    body { font-family: 'Inter', sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: #1e293b; border-radius: 12px; padding: 2.5rem; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
    h1 { color: #818cf8; margin-top: 0; }
    h2 { color: #38bdf8; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; margin-top: 2rem; }
    .endpoint { background: #0f172a; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1rem; border-left: 4px solid #6366f1; }
    .method { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; margin-right: 8px; }
    .post { background: #10b981; color: #fff; }
    .get { background: #3b82f6; color: #fff; }
    .put { background: #f59e0b; color: #fff; }
    .delete { background: #ef4444; color: #fff; }
    code { font-family: 'Fira Code', monospace; background: #334155; padding: 2px 6px; border-radius: 4px; font-size: 0.88rem; color: #fbcfe8; }
    pre { background: #090d16; padding: 1rem; border-radius: 6px; overflow-x: auto; font-family: 'Fira Code', monospace; font-size: 0.85rem; color: #38bdf8; }
    .badge { background: #4f46e5; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 TaskFlow REST API Documentation</h1>
    <p>Version 1.0.0 &bull; Base URL: <code>http://localhost:5000/api</code> &bull; Database: SQLite (Persistent with WAL mode)</p>
    
    <h2>1. Authentication</h2>
    <div class="endpoint">
      <span class="method post">POST</span> <code>/api/auth/register</code>
      <p>Register a new user account with hashed password and receive a signed JWT token.</p>
      <pre>Body: { "name": "Jane", "email": "jane@example.com", "password": "Password123" }
Response: 201 Created -> { "success": true, "data": { "user": {...}, "token": "..." } }</pre>
    </div>

    <div class="endpoint">
      <span class="method post">POST</span> <code>/api/auth/login</code>
      <p>Log in with valid credentials.</p>
      <pre>Body: { "email": "jane@example.com", "password": "Password123" }
Response: 200 OK -> { "success": true, "data": { "user": {...}, "token": "..." } }</pre>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span> <code>/api/auth/me</code> <span class="badge">Protected</span>
      <p>Fetch the currently authenticated user profile.</p>
      <pre>Header: Authorization: Bearer &lt;token&gt;
Response: 200 OK -> { "success": true, "data": { "user": {...} } }</pre>
    </div>

    <h2>2. Tasks CRUD</h2>
    <div class="endpoint">
      <span class="method get">GET</span> <code>/api/tasks</code> <span class="badge">Protected</span>
      <p>Fetch tasks owned by authenticated user. Query params: <code>?status=pending|in-progress|completed</code>, <code>?priority=low|medium|high</code></p>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span> <code>/api/tasks/:id</code> <span class="badge">Protected</span>
      <p>Retrieve a single owned task by ID.</p>
    </div>

    <div class="endpoint">
      <span class="method post">POST</span> <code>/api/tasks</code> <span class="badge">Protected</span>
      <p>Create a new task for the authenticated user.</p>
      <pre>Body: { "title": "Review PR", "description": "...", "status": "pending", "priority": "high", "dueDate": "2026-12-31" }
Response: 201 Created</pre>
    </div>

    <div class="endpoint">
      <span class="method put">PUT</span> <code>/api/tasks/:id</code> <span class="badge">Protected</span>
      <p>Update an existing task owned by authenticated user.</p>
      <pre>Body: { "status": "completed" }
Response: 200 OK</pre>
    </div>

    <div class="endpoint">
      <span class="method delete">DELETE</span> <code>/api/tasks/:id</code> <span class="badge">Protected</span>
      <p>Permanently remove an owned task.</p>
      <pre>Response: 200 OK -> { "success": true, "message": "Task deleted successfully." }</pre>
    </div>

    <h2>3. Activity Timeline</h2>
    <div class="endpoint">
      <span class="method get">GET</span> <code>/api/activities</code> <span class="badge">Protected</span>
      <p>Retrieve the authenticated user's recent audit activities (create, update, status change, delete).</p>
      <pre>Response: 200 OK -> { "success": true, "count": 5, "data": { "activities": [...] } }</pre>
    </div>
  </div>
</body>
</html>`);
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/activities', activityRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);       // 404 for unmatched routes
app.use(errorHandler);   // centralised error handler

export default app;
