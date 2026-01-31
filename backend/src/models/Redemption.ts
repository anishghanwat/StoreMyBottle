// Redemption model for database operations

import { Pool } from 'pg';
import { getPool } from '../config/database';

export type RedemptionStatus = 'pending' | 'served' | 'expired';
export type PegSize = 30 | 45 | 60;

export interface Redemption {
  id: string;
  purchase_id: string;
  user_id: string;
  peg_size_ml: PegSize;
  redemption_token: string;
  status: RedemptionStatus;
  created_at: Date;
  served_at: Date | null;
  served_by: string | null;
  expires_at: Date;
}

export interface CreateRedemptionInput {
  purchase_id: string;
  user_id: string;
  peg_size_ml: PegSize;
}

export class RedemptionModel {
  private _pool: Pool | null = null;

  private get pool(): Pool {
    if (!this._pool) {
      this._pool = getPool();
    }
    return this._pool;
  }

  async findByToken(token: string): Promise<Redemption | null> {
    const result = await this.pool.query(
      'SELECT * FROM redemptions WHERE redemption_token = $1',
      [token]
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId: string): Promise<Redemption[]> {
    const result = await this.pool.query(
      `SELECT r.*, p.bottle_id, b.name as bottle_name, b.brand
       FROM redemptions r
       JOIN purchases p ON r.purchase_id = p.id
       JOIN bottles b ON p.bottle_id = b.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async findByPurchaseId(purchaseId: string): Promise<Redemption[]> {
    const result = await this.pool.query(
      'SELECT * FROM redemptions WHERE purchase_id = $1 ORDER BY created_at DESC',
      [purchaseId]
    );
    return result.rows;
  }

  async create(input: CreateRedemptionInput): Promise<Redemption> {
    const { purchase_id, user_id, peg_size_ml } = input;
    
    const result = await this.pool.query(
      `INSERT INTO redemptions (purchase_id, user_id, peg_size_ml, status, expires_at)
       VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP + INTERVAL '24 hours')
       RETURNING *`,
      [purchase_id, user_id, peg_size_ml]
    );
    
    return result.rows[0];
  }

  async markAsServed(token: string, servedBy: string): Promise<Redemption> {
    const result = await this.pool.query(
      `UPDATE redemptions 
       SET status = 'served',
           served_at = CURRENT_TIMESTAMP,
           served_by = $1
       WHERE redemption_token = $2 
         AND status = 'pending'
         AND expires_at > CURRENT_TIMESTAMP
       RETURNING *`,
      [servedBy, token]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Redemption not found, already served, or expired');
    }
    
    return result.rows[0];
  }

  async markExpired(): Promise<void> {
    await this.pool.query(
      `UPDATE redemptions 
       SET status = 'expired'
       WHERE status = 'pending' 
         AND expires_at < CURRENT_TIMESTAMP`
    );
  }
}
