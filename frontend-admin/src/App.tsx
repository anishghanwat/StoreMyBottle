// Admin App
// Note: Dependencies need to be installed via npm

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VenueManagement from './pages/VenueManagement';
import BottleManagement from './pages/BottleManagement';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthTokenSetup } from './components/AuthTokenSetup';
import { RoleSetup } from './components/RoleSetup';

const clerkPubKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY || '';

function App() {
  if (!clerkPubKey) {
    throw new Error('Missing Clerk Publishable Key');
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/sign-in"
      afterSignInUrl="/dashboard"
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
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/venues"
              element={
                <ProtectedRoute>
                  <VenueManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bottles"
              element={
                <ProtectedRoute>
                  <BottleManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserManagement />
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