import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PurchaseModel } from '../models/Purchase';
import { BottleModel } from '../models/Bottle';
import { VenueModel } from '../models/Venue';
import { UserModel } from '../models/User';
import { QRService } from '../services/qr.service';

const purchaseModel = new PurchaseModel();
const bottleModel = new BottleModel();
const venueModel = new VenueModel();
const qrService = new QRService();

// Payment controller functions

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

    // Ensure user exists in database (create minimal user if needed)
    const userModel = new UserModel();
    let user = await userModel.findById(userId);

    if (!user) {
      try {
        // Create minimal user record with unique email to avoid constraint issues
        user = await userModel.create({
          id: userId,
          email: `${userId}@clerk.temp`, // Temporary unique email to avoid NULL constraint issues
          role: 'customer' // Default role for purchase initiation
        });
        console.log('Created minimal user record for production:', userId);
      } catch (syncError) {
        console.error('Failed to create user record:', syncError);
        res.status(500).json({
          error: 'Failed to create user record',
          code: 'USER_CREATE_ERROR',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    const { bottle_id } = req.body;

    const bottle = await bottleModel.findById(bottle_id);
    if (!bottle) {
      res.status(404).json({
        error: 'Bottle not found',
        code: 'BOTTLE_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const purchase = await purchaseModel.create({
      user_id: userId,
      bottle_id,
      venue_id: bottle.venue_id
    });

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

export async function getUserPurchases(req: AuthRequest, res: Response): Promise<void> {
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

    // Get user's paid purchases (their bottles)
    const purchases = await purchaseModel.findByUserId(userId, 'paid');

    // Enrich with bottle and venue details
    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const bottle = await bottleModel.findById(purchase.bottle_id);
        const venue = await venueModel.findById(purchase.venue_id);

        return {
          ...purchase,
          bottle_brand: bottle?.brand,
          bottle_type: bottle?.type,
          bottle_size: bottle?.size,
          bottle_pegs_total: bottle?.pegs_total,
          venue_name: venue?.name
        };
      })
    );

    res.json({
      data: enrichedPurchases,
      message: 'User purchases retrieved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    res.status(500).json({
      error: 'Failed to fetch user purchases',
      code: 'USER_PURCHASES_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}

export async function getPurchase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        error: 'Unauthorized',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const purchase = await purchaseModel.findById(String(id));
    if (!purchase) {
      res.status(404).json({
        error: 'Purchase not found',
        code: 'PURCHASE_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Only allow users to see their own purchases (unless they're bartender/admin)
    const userRole = req.user?.role;
    if (purchase.user_id !== userId && userRole !== 'bartender' && userRole !== 'admin') {
      res.status(403).json({
        error: 'Forbidden: Cannot access this purchase',
        code: 'PURCHASE_ACCESS_DENIED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Get additional details
    const bottle = await bottleModel.findById(purchase.bottle_id);
    const venue = await venueModel.findById(purchase.venue_id);

    const enrichedPurchase = {
      ...purchase,
      bottle_brand: bottle?.brand,
      bottle_type: bottle?.type,
      bottle_size: bottle?.size,
      venue_name: venue?.name
    };

    res.json(enrichedPurchase);
  } catch (error) {
    console.error('Error fetching purchase:', error);
    res.status(500).json({
      error: 'Failed to fetch purchase',
      code: 'PURCHASE_FETCH_ERROR',
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