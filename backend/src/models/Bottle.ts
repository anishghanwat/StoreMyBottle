// Bottle model for database operations

import { Pool } from 'pg';
import { getPool } from '../config/database';

export interface Bottle {
  id: string;
  venue_id: string;
  name: string;
  brand: string;
  price: number;
  total_ml: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBottleInput {
  venue_id: string;
  name: string;
  brand: string;
  price: number;
  total_ml: number;
  is_active?: boolean;
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
       WHERE venue_id = $1 AND is_active = true
       ORDER BY brand, name ASC`,
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
    const { venue_id, name, brand, price, total_ml, is_active = true } = input;

    const result = await this.pool.query(
      `INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [venue_id, name, brand, price, total_ml, is_active]
    );

    return this.transformRow(result.rows[0]);
  }

  async update(id: string, input: Partial<CreateBottleInput>): Promise<Bottle> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Build update query with proper parameterized queries
    if (input.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(input.name);
    }
    if (input.brand !== undefined) {
      updates.push(`brand = $${paramCount++}`);
      values.push(input.brand);
    }
    if (input.price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(input.price);
    }
    if (input.total_ml !== undefined) {
      updates.push(`total_ml = $${paramCount++}`);
      values.push(input.total_ml);
    }
    if (input.is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(input.is_active);
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
      total_ml: parseInt(row.total_ml, 10)
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