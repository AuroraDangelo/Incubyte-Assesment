import type { Database } from 'better-sqlite3';
import type { Vehicle } from '../types';

export interface VehicleFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** Escapes LIKE wildcards so user input is matched literally. */
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/** Persistence gateway for vehicles. */
export class VehicleRepository {
  constructor(private readonly db: Database) {}

  create(v: Omit<Vehicle, 'id'>): Vehicle {
    const info = this.db
      .prepare('INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)')
      .run(v.make, v.model, v.category, v.price, v.quantity);
    return { id: Number(info.lastInsertRowid), ...v };
  }

  findById(id: number): Vehicle | undefined {
    return this.db.prepare('SELECT id, make, model, category, price, quantity FROM vehicles WHERE id = ?').get(id) as
      | Vehicle
      | undefined;
  }

  findAll(filters: VehicleFilters = {}): Vehicle[] {
    const where: string[] = [];
    const params: Array<string | number> = [];

    for (const col of ['make', 'model', 'category'] as const) {
      const value = filters[col];
      if (value) {
        where.push(`${col} LIKE ? ESCAPE '\\' COLLATE NOCASE`);
        params.push(`%${escapeLike(value)}%`);
      }
    }
    if (filters.minPrice !== undefined) {
      where.push('price >= ?');
      params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      where.push('price <= ?');
      params.push(filters.maxPrice);
    }

    const sql =
      'SELECT id, make, model, category, price, quantity FROM vehicles' +
      (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
      ' ORDER BY make COLLATE NOCASE, model COLLATE NOCASE';
    return this.db.prepare(sql).all(...params) as Vehicle[];
  }

  update(id: number, patch: Partial<Omit<Vehicle, 'id'>>): Vehicle | undefined {
    const cols = Object.keys(patch) as Array<keyof typeof patch>;
    if (cols.length) {
      const set = cols.map((c) => `${c} = ?`).join(', ');
      this.db
        .prepare(`UPDATE vehicles SET ${set}, updated_at = datetime('now') WHERE id = ?`)
        .run(...cols.map((c) => patch[c] as string | number), id);
    }
    return this.findById(id);
  }

  delete(id: number): boolean {
    return this.db.prepare('DELETE FROM vehicles WHERE id = ?').run(id).changes > 0;
  }

  /**
   * Atomically removes `qty` units. The `quantity >= ?` guard sits inside the
   * UPDATE itself, so concurrent buyers can never push stock below zero.
   * @returns true when the stock was decremented, false if there was not enough.
   */
  decrementStock(id: number, qty: number): boolean {
    return (
      this.db
        .prepare("UPDATE vehicles SET quantity = quantity - ?, updated_at = datetime('now') WHERE id = ? AND quantity >= ?")
        .run(qty, id, qty).changes > 0
    );
  }

  /** Atomically adds `qty` units to stock. */
  incrementStock(id: number, qty: number): boolean {
    return (
      this.db
        .prepare("UPDATE vehicles SET quantity = quantity + ?, updated_at = datetime('now') WHERE id = ?")
        .run(qty, id).changes > 0
    );
  }
}
