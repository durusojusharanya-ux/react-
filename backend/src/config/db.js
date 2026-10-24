import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;
let dbHealth = {
  type: 'uninitialized',
  status: 'disconnected',
};

/**
 * Convert standard SQL with ? parameter placeholders to PostgreSQL $1, $2, ... placeholders,
 * and quote camelCase column names so they match the schema casing in PostgreSQL.
 */
function toPgSql(sql) {
  let index = 1;
  let pgSql = sql.replace(/\?/g, () => `$${index++}`);
  // Quote case-sensitive camelCase columns in PostgreSQL
  pgSql = pgSql.replace(/\b(userId|dueDate|createdAt|updatedAt|taskId|taskTitle)\b/g, '"$1"');
  return pgSql;
}

/**
 * PostgreSQL Database Adapter implementation
 */
class PostgresAdapter {
  constructor(pool) {
    this.pool = pool;
    this.type = 'postgres';
    this.isPostgres = true;
  }

  async get(sql, params = []) {
    const pgSql = toPgSql(sql);
    const result = await this.pool.query(pgSql, params);
    return result.rows[0] || null;
  }

  async all(sql, params = []) {
    const pgSql = toPgSql(sql);
    const result = await this.pool.query(pgSql, params);
    return result.rows;
  }

  async run(sql, params = []) {
    let pgSql = toPgSql(sql);
    const upper = pgSql.trim().toUpperCase();
    if ((upper.startsWith('INSERT') || upper.startsWith('UPDATE')) && !upper.includes('RETURNING')) {
      pgSql += ' RETURNING *';
    }
    const result = await this.pool.query(pgSql, params);
    const row = result.rows[0] || null;
    return {
      changes: result.rowCount || 0,
      lastInsertRowid: row ? row.id : null,
      row,
    };
  }

  async query(sql, params = []) {
    const pgSql = toPgSql(sql);
    return this.pool.query(pgSql, params);
  }
}

/**
 * SQLite Database Adapter implementation (using node:sqlite)
 */
class SqliteAdapter {
  constructor(sqliteDb) {
    this.sqliteDb = sqliteDb;
    this.type = 'sqlite';
    this.isPostgres = false;
  }

  async get(sql, params = []) {
    const stmt = this.sqliteDb.prepare(sql);
    const row = stmt.get(...params);
    return row || null;
  }

  async all(sql, params = []) {
    const stmt = this.sqliteDb.prepare(sql);
    return stmt.all(...params);
  }

  async run(sql, params = []) {
    const stmt = this.sqliteDb.prepare(sql);
    const res = stmt.run(...params);
    return {
      changes: res.changes,
      lastInsertRowid: res.lastInsertRowid,
      row: null,
    };
  }

  async query(sql, params = []) {
    return this.all(sql, params);
  }

  prepare(sql) {
    return this.sqliteDb.prepare(sql);
  }

  exec(sql) {
    return this.sqliteDb.exec(sql);
  }
}

/**
 * Initialize PostgreSQL connection, SSL, and schema
 */
async function initPostgres(connectionString) {
  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  // Test connectivity
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }

  // Create tables safely if not exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending'
             CHECK(status IN ('pending', 'in-progress', 'completed')),
      priority VARCHAR(50) NOT NULL DEFAULT 'medium'
             CHECK(priority IN ('low', 'medium', 'high')),
      "dueDate" TIMESTAMPTZ,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action VARCHAR(255) NOT NULL,
      details TEXT NOT NULL,
      "taskId" INTEGER,
      "taskTitle" VARCHAR(255),
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('✅ Connected to Hosted PostgreSQL Database and verified schema.');
  dbHealth = { type: 'postgres', status: 'connected' };
  dbInstance = new PostgresAdapter(pool);
  return dbInstance;
}

/**
 * Initialize SQLite connection and schema (fallback for local development)
 */
async function initSqlite() {
  const { DatabaseSync } = await import('node:sqlite');
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'tasks.db');
  const sqlite = new DatabaseSync(dbPath);

  sqlite.exec('PRAGMA journal_mode = WAL');
  sqlite.exec('PRAGMA foreign_keys = ON');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password    TEXT    NOT NULL,
      createdAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updatedAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

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
    );

    CREATE TABLE IF NOT EXISTS activities (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      userId      INTEGER NOT NULL,
      action      TEXT    NOT NULL,
      details     TEXT    NOT NULL,
      taskId      INTEGER,
      taskTitle   TEXT,
      createdAt   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log(`✅ SQLite database initialized at: ${dbPath}`);
  dbHealth = { type: 'sqlite', status: 'connected', path: dbPath };
  dbInstance = new SqliteAdapter(sqlite);
  return dbInstance;
}

/**
 * Initialize the database connection.
 * Connects to PostgreSQL if DATABASE_URL is set, otherwise initializes SQLite.
 */
export async function initializeDatabase() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://'))) {
      console.log('🔗 Connecting to Hosted PostgreSQL via DATABASE_URL...');
      return await initPostgres(databaseUrl);
    } else {
      console.log('ℹ️  No PostgreSQL DATABASE_URL found. Initializing local SQLite database...');
      return await initSqlite();
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    dbHealth = { type: 'failed', status: error.message };
    throw error;
  }
}

/**
 * Safely log an audit activity entry for a user
 */
export async function logActivity(userId, action, details, taskId = null, taskTitle = null) {
  try {
    const db = getDb();
    await db.run(
      'INSERT INTO activities (userId, action, details, taskId, taskTitle) VALUES (?, ?, ?, ?, ?)',
      [userId, action, details, taskId, taskTitle]
    );
  } catch (err) {
    console.warn('[ACTIVITY LOG WARNING]', err.message);
  }
}

/**
 * Return the active database adapter
 */
export function getDb() {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return dbInstance;
}

/**
 * Health check status helper
 */
export function getDbHealth() {
  return dbHealth;
}
