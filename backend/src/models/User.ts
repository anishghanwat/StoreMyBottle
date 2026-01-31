// User model for database operations
// This will be used to sync Clerk users to local database

import { Pool } from 'pg';
import { getPool } from '../config/database';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  password_hash?: string;
  role: 'customer' | 'bartender' | 'admin';
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  id: string; // Clerk user ID
  email?: string;
  phone?: string;
  role?: 'customer' | 'bartender' | 'admin';
}

export class UserModel {
  private _pool: Pool | null = null;

  private get pool(): Pool {
    if (!this._pool) {
      this._pool = getPool();
    }
    return this._pool;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    );
    return result.rows[0] || null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const { id, email, phone, role = 'customer' } = input;
    
    const result = await this.pool.query(
      `INSERT INTO users (id, email, phone, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, email || null, phone || null, role]
    );
    
    return result.rows[0];
  }

  async updateRole(id: string, role: 'customer' | 'bartender' | 'admin'): Promise<User> {
    const result = await this.pool.query(
      `UPDATE users 
       SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [role, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  }
}
