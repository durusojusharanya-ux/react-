import { getDb } from '../config/db.js';

// node:sqlite only accepts strings, numbers, bigint, null, or Uint8Array.
// express-validator's .toDate() converts dueDate to a Date object — convert it back.
function serializeDueDate(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === '' || value === undefined) return null;
  return value || null;
}

// ─── Helper: strip internal fields from a DB row ─────────────────────────────
function formatTask(task) {
  return { ...task };
}

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
export function createTask(req, res, next) {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const userId = req.userId; // always from JWT, never from client body
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, status, priority, dueDate, userId)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title.trim(),
      description ? description.trim() : null,
      status || 'pending',
      priority || 'medium',
      serializeDueDate(dueDate),
      userId
    );

    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .get(result.lastInsertRowid);

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
export function getTasks(req, res, next) {
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

    const tasks = db.prepare(sql).all(...params);

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
export function getTaskById(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.userId;
    const db = getDb();

    // Enforce ownership in the SQL query itself
    const task = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?')
      .get(taskId, userId);

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
export function updateTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.userId;
    const db = getDb();

    // Verify the task exists and belongs to this user
    const existing = db
      .prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?')
      .get(taskId, userId);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    // Build an update only for fields explicitly provided in the body
    // Disallow changing userId or id
    const { title, description, status, priority, dueDate } = req.body;

    const updatedTitle       = title       !== undefined ? title.trim()       : existing.title;
    const updatedDescription = description !== undefined ? (description ? description.trim() : null) : existing.description;
    const updatedStatus      = status      !== undefined ? status              : existing.status;
    const updatedPriority    = priority    !== undefined ? priority            : existing.priority;
    const updatedDueDate     = dueDate     !== undefined ? serializeDueDate(dueDate) : existing.dueDate;
    const updatedAt          = new Date().toISOString();

    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?, dueDate = ?, updatedAt = ?
      WHERE id = ? AND userId = ?
    `).run(
      updatedTitle,
      updatedDescription,
      updatedStatus,
      updatedPriority,
      updatedDueDate,
      updatedAt,
      taskId,
      userId
    );

    const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

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
export function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.userId;
    const db = getDb();

    // Ownership enforced in WHERE clause
    const result = db
      .prepare('DELETE FROM tasks WHERE id = ? AND userId = ?')
      .run(taskId, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
}
