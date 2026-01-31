// Venue model for database operations

import { Pool } from 'pg';
import { getPool } from '../config/database';

export interface Venue {
  id: string;
  name: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVenueInput {
  name: string;
  address: string;
}

export class VenueModel {
  private _pool: Pool | null = null;

  private get pool(): Pool {
    if (!this._pool) {
      this._pool = getPool();
    }
    return this._pool;
  }

  async findAll(): Promise<Venue[]> {
    const result = await this.pool.query(
      'SELECT * FROM venues ORDER BY name ASC'
    );
    return result.rows;
  }

  async findById(id: string): Promise<Venue | null> {
    const result = await this.pool.query(
      'SELECT * FROM venues WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(input: CreateVenueInput): Promise<Venue> {
    const { name, address } = input;

    const result = await this.pool.query(
      `INSERT INTO venues (name, address)
       VALUES ($1, $2)
       RETURNING *`,
      [name, address]
    );

    return result.rows[0];
  }

  async update(id: string, input: Partial<CreateVenueInput>): Promise<Venue> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(input.name);
    }
    if (input.address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(input.address);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await this.pool.query(
      `UPDATE venues 
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Venue not found');
    }

    return result.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      'DELETE FROM venues WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  async findBottlesByVenueId(venueId: string): Promise<any[]> {
    const result = await this.pool.query(
      'SELECT * FROM bottles WHERE venue_id = $1',
      [venueId]
    );
    return result.rows;
  }
}