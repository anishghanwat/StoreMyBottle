// Bottle model for database operations

import { Pool } from 'pg';
import { getPool } from '../config/database';

export interface Bottle {
  id: string;
  venue_id: string;
  brand: string;
  type: string;
  size: string;
  price: number;
  pegs_total: number;
  pegs_remaining: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBottleInput {
  venue_id: string;
  brand: string;
  type: string;
  size: string;
  price: number;
  pegs_total: number;
  pegs_remaining: number;
  status?: string;
}

export class BottleModel {
  private _pool: Pool | null = null;

  private get pool(): Pool {
    if (!this._pool) {
      this._pool = getPool();
    }
    return this._pool;
  }

  async findByVenueId(venueId: string): Promise<Bottle[]> {
    const result = await this.pool.query(
      `SELECT * FROM bottles 
       WHERE venue_id = $1 AND status = 'available'
       ORDER BY brand, type ASC`,
      [venueId]
    );
    return result.rows.map(this.transformRow);
  }

  async findById(id: string): Promise<Bottle | null> {
    const result = await this.pool.query(
      'SELECT * FROM bottles WHERE id = $1',
      [id]
    );
    return result.rows[0] ? this.transformRow(result.rows[0]) : null;
  }

  async create(input: CreateBottleInput): Promise<Bottle> {
    const { venue_id, brand, type, size, price, pegs_total, pegs_remaining, status = 'available' } = input;

    const result = await this.pool.query(
      `INSERT INTO bottles (venue_id, brand, type, size, price, pegs_total, pegs_remaining, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [venue_id, brand, type, size, price, pegs_total, pegs_remaining, status]
    );

    return this.transformRow(result.rows[0]);
  }

  async update(id: string, input: Partial<CreateBottleInput>): Promise<Bottle> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build update query with proper parameterized queries
    if (input.brand !== undefined) {
      updates.push(`brand = $${paramCount++}`);
      values.push(input.brand);
    }
    if (input.type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(input.type);
    }
    if (input.size !== undefined) {
      updates.push(`size = $${paramCount++}`);
      values.push(input.size);
    }
    if (input.price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(input.price);
    }
    if (input.pegs_total !== undefined) {
      updates.push(`pegs_total = $${paramCount++}`);
      values.push(input.pegs_total);
    }
    if (input.pegs_remaining !== undefined) {
      updates.push(`pegs_remaining = $${paramCount++}`);
      values.push(input.pegs_remaining);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(input.status);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add ID parameter for WHERE clause
    values.push(id);

    const result = await this.pool.query(
      `UPDATE bottles 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Bottle not found');
    }

    return this.transformRow(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const result = await this.pool.query(
      'DELETE FROM bottles WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw new Error('Bottle not found');
    }
  }

  // Transform database row to ensure numeric types
  private transformRow(row: any): Bottle {
    return {
      ...row,
      price: parseFloat(row.price),
      pegs_total: parseInt(row.pegs_total, 10),
      pegs_remaining: parseInt(row.pegs_remaining, 10)
    };
  }

  async findPurchasesByBottleId(bottleId: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM purchases WHERE bottle_id = $1',
      [bottleId]
    );
    return result.rows;
  }
}