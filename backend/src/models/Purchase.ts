// Purchase model for database operations

import { Pool } from 'pg';
import { getPool } from '../config/database';

export type PaymentStatus = 'pending' | 'paid' | 'cancelled';

export interface Purchase {
  id: string;
  user_id: string;
  bottle_id: string;
  venue_id: string;
  payment_status: PaymentStatus;
  payment_qr_code: string | null;
  remaining_ml: number;
  created_at: Date;
  paid_at: Date | null;
  updated_at: Date;
}

export interface CreatePurchaseInput {
  user_id: string;
  bottle_id: string;
  venue_id: string;
  payment_qr_code?: string;
}

export class PurchaseModel {
  private _pool: Pool | null = null;

  private get pool(): Pool {
    if (!this._pool) {
      this._pool = getPool();
    }
    return this._pool;
  }

  async findById(id: string): Promise<Purchase | null> {
    const result = await this.pool.query(
      'SELECT * FROM purchases WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId: string, status?: PaymentStatus): Promise<Purchase[]> {
    let query = 'SELECT * FROM purchases WHERE user_id = $1';
    const params: any[] = [userId];
    
    if (status) {
      query += ' AND payment_status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async findPendingPayments(): Promise<Purchase[]> {
    const result = await this.pool.query(
      `SELECT p.*, b.name as bottle_name, b.brand, b.total_ml, v.name as venue_name
       FROM purchases p
       JOIN bottles b ON p.bottle_id = b.id
       JOIN venues v ON p.venue_id = v.id
       WHERE p.payment_status = 'pending'
       ORDER BY p.created_at ASC`
    );
    return result.rows;
  }

  async create(input: CreatePurchaseInput): Promise<Purchase> {
    const { user_id, bottle_id, venue_id, payment_qr_code } = input;
    
    const result = await this.pool.query(
      `INSERT INTO purchases (user_id, bottle_id, venue_id, payment_qr_code, payment_status, remaining_ml)
       VALUES ($1, $2, $3, $4, 'pending', 0)
       RETURNING *`,
      [user_id, bottle_id, venue_id, payment_qr_code || null]
    );
    
    return result.rows[0];
  }

  async markAsPaid(id: string, totalMl: number): Promise<Purchase> {
    const result = await this.pool.query(
      `UPDATE purchases 
       SET payment_status = 'paid',
           remaining_ml = $1,
           paid_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND payment_status = 'pending'
       RETURNING *`,
      [totalMl, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Purchase not found or already paid');
    }
    
    return result.rows[0];
  }

  async updateRemainingMl(id: string, remainingMl: number): Promise<Purchase> {
    const result = await this.pool.query(
      `UPDATE purchases 
       SET remaining_ml = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [remainingMl, id]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Purchase not found');
    }
    
    return result.rows[0];
  }
}
