// Admin routes
// All routes require admin role

import { Router } from 'express';
import {
  getDashboard,
  getAllUsers,
  getAllPurchases,
  getAllRedemptions,
  updateUserRole
} from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.get('/dashboard', requireAuth, requireRole('admin'), getDashboard);
router.get('/users', requireAuth, requireRole('admin'), getAllUsers);
router.put('/users/:id/role', requireAuth, requireRole('admin'), updateUserRole);
router.get('/purchases', requireAuth, requireRole('admin'), getAllPurchases);
router.get('/redemptions', requireAuth, requireRole('admin'), getAllRedemptions);

export default router;
