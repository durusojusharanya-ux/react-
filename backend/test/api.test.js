import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import app from '../src/app.js';
import { initializeDatabase } from '../src/config/db.js';

let server;
let baseUrl;

// Test variables
let userAToken = '';
let userBToken = '';
let createdTaskId = null;

const uniqueId = Date.now();
const userAData = {
  name: 'Test User A',
  email: `testA_${uniqueId}@example.com`,
  password: 'Password@123',
};

const userBData = {
  name: 'Test User B',
  email: `testB_${uniqueId}@example.com`,
  password: 'Password@123',
};

before(async () => {
  // Ensure DB initialized
  initializeDatabase();

  // Start app on ephemeral port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(() => {
  if (server) server.close();
});

describe('TaskFlow API - Comprehensive Automated Test Suite', () => {
  // 1. Health check
  test('1. GET /api/health should return 200 and running status', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.match(body.message, /running/i);
  });

  // 2. Register User A
  test('2. POST /api/auth/register should create user and return JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, userAData.email.toLowerCase());
    userAToken = body.data.token;
  });

  // 3. Register Duplicate Email
  test('3. POST /api/auth/register with duplicate email should return 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userAData),
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // 4. Register Validation Failure
  test('4. POST /api/auth/register with missing fields should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete' }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // 5. Login User A
  test('5. POST /api/auth/login with valid credentials should return 200 and JWT', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAData.email,
        password: userAData.password,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
  });

  // 6. Login Invalid Password
  test('6. POST /api/auth/login with invalid password should return 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userAData.email,
        password: 'WrongPassword!',
      }),
    });
    assert.equal(res.status, 401);
  });

  // 7. Protected Route Without Token
  test('7. GET /api/auth/me without token should return 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
  });

  // 8. Protected Route With Valid Token
  test('8. GET /api/auth/me with valid token should return 200 and user profile', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, userAData.email.toLowerCase());
  });

  // 9. Create Task
  test('9. POST /api/tasks with valid body should return 201 and created task', async () => {
    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: 'Automated Test Task',
        description: 'Testing SQLite task persistence',
        status: 'pending',
        priority: 'high',
        dueDate: '2026-12-31',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.task.title, 'Automated Test Task');
    assert.equal(body.data.task.priority, 'high');
    createdTaskId = body.data.task.id;
    assert.ok(createdTaskId);
  });

  // 10. Create Task Validation Error
  test('10. POST /api/tasks with invalid body should return 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: '', // Empty title
        status: 'invalid-status',
      }),
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  // 11. Get All Tasks
  test('11. GET /api/tasks should return list containing created task', async () => {
    const res = await fetch(`${baseUrl}/api/tasks`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.tasks));
    const found = body.data.tasks.find((t) => t.id === createdTaskId);
    assert.ok(found);
    assert.equal(found.title, 'Automated Test Task');
  });

  // 12. Get Task by ID
  test('12. GET /api/tasks/:id should return single task details', async () => {
    const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.task.id, createdTaskId);
  });

  // 13. Update Task
  test('13. PUT /api/tasks/:id should update status to in-progress', async () => {
    const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        status: 'in-progress',
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.task.status, 'in-progress');
  });

  // 14. Activity Timeline
  test('14. GET /api/activities should return logged timeline events', async () => {
    const res = await fetch(`${baseUrl}/api/activities`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.activities));
    assert.ok(body.data.activities.length >= 2); // created and status_changed
  });

  // 15. Cross-User Authorization & Isolation
  test('15. User B cannot read, update, or delete User A task (returns 404)', async () => {
    // Register User B
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userBData),
    });
    const regBody = await regRes.json();
    userBToken = regBody.data.token;

    // User B attempts to GET User A's task
    const getRes = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert.equal(getRes.status, 404);

    // User B attempts to PUT User A's task
    const putRes = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userBToken}`,
      },
      body: JSON.stringify({ title: 'Hacked Title' }),
    });
    assert.equal(putRes.status, 404);

    // User B attempts to DELETE User A's task
    const delRes = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert.equal(delRes.status, 404);
  });

  // 16. Delete Task (Owner)
  test('16. DELETE /api/tasks/:id by owner should return 200 and remove task', async () => {
    const res = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.equal(res.status, 200);

    // Verify task is now 404
    const verifyRes = await fetch(`${baseUrl}/api/tasks/${createdTaskId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.equal(verifyRes.status, 404);
  });
});
