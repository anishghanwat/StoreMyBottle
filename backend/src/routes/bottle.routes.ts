// Bottle routes
// Public routes for listing bottles, protected routes for management

import { Router } from 'express';
import {
  listBottlesByVenue,
  getBottleById,
  createBottle,
  updateBottle,
  deleteBottle
} from '../controllers/bottle.controller';
import { requireRole } from '../middleware/role.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateParams, schemas } from '../middleware/validation.middleware';
import { rateLimiters } from '../middleware/security.middleware';

const router = Router();

// Apply rate limiting
router.use(rateLimiters.general);

// Admin-only routes (protected) - PUT THESE FIRST to avoid conflicts
router.post('/',
  rateLimiters.admin,
  requireAuth,
  requireRole('admin'),
  validateBody(schemas.bottle),
  createBottle
);

router.put('/:id',
  rateLimiters.admin,
  requireAuth,
  requireRole('admin'),
  validateParams(schemas.idParam),
  validateBody(schemas.bottle.partial()),
  updateBottle
);

router.delete('/:id',
  rateLimiters.admin,
  requireAuth,
  requireRole('admin'),
  validateParams(schemas.idParam),
  deleteBottle
);

// Public routes
router.get('/venue/:venueId',
  validateParams(schemas.venueIdParam),
  listBottlesByVenue
);

router.get('/:id',
  validateParams(schemas.idParam),
  getBottleById
);

export default router;