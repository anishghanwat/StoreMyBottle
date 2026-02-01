// Authentication middleware using Clerk
import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';

export interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email?: string;
    phone?: string;
    role?: 'customer' | 'bartender' | 'admin';
  };
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Development bypass for SSL issues
    if (process.env.BYPASS_AUTH === 'true') {
      console.log('🚨 AUTH BYPASS ENABLED - Development only');
      req.userId = 'user_38tTAr60s9wOShjkRCKqrBv0Ndh'; // Bartender user ID
      req.user = { id: 'user_38tTAr60s9wOShjkRCKqrBv0Ndh' };
      next();
      return;
    }

    // Debug: Log the authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth header present:', !!authHeader);
    console.log('Auth header format:', authHeader ? authHeader.substring(0, 20) + '...' : 'none');

    // Get user from Clerk
    const { userId } = getAuth(req);
    console.log('Clerk userId extracted:', userId);

    if (!userId) {
      console.log('No userId from Clerk - authentication failed');
      res.status(401).json({
        error: 'Unauthorized: Authentication required',
        code: 'AUTH_REQUIRED',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Attach user info to request
    req.userId = userId;
    req.user = { id: userId };

    console.log('Authentication successful for user:', userId);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      error: 'Unauthorized: Token validation failed',
      code: 'AUTH_INVALID',
      timestamp: new Date().toISOString()
    });
  }
}
