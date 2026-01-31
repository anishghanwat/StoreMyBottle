// Protected Route Component for Bartender App

import { Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useAuth();

  // Development bypass for SSL issues
  const bypassAuth = (import.meta as any).env?.VITE_BYPASS_AUTH === 'true';

  if (bypassAuth) {
    console.log('🚨 AUTH BYPASS ENABLED - Development only');
    return <>{children}</>;
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}
