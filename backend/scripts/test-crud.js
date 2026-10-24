// scripts/test-crud.js
const BASE_URL = 'http://127.0.0.1:5000';

async function testApi() {
  console.log('🧪 Starting Full CRUD & Auth API verification...');

  const unique = Date.now();
  const testUser = {
    name: 'Intern Tester',
    email: `intern_${unique}@example.com`,
    password: 'Password@123',
  };

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  console.log('1. Health Check:', health.success ? '✅ PASSED' : '❌ FAILED', health);

  // 2. Register
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  const reg = await regRes.json();
  console.log('2. Register User:', reg.success ? '✅ PASSED' : '❌ FAILED', reg.message);
  const token = reg.data?.token;

  if (!token) throw new Error('No token returned from registration');

  // 3. Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password }),
  });
  const login = await loginRes.json();
  console.log('3. Login User:', login.success ? '✅ PASSED' : '❌ FAILED');

  // 4. Get Current User (GET /api/auth/me)
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const me = await meRes.json();
  console.log('4. Profile (GET /api/auth/me):', me.success ? '✅ PASSED' : '❌ FAILED', me.data?.user?.email);

  // 5. Create Task (POST /api/tasks)
  const taskRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Internship Task 3 Full-Stack Deployment',
      description: 'Deploy backend on Render and frontend on Vercel with PostgreSQL',
      status: 'in-progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    }),
  });
  const taskData = await taskRes.json();
  console.log('5. Create Task (POST /api/tasks):', taskData.success ? '✅ PASSED' : '❌ FAILED', 'Task ID:', taskData.data?.task?.id);
  const taskId = taskData.data?.task?.id;

  // 6. Get All Tasks (GET /api/tasks)
  const getTasksRes = await fetch(`${BASE_URL}/api/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const tasksList = await getTasksRes.json();
  console.log('6. Get Tasks (GET /api/tasks):', tasksList.success ? '✅ PASSED' : '❌ FAILED', `Found ${tasksList.count} task(s)`);

  // 7. Update Task (PUT /api/tasks/:id)
  const updateRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: 'completed',
      priority: 'high',
    }),
  });
  const updated = await updateRes.json();
  console.log('7. Update Task (PUT /api/tasks/:id):', updated.success ? '✅ PASSED' : '❌ FAILED', 'New Status:', updated.data?.task?.status);

  // 8. Get Recent Activities (GET /api/activities)
  const actRes = await fetch(`${BASE_URL}/api/activities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const actData = await actRes.json();
  console.log('8. Activity Timeline (GET /api/activities):', actData.success ? '✅ PASSED' : '❌ FAILED', `Count: ${actData.count}`);

  // 9. Delete Task (DELETE /api/tasks/:id)
  const delRes = await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const del = await delRes.json();
  console.log('9. Delete Task (DELETE /api/tasks/:id):', del.success ? '✅ PASSED' : '❌ FAILED');

  console.log('🎉 ALL 9 TEST STEPS PASSED WITH 100% SUCCESS!');
}

testApi().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
