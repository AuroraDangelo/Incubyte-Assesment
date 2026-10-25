import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Database } from 'better-sqlite3';
import { createDatabase } from '../db';

/**
 * Creates a throw-away SQLite *file* database (the kata forbids in-memory DBs)
 * and returns it along with a cleanup callback.
 */
export function createTestDatabase(): { db: Database; cleanup: () => void } {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dealership-'));
  const db = createDatabase(path.join(dir, 'test.db'));
  return {
    db,
    cleanup: () => {
      db.close();
      fs.rmSync(dir, { recursive: true, force: true });
    },
  };
}
