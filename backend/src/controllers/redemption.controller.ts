// Redemption controller
// Handles redemption-related HTTP requests

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { RedemptionModel, PegSize } from '../models/Redemption';
import { PurchaseModel } from '../models/Purchase';
import { QRService } from '../services/qr.service';
import { getPool } from '../config/database';

const redemptionModel = new RedemptionModel();
const purchaseModel = new PurchaseModel();
const qrService = new QRService();

/**
 * Request peg redemption (customer)
 * POST /api/redemptions/request
 */
export async function requestRedemption(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { purchase_id, peg_size_ml } = req.body;

    if (!purchase_id || !peg_size_ml) {
      res.status(400).json({ error: 'purchase_id and peg_size_ml are required' });
      return;
    }

    // Validate peg size
    if (![30, 45, 60].includes(peg_size_ml)) {
      res.status(400).json({ error: 'peg_size_ml must be 30, 45, or 60' });
      return;
    }

    // Get purchase and verify ownership and status
    const purchase = await purchaseModel.findById(purchase_id);
    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    if (purchase.user_id !== userId) {
      res.status(403).json({ error: 'Forbidden: Purchase does not belong to user' });
      return;
    }

    if (purchase.payment_status !== 'paid') {
      res.status(400).json({ error: 'Purchase must be paid before redemption' });
      return;
    }

    // Check if sufficient remaining mL
    if (purchase.remaining_ml < peg_size_ml) {
      res.status(400).json({
        error: 'Insufficient remaining milliliters',
        remaining_ml: purchase.remaining_ml,
        requested_ml: peg_size_ml
      });
      return;
    }

    // Create redemption
    const redemption = await redemptionModel.create({
      purchase_id,
      user_id: userId,
      peg_size_ml: peg_size_ml as PegSize
    });

    // Generate redemption QR code
    const qrCode = await qrService.generateRedemptionQR(redemption.redemption_token);

    res.status(201).json({
      redemption,
      qrCode: qrCode
    });
  } catch (error) {
    console.error('Error requesting redemption:', error);
    res.status(500).json({ error: 'Failed to request redemption' });
  }
}

/**
 * Get user's bottles (paid purchases)
 * GET /api/redemptions/my-bottles
 */
export async function getMyBottles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get purchases with joined bottle and venue data
    const pool = getPool();

    const result = await pool.query(
      `SELECT 
        p.id,
        p.user_id,
        p.bottle_id,
        p.venue_id,
        p.payment_status,
        p.remaining_ml,
        p.created_at,
        p.paid_at,
        b.name as bottle_name,
        b.brand,
        b.total_ml,
        v.name as venue_name,
        v.address as venue_address
       FROM purchases p
       JOIN bottles b ON p.bottle_id = b.id
       JOIN venues v ON p.venue_id = v.id
       WHERE p.user_id = $1 AND p.payment_status = 'paid'
       ORDER BY p.paid_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user bottles:', error);
    res.status(500).json({ error: 'Failed to fetch bottles' });
  }
}

/**
 * Scan QR code and serve peg (bartender)
 * POST /api/redemptions/scan
 */
export async function scanRedemptionQR(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bartenderId = req.userId;
    if (!bartenderId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { qrData } = req.body;

    if (!qrData) {
      res.status(400).json({ error: 'qrData is required' });
      return;
    }

    // Parse QR code data
    const parsed = qrService.parseQRData(qrData);
    if (!parsed || parsed.type !== 'redemption') {
      res.status(400).json({ error: 'Invalid QR code: not a redemption QR' });
      return;
    }

    const { token } = parsed;
    if (!token) {
      res.status(400).json({ error: 'Invalid QR code: missing token' });
      return;
    }

    // Find redemption by token
    const redemption = await redemptionModel.findByToken(token);
    if (!redemption) {
      res.status(404).json({ error: 'Redemption not found' });
      return;
    }

    if (redemption.status !== 'pending') {
      res.status(400).json({
        error: `Redemption already ${redemption.status}`,
        status: redemption.status
      });
      return;
    }

    // Check expiration
    if (new Date(redemption.expires_at) < new Date()) {
      res.status(400).json({ error: 'QR code has expired' });
      return;
    }

    // Get purchase to verify remaining mL
    const purchase = await purchaseModel.findById(redemption.purchase_id);
    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    if (purchase.remaining_ml < redemption.peg_size_ml) {
      res.status(400).json({
        error: 'Insufficient remaining milliliters in bottle',
        remaining_ml: purchase.remaining_ml,
        requested_ml: redemption.peg_size_ml
      });
      return;
    }

    // Mark redemption as served
    const servedRedemption = await redemptionModel.markAsServed(token, bartenderId);

    // Decrement remaining mL from purchase
    const newRemainingMl = purchase.remaining_ml - redemption.peg_size_ml;
    await purchaseModel.updateRemainingMl(purchase.id, newRemainingMl);

    res.json({
      redemption: servedRedemption,
      purchase: {
        ...purchase,
        remaining_ml: newRemainingMl
      },
      message: 'Peg served successfully'
    });
  } catch (error) {
    if (error instanceof Error) {
      const errorMessage = error.message;
      if (errorMessage.includes('not found') || errorMessage.includes('already served') || errorMessage.includes('expired')) {
        res.status(400).json({ error: errorMessage });
        return;
      }
    }
    console.error('Error scanning redemption QR:', error);
    res.status(500).json({ error: 'Failed to process redemption' });
  }
}

/**
 * Get user's redemptions
 * GET /api/redemptions/my-redemptions
 */
export async function getMyRedemptions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const redemptions = await redemptionModel.findByUserId(userId);
    res.json(redemptions);
  } catch (error) {
    console.error('Error fetching user redemptions:', error);
    res.status(500).json({ error: 'Failed to fetch redemptions' });
  }
}
