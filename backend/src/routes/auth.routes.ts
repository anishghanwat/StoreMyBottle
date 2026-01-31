// Authentication routes
// Note: @clerk/express needs to be installed

import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.middleware';
import { UserSyncService } from '../services/user-sync.service';
import { UserModel } from '../models/User';

const router = Router();
const userSyncService = new UserSyncService();
const userModel = new UserModel();

// Get current user (protected)
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get user from database
    let user = await userModel.findById(userId);

    // If user doesn't exist in DB, try to get from Clerk and sync
    if (!user) {
      try {
        // Try to get Clerk user data
        const { clerkClient } = require('@clerk/express');
        const clerkUser = await clerkClient.users.getUser(userId);

        // Sync user to database
        user = await userSyncService.syncUser({
          id: clerkUser.id,
          emailAddresses: clerkUser.emailAddresses,
          phoneNumbers: clerkUser.phoneNumbers,
          publicMetadata: clerkUser.publicMetadata as any,
        });
      } catch (clerkError) {
        // If Clerk is not available or user not found, return minimal info
        console.warn('Could not fetch user from Clerk:', clerkError);
        res.json({
          id: userId,
          message: 'User not synced to database yet'
        });
        return;
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Set user role (for automatic role assignment)
router.post('/set-role', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { role, appType } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Auto-assign role based on app type if role not explicitly provided
    let assignedRole = role;
    if (!role && appType) {
      if (appType === 'bartender') {
        assignedRole = 'bartender';
      } else if (appType === 'customer') {
        assignedRole = 'customer';
      } else if (appType === 'admin') {
        assignedRole = 'admin';
      }
    }

    // Validate role
    const validRoles = ['customer', 'bartender', 'admin'];
    if (!assignedRole || !validRoles.includes(assignedRole)) {
      res.status(400).json({
        error: 'Invalid role',
        validRoles,
        received: assignedRole,
        hint: 'Provide either role or appType (bartender/customer)'
      });
      return;
    }

    // Get or create user in database
    let user = await userModel.findById(userId);

    if (!user) {
      // Create new user with role
      user = await userModel.create({
        id: userId,
        role: assignedRole,
      });
    } else if (user.role !== assignedRole) {
      // Update existing user's role
      user = await userModel.updateRole(userId, assignedRole);
    }

    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      message: `Role set to ${assignedRole}`,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error('Error setting user role:', error);
    res.status(500).json({ error: 'Failed to set user role' });
  }
});

export default router;
