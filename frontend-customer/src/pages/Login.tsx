// Login Page - Mobile-First
// Customer can login/register using Clerk

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SignIn, SignUp, useAuth } from '@clerk/clerk-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const isSignUp = location.pathname.startsWith('/sign-up');

  console.log('Login component:', { isSignedIn, isLoaded, pathname: location.pathname, isSignUp });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate('/venues');
    }
  }, [isSignedIn, isLoaded, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">StoreMyBottle</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">StoreMyBottle</h1>

        {isSignUp ? (
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
          />
        ) : (
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg"
              }
            }}
          />
        )}
      </div>
    </div>
  );
}