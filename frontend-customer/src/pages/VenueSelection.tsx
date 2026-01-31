// Venue Selection Page - Mobile-First
// Customer can view and select a venue

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { apiService } from '../services/api';
import { SignOutButton } from '../components/SignOutButton';

interface Venue {
  id: string;
  name: string;
  address: string;
}

export default function VenueSelection() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await apiService.getVenues();
      setVenues(data);
      setError(null);
    } catch (err) {
      console.error('Error loading venues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSelect = (venueId: string) => {
    navigate(`/bottles/${venueId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading venues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={loadVenues}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
        <h1 className="text-2xl font-bold">Select a Venue</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/my-bottles')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg min-h-[44px]"
          >
            My Bottles
          </button>
          <button
            onClick={() => navigate('/debug')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg min-h-[44px]"
          >
            Debug
          </button>
          {isSignedIn && <SignOutButton />}
        </div>
      </div>

      {venues.length === 0 ? (
        <div className="text-center py-8">
          <p>No venues available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {venues.map((venue) => (
            <div
              key={venue.id}
              onClick={() => handleVenueSelect(venue.id)}
              className="p-4 border rounded-lg cursor-pointer active:bg-gray-100 min-h-[88px] flex flex-col justify-center"
            >
              <h2 className="text-xl font-semibold mb-2">{venue.name}</h2>
              <p className="text-gray-600 text-sm">{venue.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
