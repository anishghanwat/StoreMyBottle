// Venue controller
// Handles venue-related HTTP requests

import { Request, Response } from 'express';
import { VenueModel } from '../models/Venue';

const venueModel = new VenueModel();

export async function listVenues(req: Request, res: Response): Promise<void> {
  try {
    const venues = await venueModel.findAll();
    res.json({
      data: venues,
      count: venues.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error listing venues:', error);
    res.status(500).json({
      error: 'Failed to fetch venues',
      code: 'VENUES_FETCH_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}

export async function getVenueById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // UUID validation is handled by validation middleware
    const venue = await venueModel.findById(String(id));

    if (!venue) {
      res.status(404).json({
        error: 'Venue not found',
        code: 'VENUE_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      data: venue,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting venue:', error);
    res.status(500).json({
      error: 'Failed to fetch venue',
      code: 'VENUE_FETCH_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}

export async function createVenue(req: Request, res: Response): Promise<void> {
  try {
    // Input validation is handled by validation middleware
    const { name, address } = req.body;

    const venue = await venueModel.create({ name, address });

    res.status(201).json({
      data: venue,
      message: 'Venue created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating venue:', error);

    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        res.status(409).json({
          error: 'Venue with this name already exists',
          code: 'VENUE_DUPLICATE',
          timestamp: new Date().toISOString()
        });
        return;
      }
    }

    res.status(500).json({
      error: 'Failed to create venue',
      code: 'VENUE_CREATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}

export async function updateVenue(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    const venue = await venueModel.update(String(id), { name, address });

    res.json({
      data: venue,
      message: 'Venue updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Venue not found') {
      res.status(404).json({
        error: 'Venue not found',
        code: 'VENUE_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    console.error('Error updating venue:', error);
    res.status(500).json({
      error: 'Failed to update venue',
      code: 'VENUE_UPDATE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}
export async function deleteVenue(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const venueModel = new VenueModel();

    // Check if venue has bottles
    const bottleCheck = await venueModel.findBottlesByVenueId(String(id));
    if (bottleCheck.length > 0) {
      res.status(400).json({
        error: 'Cannot delete venue with existing bottles',
        code: 'VENUE_HAS_BOTTLES',
        bottleCount: bottleCheck.length,
        timestamp: new Date().toISOString()
      });
      return;
    }

    const deleted = await venueModel.delete(String(id));
    if (!deleted) {
      res.status(404).json({
        error: 'Venue not found',
        code: 'VENUE_NOT_FOUND',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.json({
      message: 'Venue deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({
      error: 'Failed to delete venue',
      code: 'VENUE_DELETE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}