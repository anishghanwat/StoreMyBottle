// User sync service to sync Clerk users to local database
// This ensures we have user data locally for role management

import { UserModel, CreateUserInput } from '../models/User';

export interface ClerkUser {
  id: string;
  emailAddresses?: Array<{ emailAddress?: string; email_address?: string }>;
  phoneNumbers?: Array<{ phoneNumber?: string; phone_number?: string }>;
  publicMetadata?: Record<string, unknown> | { role?: 'customer' | 'bartender' | 'admin' };
}

export class UserSyncService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  /**
   * Sync or create user from Clerk data
   * Returns the user from local database
   */
  async syncUser(clerkUser: ClerkUser): Promise<import('../models/User').User> {
    // Check if user already exists
    let user = await this.userModel.findById(clerkUser.id);
    const metaRole = (clerkUser.publicMetadata as any)?.role;
    const role = (typeof metaRole === 'string' && ['customer', 'bartender', 'admin'].includes(metaRole.toLowerCase()))
      ? metaRole.toLowerCase() as 'customer' | 'bartender' | 'admin'
      : 'customer';

    if (user) {
      // If Clerk has a role and it differs from DB, update DB
      if (role !== user.role) {
        try {
          user = await this.userModel.updateRole(clerkUser.id, role);
        } catch (_) {
          // keep existing user if update fails
        }
      }
      return user;
    }

    // Extract email and phone (Clerk SDK may use camelCase or snake_case)
    const firstEmail = clerkUser.emailAddresses?.[0];
    const firstPhone = clerkUser.phoneNumbers?.[0];
    const email = firstEmail?.emailAddress ?? (firstEmail as any)?.email_address;
    const phone = firstPhone?.phoneNumber ?? (firstPhone as any)?.phone_number;

    // Create user in local database
    const createInput: CreateUserInput = {
      id: clerkUser.id,
      email,
      phone,
      role,
    };

    user = await this.userModel.create(createInput);
    return user;
  }

  /**
   * Get or create user by Clerk ID
   * Used during authentication
   */
  async getOrCreateUser(clerkUserId: string, clerkUserData?: ClerkUser): Promise<import('../models/User').User> {
    // Try to find existing user
    let user = await this.userModel.findById(clerkUserId);
    
    if (user) {
      return user;
    }

    // If no user data provided, create minimal user
    if (!clerkUserData) {
      const createInput: CreateUserInput = {
        id: clerkUserId,
        role: 'customer',
      };
      return await this.userModel.create(createInput);
    }

    // Sync full user data
    return await this.syncUser(clerkUserData);
  }
}
