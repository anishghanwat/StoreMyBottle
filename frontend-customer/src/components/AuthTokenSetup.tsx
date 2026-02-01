// Sets Clerk getToken on the API service so requests include Authorization: Bearer <token>
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setAuthTokenGetter } from '../services/api';

export function AuthTokenSetup() {
  const { getToken, isSignedIn, userId } = useAuth();

  useEffect(() => {
    console.log('🔍 AuthTokenSetup - User signed in:', isSignedIn);
    console.log('🔍 AuthTokenSetup - User ID:', userId);
    console.log('🔍 AuthTokenSetup - getToken function:', typeof getToken);

    // Pass the getToken function directly - it's already async
    setAuthTokenGetter(getToken);

    // Test token generation
    if (isSignedIn && getToken) {
      getToken().then(token => {
        console.log('🔍 AuthTokenSetup - Test token generated:', token ? 'success' : 'failed');
        console.log('🔍 AuthTokenSetup - Token preview:', token ? token.substring(0, 30) + '...' : 'none');
      }).catch(error => {
        console.error('🔍 AuthTokenSetup - Token generation failed:', error);
      });
    }
  }, [getToken, isSignedIn, userId]);

  return null;
}
