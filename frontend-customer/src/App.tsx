// Customer App - Mobile-First Design
// Note: Dependencies need to be installed via npm before this will work
// Run: npm install react react-dom react-router-dom @clerk/clerk-react
//      npm install -D @types/react @types/react-dom typescript vite @vitejs/plugin-react tailwindcss

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

// Pages
import VenueSelection from './pages/VenueSelection';
import BottleSelection from './pages/BottleSelection';
import Login from './pages/Login';
import Payment from './pages/Payment';
import MyBottles from './pages/MyBottles';
import RedeemPeg from './pages/RedeemPeg';
import Debug from './pages/Debug';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthTokenSetup } from './components/AuthTokenSetup';
import { RoleSetup } from './components/RoleSetup';

const clerkPubKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';

function App() {
  if (!clerkPubKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  console.log('Clerk Publishable Key:', clerkPubKey.substring(0, 20) + '...');

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/venues"
      afterSignUpUrl="/venues"
      options={{
        // Development SSL bypass
        allowedRedirectOrigins: ['http://localhost:5173', 'https://localhost:5173'],
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
            <Route path="/" element={<Navigate to="/venues" replace />} />
            <Route path="/venues" element={<VenueSelection />} />
            <Route path="/bottles/:venueId" element={<BottleSelection />} />
            <Route path="/login" element={<Navigate to="/sign-in" replace />} />
            <Route path="/register" element={<Navigate to="/sign-up" replace />} />
            <Route path="/debug" element={<Debug />} />
            <Route path="/sign-in/*" element={<Login />} />
            <Route path="/sign-up/*" element={<Login />} />
            <Route
              path="/payment/:purchaseId"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bottles"
              element={
                <ProtectedRoute>
                  <MyBottles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/redeem/:purchaseId"
              element={
                <ProtectedRoute>
                  <RedeemPeg />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<div className="p-4">404 - Page Not Found</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </ClerkProvider>
  );
}

export default App;