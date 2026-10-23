import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the data directory (two levels up from src/config/)
const dataDir = path.join(__dirname, '..', '..', 'data');

// Ensure the data directory exists before SQLite tries to create the file
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tasks.db');

let db;

/**
 * Initialize the SQLite database connection and create tables if they do not exist.
 * Uses the built-in node:sqlite module — no native addons, no compilation needed.
 */
export function initializeDatabase() {
  try {
    db = new DatabaseSync(dbPath);

    // Enable WAL mode for better concurrent read performance
    db.exec('PRAGMA journal_mode = WAL');

    // CRITICAL: enforce foreign-key constraints
    db.exec('PRAGMA foreign_keys = ON');

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
        password    TEXT    NOT NULL,
        createdAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updatedAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);

    // Create tasks table with a foreign key to users
    db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        description TEXT,
        status      TEXT    NOT NULL DEFAULT 'pending'
                            CHECK(status IN ('pending', 'in-progress', 'completed')),
        priority    TEXT    NOT NULL DEFAULT 'medium'
                            CHECK(priority IN ('low', 'medium', 'high')),
        dueDate     TEXT,
        userId      INTEGER NOT NULL,
        createdAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updatedAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create activities table for user timeline
    db.exec(`
      CREATE TABLE IF NOT EXISTS activities (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        userId      INTEGER NOT NULL,
        action      TEXT    NOT NULL,
        details     TEXT    NOT NULL,
        taskId      INTEGER,
        taskTitle   TEXT,
        createdAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log(`✅ SQLite database initialized at: ${dbPath}`);
    return db;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    process.exit(1);
  }
}

/**
 * Safely record an audit activity log entry for a user.
 */
export function logActivity(userId, action, details, taskId = null, taskTitle = null) {
  try {
    const database = getDb();
    database.prepare(`
      INSERT INTO activities (userId, action, details, taskId, taskTitle)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, action, details, taskId, taskTitle);
  } catch (err) {
    console.error('[ACTIVITY LOG ERROR]', err.message);
  }
}

/**
 * Return the active database instance.
 * Call initializeDatabase() before calling getDb().
 */
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}
