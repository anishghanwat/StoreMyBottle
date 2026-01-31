// Sets Clerk getToken on the API service so requests include Authorization: Bearer <token>
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setAuthTokenGetter } from '../services/api';

export function AuthTokenSetup() {
  const { getToken } = useAuth();

  useEffect(() => {
    const bypassAuth = (import.meta as any).env?.VITE_BYPASS_AUTH === 'true';

    if (bypassAuth) {
      console.log('🚨 AUTH TOKEN BYPASS ENABLED - Development only');
      // Set a fake token getter that returns null (backend will handle bypass)
      setAuthTokenGetter(() => Promise.resolve(null));
    } else {
      setAuthTokenGetter(() => getToken());
    }
  }, [getToken]);

  return null;
}
