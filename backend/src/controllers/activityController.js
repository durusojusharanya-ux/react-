import { getDb } from '../config/db.js';

export async function getRecentActivities(req, res, next) {
  try {
    const userId = req.userId;
    const db = getDb();
    const limit = Math.min(parseInt(req.query.limit, 10) || 15, 50);

    const activities = await db.all(
      'SELECT * FROM activities WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
      [userId, limit]
    );

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities },
    });
  } catch (error) {
    next(error);
  }
}
