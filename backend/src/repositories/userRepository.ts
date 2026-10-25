import type { Database } from 'better-sqlite3';
import type { Role, User, UserWithHash } from '../types';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
}

const toUserWithHash = (r: UserRow): UserWithHash => ({
  id: r.id,
  name: r.name,
  email: r.email,
  role: r.role,
  passwordHash: r.password_hash,
});

/** Persistence gateway for users (SQL lives here and nowhere else). */
export class UserRepository {
  constructor(private readonly db: Database) {}

  create(input: { name: string; email: string; passwordHash: string; role?: Role }): User {
    const info = this.db
      .prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(input.name, input.email, input.passwordHash, input.role ?? 'user');
    return { id: Number(info.lastInsertRowid), name: input.name, email: input.email, role: input.role ?? 'user' };
  }

  findByEmail(email: string): UserWithHash | undefined {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
    return row && toUserWithHash(row);
  }

  findById(id: number): User | undefined {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
    if (!row) return undefined;
    const { passwordHash: _omit, ...user } = toUserWithHash(row);
    return user;
  }
}
