import { getDb, logActivity } from '../config/db.js';

// Convert dates cleanly for queries
function serializeDueDate(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === '' || value === undefined) return null;
  return value || null;
}

// Format task row for API response
function formatTask(task) {
  if (!task) return null;
  return {
    ...task,
    id: typeof task.id === 'string' ? parseInt(task.id, 10) : task.id,
    userId: typeof task.userId === 'string' ? parseInt(task.userId, 10) : task.userId,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
    dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : (task.dueDate || null),
  };
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
export async function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.userId; // always from JWT, never from client body
    const db = getDb();

    const result = await db.run(
      'INSERT INTO tasks (title, description, status, priority, dueDate, userId) VALUES (?, ?, ?, ?, ?, ?)',
      [
        title.trim(),
        description ? description.trim() : null,
        status || 'pending',
        priority || 'medium',
        serializeDueDate(dueDate),
        userId,
      ]
    );

    const task = result.row || await db.get('SELECT * FROM tasks WHERE id = ?', [result.lastInsertRowid]);

    await logActivity(userId, 'TASK_CREATED', `Created task "${task.title}"`, task.id, task.title);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
export async function getTasks(req, res, next) {
  try {
    const userId = req.userId;
    const db = getDb();

    // Support optional query-string filters
    const { status, priority } = req.query;

    let sql = 'SELECT * FROM tasks WHERE userId = ?';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY createdAt DESC';

    const tasks = await db.all(sql, params);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks: tasks.map(formatTask) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
export async function getTaskById(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.userId;
    const db = getDb();

    // Enforce ownership in the SQL query itself
    const task = await db.get(
      'SELECT * FROM tasks WHERE id = ? AND userId = ?',
      [taskId, userId]
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { task: formatTask(task) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
export async function updateTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.userId;
    const db = getDb();

    // Verify the task exists and belongs to this user
    const existing = await db.get(
      'SELECT * FROM tasks WHERE id = ? AND userId = ?',
      [taskId, userId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Build update only for provided fields
    const { title, description, status, priority, dueDate } = req.body;

    const updatedTitle       = title       !== undefined ? title.trim()       : existing.title;
    const updatedDescription = description !== undefined ? (description ? description.trim() : null) : existing.description;
    const updatedStatus      = status      !== undefined ? status              : existing.status;
    const updatedPriority    = priority    !== undefined ? priority            : existing.priority;
    const updatedDueDate     = dueDate     !== undefined ? serializeDueDate(dueDate) : existing.dueDate;
    const updatedAt          = new Date().toISOString();

    const result = await db.run(
      'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, updatedAt = ? WHERE id = ? AND userId = ?',
      [
        updatedTitle,
        updatedDescription,
        updatedStatus,
        updatedPriority,
        updatedDueDate,
        updatedAt,
        taskId,
        userId,
      ]
    );

    const updatedTask = result.row || await db.get('SELECT * FROM tasks WHERE id = ?', [taskId]);

    await logActivity(userId, 'TASK_UPDATED', `Updated task "${updatedTask.title}"`, updatedTask.id, updatedTask.title);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: { task: formatTask(updatedTask) },
    });
  } catch (error) {
    next(error);
  }
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
export async function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.userId;
    const db = getDb();

    const existing = await db.get(
      'SELECT id, title FROM tasks WHERE id = ? AND userId = ?',
      [taskId, userId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    const result = await db.run('DELETE FROM tasks WHERE id = ? AND userId = ?', [taskId, userId]);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    await logActivity(userId, 'TASK_DELETED', `Deleted task "${existing.title}"`, taskId, existing.title);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
