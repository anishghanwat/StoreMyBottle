// Sets Clerk getToken on the API service so requests include Authorization: Bearer <token>
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setAuthTokenGetter } from '../services/api';

export function AuthTokenSetup() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Pass the getToken function directly - it's already async
    setAuthTokenGetter(getToken);
  }, [getToken]);

  return null;
}
