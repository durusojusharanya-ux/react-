import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

/**
 * Protect routes by verifying the JWT from the Authorization header.
 * On success, attaches req.userId so controllers never trust client-supplied IDs.
 */
export function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify signature and expiration
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please log in again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in.',
      });
    }

    // Confirm the user still exists in the database
    const db = getDb();
    const user = db
      .prepare('SELECT id FROM users WHERE id = ?')
      .get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Attach only the database ID — never the client-provided value
    req.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
}
