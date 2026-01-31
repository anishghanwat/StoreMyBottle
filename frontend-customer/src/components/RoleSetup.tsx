// Automatic Role Setup for Customer App
// Note: Role assignment disabled - customers don't need specific roles

import { useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';

export function RoleSetup() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (!isLoaded || !user) return;

        // Role assignment is not needed for customers
        // Backend will handle user creation with default role
        console.log('Customer app loaded for user:', user.id);
        console.log('Role assignment skipped - not required for customers');
    }, [user, isLoaded]);

    return null; // This component doesn't render anything
}