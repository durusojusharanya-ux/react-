// src/controllers/activityController.js
import { getDb } from '../config/db.js';

/**
 * GET /api/activities
 * Retrieve the authenticated user's recent activity timeline.
 */
export function getActivities(req, res, next) {
  try {
    const userId = req.userId;
    const db = getDb();

    // Query recent activities for this user only
    const limit = parseInt(req.query.limit, 10) || 15;
    const activities = db
      .prepare(`
        SELECT id, userId, action, details, taskId, taskTitle, createdAt
        FROM activities
        WHERE userId = ?
        ORDER BY createdAt DESC
        LIMIT ?
      `)
      .all(userId, limit);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
}
