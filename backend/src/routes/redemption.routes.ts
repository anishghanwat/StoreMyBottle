// Redemption routes

import { Router } from 'express';
import {
  requestRedemption,
  getMyBottles,
  scanRedemptionQR,
  getMyRedemptions
} from '../controllers/redemption.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Customer routes
router.post('/request', requireAuth, requestRedemption);
router.get('/my-bottles', requireAuth, getMyBottles);
router.get('/my-redemptions', requireAuth, getMyRedemptions);

// Bartender route - scan QR
router.post('/scan', requireAuth, requireRole('bartender'), scanRedemptionQR);

export default router;
