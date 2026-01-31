// Automatic Role Setup for Bartender App
// Sets bartender role when user signs up through bartender app

import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export function RoleSetup() {
    const { user, isLoaded } = useUser();
    const [roleAssigned, setRoleAssigned] = useState(false);

    useEffect(() => {
        const setRoleIfNeeded = async () => {
            if (!isLoaded || !user || roleAssigned) return;

            try {
                console.log('🔧 Checking user role assignment...');

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

                // Call backend to set bartender role
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/set-role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        role: 'bartender',
                        appType: 'bartender'
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Role assignment successful:', result.message);
                    setRoleAssigned(true);
                } else {
                    const error = await response.json();
                    console.warn('⚠️ Role assignment failed:', error);

                    // Try Clerk metadata update as fallback
                    try {
                        await user.update({
                            publicMetadata: {
                                role: 'bartender'
                            }
                        });
                        console.log('✅ Fallback: Bartender role set in Clerk metadata');
                        setRoleAssigned(true);
                    } catch (clerkError) {
                        console.error('❌ Both backend and Clerk role assignment failed:', clerkError);
                    }
                }
            } catch (error) {
                console.error('❌ Error in role assignment:', error);

                // Final fallback - try Clerk only
                try {
                    await user.update({
                        publicMetadata: {
                            role: 'bartender'
                        }
                    });
                    console.log('✅ Emergency fallback: Role set in Clerk only');
                    setRoleAssigned(true);
                } catch (finalError) {
                    console.error('❌ All role assignment methods failed:', finalError);
                }
            }
        };

        // Add a small delay to ensure user is fully loaded
        const timer = setTimeout(setRoleIfNeeded, 1000);
        return () => clearTimeout(timer);
    }, [user, isLoaded, roleAssigned]);

    return null; // This component doesn't render anything
}