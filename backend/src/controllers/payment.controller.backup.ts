// Payment controller
// Handles payment-related HTTP requests

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PurchaseModel } from '../models/Purchase';
import { BottleModel } from '../models/Bottle';
import { QRService } from '../services/qr.service';

const purchaseModel = new PurchaseModel();
const bottleModel = new BottleModel();
const qrService = new QRService();

export async function initiatePurchase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const { bottle_id } = req.body;
    console.log('Initiating purchase:', { userId, bottle_id });

    const bottle = await bottleModel.findById(bottle_id);
    if (!bottle) {
      res.status(404).json({
        error: 'Bottle not found',
        code: 'BOTTLE_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.log('Found bottle:', bottle);

    const purchase = await purchaseModel.create({
      user_id: userId,
      bottle_id,
      venue_id: bottle.venue_id
    });

    console.log('Created purchase:', purchase);

    const qrCode = await qrService.generatePaymentQR(purchase.id);

    res.status(201).json({
      data: {
        purchase: {
          ...purchase,
          payment_qr_code: qrCode.data
        },
        qrCode: qrCode
      },
      message: 'Purchase initiated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error initiating purchase:', error);
    res.status(500).json({
      error: 'Failed to initiate purchase',
      code: 'PURCHASE_INIT_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}

export async function getPendingPayments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const pendingPayments = await purchaseModel.findPendingPayments();
    res.json(pendingPayments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: 'Failed to fetch pending payments' });
  }
}

export async function markPaymentPaid(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const purchase = await purchaseModel.findById(String(id));
    if (!purchase) {
      res.status(404).json({ error: 'Purchase not found' });
      return;
    }

    if (purchase.payment_status !== 'pending') {
      res.status(400).json({ error: 'Purchase is not in pending status' });
      return;
    }

    const bottle = await bottleModel.findById(purchase.bottle_id);
    if (!bottle) {
      res.status(404).json({ error: 'Bottle not found' });
      return;
    }

    const updatedPurchase = await purchaseModel.markAsPaid(String(id), bottle.pegs_total);
    res.json(updatedPurchase);
  } catch (error) {
    if (error instanceof Error && error.message === 'Purchase not found or already paid') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error marking payment as paid:', error);
    res.status(500).json({ error: 'Failed to mark payment as paid' });
  }
}
