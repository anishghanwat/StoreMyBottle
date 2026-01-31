import { useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export function SignOutButton() {
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate('/sign-in');
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
    >
      Sign out
    </button>
  );
}
