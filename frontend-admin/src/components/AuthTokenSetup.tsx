import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setAuthTokenGetter } from '../services/api';

export function AuthTokenSetup() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Check for authentication bypass
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

    if (bypassAuth) {
      console.log('🚨 Admin auth bypass enabled - using mock token');
      setAuthTokenGetter(() => Promise.resolve('bypass-token'));
    } else {
      setAuthTokenGetter(() => getToken());
    }
  }, [getToken]);

  return null;
}
