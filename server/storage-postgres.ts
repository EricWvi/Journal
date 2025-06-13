import { Pool } from "pg";
import { type Entry, type InsertEntry } from "@shared/schema";
import type { IStorage } from "./storage";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // or use host, user, password, etc.
});

export class PostgresStorage implements IStorage {
  async getEntries(): Promise<Entry[]> {
    const res = await pool.query("SELECT * FROM entries ORDER BY createdAt DESC");
    return res.rows;
  }

  async getEntry(id: number): Promise<Entry | undefined> {
    const res = await pool.query("SELECT * FROM entries WHERE id = $1", [id]);
    return res.rows[0];
  }

  async createEntry(entry: InsertEntry): Promise<Entry> {
    const res = await pool.query(
      `INSERT INTO entries (title, content, photos, mood, location, weather, createdAt, updatedAt)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [entry.title, entry.content, entry.photos, entry.mood, entry.location, entry.weather]
    );
    return res.rows[0];
  }

  async updateEntry(id: number, entry: Partial<InsertEntry>): Promise<Entry | undefined> {
    // Build dynamic SET clause for partial updates
    const fields = Object.keys(entry);
    if (fields.length === 0) return this.getEntry(id);

    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
    const values = fields.map(f => (entry as any)[f]);
    values.unshift(id);

    const res = await pool.query(
      `UPDATE entries SET ${setClause}, updatedAt = NOW() WHERE id = $1 RETURNING *`,
      values
    );
    return res.rows[0];
  }

  async deleteEntry(id: number): Promise<boolean> {
    const res = await pool.query("DELETE FROM entries WHERE id = $1", [id]);
    return res.rowCount > 0;
  }

  async searchEntries(query: string): Promise<Entry[]> {
    const q = `%${query.toLowerCase()}%`;
    const res = await pool.query(
      `SELECT * FROM entries WHERE
        LOWER(title) LIKE $1 OR
        LOWER(content) LIKE $1 OR
        LOWER(COALESCE(mood, '')) LIKE $1 OR
        LOWER(COALESCE(location, '')) LIKE $1
       ORDER BY createdAt DESC`,
      [q]
    );
    return res.rows;
  }
}