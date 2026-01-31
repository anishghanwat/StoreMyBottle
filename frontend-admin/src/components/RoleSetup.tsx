// Automatic Role Setup for Admin App
// Sets admin role when user signs up through admin app

import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export function RoleSetup() {
    const { user, isLoaded } = useUser();
    const [roleAssigned, setRoleAssigned] = useState(false);

    useEffect(() => {
        const setRoleIfNeeded = async () => {
            if (!isLoaded || !user || roleAssigned) return;

            try {
                console.log('🔧 Checking admin role assignment...');

                // Check if authentication bypass is enabled
                const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';
                if (bypassAuth) {
                    console.log('🚨 Auth bypass enabled - skipping role assignment');
                    setRoleAssigned(true);
                    return;
                }

                // Get auth token for API calls
                const token = await user.getToken();
                if (!token) {
                    console.warn('⚠️ No auth token available');
                    return;
                }

                // Call backend to set admin role
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/set-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        role: 'admin',
                        appType: 'admin'
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Admin role assignment successful:', result.message);
                    setRoleAssigned(true);
                } else {
                    const error = await response.json();
                    console.warn('⚠️ Admin role assignment failed:', error);

                    // Try Clerk metadata update as fallback
                    try {
                        await user.update({
                            publicMetadata: {
                                role: 'admin'
                            }
                        });
                        console.log('✅ Fallback: Admin role set in Clerk metadata');
                        setRoleAssigned(true);
                    } catch (clerkError) {
                        console.error('❌ Both backend and Clerk role assignment failed:', clerkError);
                    }
                }
            } catch (error) {
                console.error('❌ Error in admin role assignment:', error);

                // Final fallback - try Clerk only
                try {
                    await user.update({
                        publicMetadata: {
                            role: 'admin'
                        }
                    });
                    console.log('✅ Emergency fallback: Admin role set in Clerk only');
                    setRoleAssigned(true);
                } catch (finalError) {
                    console.error('❌ All admin role assignment methods failed:', finalError);
                }
            }
        };

        // Add a small delay to ensure user is fully loaded
        const timer = setTimeout(setRoleIfNeeded, 1000);
        return () => clearTimeout(timer);
    }, [user, isLoaded, roleAssigned]);

    return null; // This component doesn't render anything
}