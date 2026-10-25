import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import type { Database as Db } from 'better-sqlite3';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  make       TEXT    NOT NULL,
  model      TEXT    NOT NULL,
  category   TEXT    NOT NULL,
  price      REAL    NOT NULL CHECK (price >= 0),
  quantity   INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vehicles_make     ON vehicles (make);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles (category);
`;

/**
 * Opens (or creates) a file-backed SQLite database and applies the schema.
 * Foreign keys and WAL are enabled for integrity and read concurrency.
 */
export function createDatabase(filePath: string): Db {
  if (filePath !== ':memory:') {
    const dir = path.dirname(filePath);
    if (dir && !fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  const db = new Database(filePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}
