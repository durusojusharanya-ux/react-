import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/db.js';

/**
 * Generate a signed JWT for the given user id.
 */
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

/**
 * Strip the password field from a user row before returning it to the client.
 */
function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const db = getDb();

    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Check for duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the new user
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name.trim(), normalizedEmail, hashedPassword);
    const userId = result.lastInsertRowid;

    // Retrieve the newly created user (without password)
    const newUser = db.prepare('SELECT id, name, email, createdAt, updatedAt FROM users WHERE id = ?').get(userId);

    const token = generateToken(userId);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: newUser,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const normalizedEmail = email.trim().toLowerCase();

    // Look up user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare provided password with hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: safeUser(user),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export function getMe(req, res, next) {
  try {
    const db = getDb();
    // req.userId is attached by the auth middleware
    const user = db
      .prepare('SELECT id, name, email, createdAt, updatedAt FROM users WHERE id = ?')
      .get(req.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}
