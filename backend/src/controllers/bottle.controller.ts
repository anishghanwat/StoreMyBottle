// Bottle controller
// Handles bottle-related HTTP requests

import { Request, Response } from 'express';
import { BottleModel } from '../models/Bottle';

const bottleModel = new BottleModel();

export async function listBottlesByVenue(req: Request, res: Response): Promise<void> {
  try {
    const { venueId } = req.params;
    const bottles = await bottleModel.findByVenueId(String(venueId));
    res.json(bottles);
  } catch (error) {
    console.error('Error listing bottles:', error);
    res.status(500).json({ error: 'Failed to fetch bottles' });
  }
}

export async function getBottleById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const bottle = await bottleModel.findById(String(id));

    if (!bottle) {
      res.status(404).json({ error: 'Bottle not found' });
      return;
    }

    res.json(bottle);
  } catch (error) {
    console.error('Error getting bottle:', error);
    res.status(500).json({ error: 'Failed to fetch bottle' });
  }
}

// Admin-only endpoints (to be implemented in Phase 9)
export async function createBottle(req: Request, res: Response): Promise<void> {
  try {
    const { venue_id, name, brand, price, total_ml, is_active } = req.body;

    if (!venue_id || !name || !brand || !price || !total_ml) {
      res.status(400).json({
        error: 'venue_id, name, brand, price, and total_ml are required'
      });
      return;
    }

    const bottle = await bottleModel.create({
      venue_id,
      name,
      brand,
      price: parseFloat(price),
      total_ml: parseInt(total_ml),
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json(bottle);
  } catch (error) {
    console.error('Error creating bottle:', error);
    res.status(500).json({ error: 'Failed to create bottle' });
  }
}

export async function updateBottle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, brand, price, total_ml, is_active } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (brand !== undefined) updates.brand = brand;
    if (price !== undefined) updates.price = parseFloat(price);
    if (total_ml !== undefined) updates.total_ml = parseInt(total_ml);
    if (is_active !== undefined) updates.is_active = is_active;

    const bottle = await bottleModel.update(String(id), updates);
    res.json(bottle);
  } catch (error) {
    if (error instanceof Error && error.message === 'Bottle not found') {
      res.status(404).json({ error: 'Bottle not found' });
      return;
    }
    console.error('Error updating bottle:', error);
    res.status(500).json({ error: 'Failed to update bottle' });
  }
}
export async function deleteBottle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const bottleModel = new BottleModel();

    // Check if bottle has purchases
    const purchaseCheck = await bottleModel.findPurchasesByBottleId(String(id));
    if (purchaseCheck.length > 0) {
      res.status(400).json({
        error: 'Cannot delete bottle with existing purchases',
        purchaseCount: purchaseCheck.length
      });
      return;
    }

    await bottleModel.delete(String(id));
    res.json({ message: 'Bottle deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Bottle not found') {
      res.status(404).json({ error: 'Bottle not found' });
      return;
    }
    console.error('Error deleting bottle:', error);
    res.status(500).json({ error: 'Failed to delete bottle' });
  }
}