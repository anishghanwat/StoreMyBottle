// Payment routes

import { Router } from 'express';
import {
  initiatePurchase,
  getPurchase,
  getUserPurchases,
  getPendingPayments,
  markPaymentPaid
} from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validateBody, validateParams, schemas } from '../middleware/validation.middleware';
import { rateLimiters } from '../middleware/security.middleware';

const router = Router();

// Apply rate limiting
router.use(rateLimiters.payment);

// Customer route - initiate purchase
router.post('/initiate',
  requireAuth,
  // requireRole('customer'), // Temporarily disabled for debugging
  validateBody(schemas.purchase),
  initiatePurchase
);

// Customer route - get user's purchases (their bottles)
router.get('/my-bottles',
  requireAuth,
  getUserPurchases
);

// Bartender routes - pending payments (must come before /:id route)
router.get('/pending',
  requireAuth,
  requireRole('bartender'),
  getPendingPayments
);

// Get single purchase (customer can see their own, bartender/admin can see any)
router.get('/:id',
  requireAuth,
  validateParams(schemas.idParam),
  getPurchase
);

router.put('/:id/mark-paid',
  requireAuth,
  requireRole('bartender'),
  validateParams(schemas.idParam),
  markPaymentPaid
);

export default router;
