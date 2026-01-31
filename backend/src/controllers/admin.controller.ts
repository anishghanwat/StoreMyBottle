// Admin controller
// Handles admin-only HTTP requests

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Pool } from 'pg';
import { getPool } from '../config/database';

function getPoolLazy(): Pool {
  return getPool();
}

/**
 * Get dashboard statistics
 * GET /api/admin/dashboard
 */
export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pool = getPoolLazy();
    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total purchases
    const purchasesResult = await pool.query('SELECT COUNT(*) as count FROM purchases');
    const totalPurchases = parseInt(purchasesResult.rows[0].count);

    // Get paid purchases
    const paidResult = await pool.query(
      "SELECT COUNT(*) as count FROM purchases WHERE payment_status = 'paid'"
    );
    const paidPurchases = parseInt(paidResult.rows[0].count);

    // Get total redemptions
    const redemptionsResult = await pool.query('SELECT COUNT(*) as count FROM redemptions');
    const totalRedemptions = parseInt(redemptionsResult.rows[0].count);

    // Get served redemptions
    const servedResult = await pool.query(
      "SELECT COUNT(*) as count FROM redemptions WHERE status = 'served'"
    );
    const servedRedemptions = parseInt(servedResult.rows[0].count);

    // Get total venues
    const venuesResult = await pool.query('SELECT COUNT(*) as count FROM venues');
    const totalVenues = parseInt(venuesResult.rows[0].count);

    // Get total bottles
    const bottlesResult = await pool.query('SELECT COUNT(*) as count FROM bottles');
    const totalBottles = parseInt(bottlesResult.rows[0].count);

    res.json({
      users: {
        total: totalUsers
      },
      purchases: {
        total: totalPurchases,
        paid: paidPurchases,
        pending: totalPurchases - paidPurchases
      },
      redemptions: {
        total: totalRedemptions,
        served: servedRedemptions,
        pending: totalRedemptions - servedRedemptions
      },
      venues: {
        total: totalVenues
      },
      bottles: {
        total: totalBottles
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
}

/**
 * Get all users
 * GET /api/admin/users
 */
export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pool = getPoolLazy();
    const result = await pool.query(
      'SELECT id, email, phone, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

/**
 * Get all purchases
 * GET /api/admin/purchases
 */
export async function getAllPurchases(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pool = getPoolLazy();
    const result = await pool.query(
      `SELECT p.*, u.email as user_email, b.name as bottle_name, v.name as venue_name
       FROM purchases p
       LEFT JOIN users u ON p.user_id = u.id
       LEFT JOIN bottles b ON p.bottle_id = b.id
       LEFT JOIN venues v ON p.venue_id = v.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
}

/**
 * Get all redemptions
 * GET /api/admin/redemptions
 */
export async function getAllRedemptions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pool = getPoolLazy();
    const result = await pool.query(
      `SELECT r.*, u.email as user_email, b.name as bottle_name
       FROM redemptions r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN purchases p ON r.purchase_id = p.id
       LEFT JOIN bottles b ON p.bottle_id = b.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
}

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['customer', 'bartender', 'admin'];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({
        error: 'Invalid role',
        validRoles,
        received: role
      });
      return;
    }

    const pool = getPoolLazy();

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update user role
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [role, id]
    );

    res.json({
      data: result.rows[0],
      message: `User role updated to ${role}`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
}