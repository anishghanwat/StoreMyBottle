// Bartender App - Mobile-First, One-Handed Optimized
// Note: Dependencies need to be installed via npm

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

// Pages
import Login from './pages/Login';
import PendingPayments from './pages/PendingPayments';
import ScanQR from './pages/ScanQR';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthTokenSetup } from './components/AuthTokenSetup';
import { RoleSetup } from './components/RoleSetup';
import { ErrorBoundary } from './components/ErrorBoundary';

const clerkPubKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';

function App() {
  if (!clerkPubKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={clerkPubKey}
        signInUrl="/sign-in"
        afterSignInUrl="/pending-payments"
        options={{
          // Development SSL bypass
          allowedRedirectOrigins: ['http://localhost:5174', 'https://localhost:5174'],
          isSatellite: false,
          domain: undefined,
          // Disable SSL verification in development
          ...(process.env.NODE_ENV === 'development' && {
            experimental: {
              skipSSLValidation: true
            }
          })
        }}
      >
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthTokenSetup />
          <RoleSetup />
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Navigate to="/sign-in" replace />} />
              <Route path="/login" element={<Navigate to="/sign-in" replace />} />
              <Route path="/sign-in/*" element={<Login />} />
              <Route path="/sign-up/*" element={<Login />} />
              <Route
                path="/pending-payments"
                element={
                  <ProtectedRoute>
                    <PendingPayments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan"
                element={
                  <ErrorBoundary fallback={
                    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                      <div className="text-center">
                        <h2 className="text-xl font-semibold mb-2">Camera Error</h2>
                        <p className="text-gray-600 mb-4">There was an issue with the camera scanner.</p>
                        <button
                          onClick={() => window.location.href = '/pending-payments'}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                        >
                          Back to Payments
                        </button>
                      </div>
                    </div>
                  }>
                    <ProtectedRoute>
                      <ScanQR />
                    </ProtectedRoute>
                  </ErrorBoundary>
                }
              />
              <Route path="*" element={<div className="p-4">404 - Page Not Found</div>} />
            </Routes>
          </div>
        </BrowserRouter>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;