// Role-based access control middleware
// Requires auth middleware to run first

import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserSyncService } from '../services/user-sync.service';
import { env } from '../config/env';

export type UserRole = 'customer' | 'bartender' | 'admin';

function getRoleFromMetadata(meta: Record<string, unknown> | undefined): UserRole | undefined {
  if (!meta || typeof meta !== 'object') return undefined;
  const raw = meta.role ?? (meta as any).Role;
  if (typeof raw !== 'string') return undefined;
  const r = raw.toLowerCase().trim();
  if (r === 'bartender' || r === 'admin' || r === 'customer') return r as UserRole;
  return undefined;
}

export function requireRole(...allowedRoles: UserRole[]) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized: No user ID',
          code: 'AUTH_NO_USER_ID',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { UserModel } = require('../models/User');
      const userModel = new UserModel();
      let user = await userModel.findById(userId);

      // If user not in DB, try to sync from Clerk
      if (!user) {
        try {
          const { clerkClient } = require('@clerk/express');
          const clerkUser = await clerkClient.users.getUser(userId);
          const meta = (clerkUser.publicMetadata ?? (clerkUser as any).public_metadata) as Record<string, unknown> | undefined;
          const roleFromClerk = getRoleFromMetadata(meta) ?? 'customer';
          const userSyncService = new UserSyncService();
          user = await userSyncService.syncUser({
            id: clerkUser.id,
            emailAddresses: (clerkUser as any).emailAddresses ?? (clerkUser as any).email_addresses,
            phoneNumbers: (clerkUser as any).phoneNumbers ?? (clerkUser as any).phone_numbers,
            publicMetadata: { role: roleFromClerk },
          });
        } catch (syncErr) {
          console.error('Role middleware: could not sync user from Clerk', syncErr);
          res.status(403).json({
            error: 'Forbidden: User not found in database',
            code: 'USER_NOT_FOUND',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      let userRole = user.role as UserRole;

      // If DB role not allowed, try refreshing from Clerk
      if (!allowedRoles.includes(userRole)) {
        try {
          const { clerkClient } = require('@clerk/express');
          const clerkUser = await clerkClient.users.getUser(userId);
          const meta = (clerkUser.publicMetadata ?? (clerkUser as any).public_metadata) as Record<string, unknown> | undefined;
          const clerkRole = getRoleFromMetadata(meta);
          if (clerkRole && allowedRoles.includes(clerkRole)) {
            userRole = clerkRole;
            try {
              await userModel.updateRole(userId, clerkRole);
              console.info(`Role updated for user ${userId}: ${user.role} -> ${clerkRole}`);
            } catch (updateErr) {
              console.warn('Failed to update user role in database:', updateErr);
              // Allow request even if DB update failed
            }
          } else if (env.nodeEnv !== 'production') {
            console.warn('Role middleware: Clerk publicMetadata for', userId, '=', JSON.stringify(meta), '-> role', clerkRole, '| allowed', allowedRoles);
          }
        } catch (refreshErr) {
          console.warn('Role middleware: could not refresh role from Clerk', refreshErr);
        }
      }

      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          error: 'Forbidden: Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: allowedRoles,
          current: userRole,
          timestamp: new Date().toISOString(),
          hint: 'In Clerk Dashboard: same user as signed-in, Public metadata = {"role":"bartender"}, then Save. Restart backend and retry.'
        });
        return;
      }

      req.user = {
        id: userId,
        ...(req.user && { email: req.user.email, phone: req.user.phone }),
        role: userRole
      };

      next();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('Role middleware error:', error);
      res.status(403).json({
        error: 'Forbidden: Role check failed',
        code: 'ROLE_CHECK_FAILED',
        timestamp: new Date().toISOString(),
        ...(env.nodeEnv !== 'production' && { detail: errMsg }),
      });
    }
  };
}