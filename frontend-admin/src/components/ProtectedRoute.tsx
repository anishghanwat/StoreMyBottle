// Protected Route Component for Admin App

import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();

  // Check for authentication bypass
  const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true';

  if (bypassAuth) {
    console.log('🚨 Admin auth bypass enabled - allowing access');
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
