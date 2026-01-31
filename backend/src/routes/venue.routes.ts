// Venue routes
// Public routes for listing venues, protected routes for management

import { Router } from 'express';
import { listVenues, getVenueById, createVenue, updateVenue, deleteVenue } from '../controllers/venue.controller';
import { requireRole } from '../middleware/role.middleware';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody, validateParams, schemas } from '../middleware/validation.middleware';
import { rateLimiters } from '../middleware/security.middleware';

const router = Router();

// Apply rate limiting
router.use(rateLimiters.general);

// Public routes
router.get('/', listVenues);
router.get('/:id', validateParams(schemas.idParam), getVenueById);

// Admin-only routes (protected)
router.post('/',
    rateLimiters.admin,
    requireAuth,
    requireRole('admin'),
    validateBody(schemas.venue),
    createVenue
);

router.put('/:id',
    rateLimiters.admin,
    requireAuth,
    requireRole('admin'),
    validateParams(schemas.idParam),
    validateBody(schemas.venue),
    updateVenue
);

router.delete('/:id',
    rateLimiters.admin,
    requireAuth,
    requireRole('admin'),
    validateParams(schemas.idParam),
    deleteVenue
);

export default router;
