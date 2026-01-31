// Bottle Selection Page - Mobile-First
// Customer can view bottles for selected venue

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface Bottle {
  id: string;
  name: string;
  brand: string;
  price: number;
  total_ml: number;
}

export default function BottleSelection() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (venueId) {
      loadBottles(venueId);
    }
  }, [venueId]);

  const loadBottles = async (id: string) => {
    try {
      setLoading(true);
      const data = await apiService.getBottlesByVenue(id);
      setBottles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bottles');
    } finally {
      setLoading(false);
    }
  };

  const handleBottleSelect = async (bottleId: string) => {
    try {
      setError(null); // Clear any previous errors

      const result = await apiService.initiatePurchase(bottleId);

      if (result && result.purchase && result.purchase.id) {
        navigate(`/payment/${result.purchase.id}`);
      } else {
        setError('Purchase was created but response format is invalid');
      }
    } catch (err) {
      console.error('Error initiating purchase:', err);
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/sign-in');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to initiate purchase');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading bottles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={() => venueId && loadBottles(venueId)}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Select a Bottle</h1>

      {bottles.length === 0 ? (
        <div className="text-center py-8">
          <p>No bottles available at this venue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bottles.map((bottle) => (
            <div
              key={bottle.id}
              onClick={() => handleBottleSelect(bottle.id)}
              className="p-4 border rounded-lg cursor-pointer active:bg-gray-100 min-h-[88px] hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{bottle.name}</h2>
                  <p className="text-gray-600 text-sm">{bottle.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">₹{bottle.price}</p>
                  <p className="text-sm text-gray-500">{bottle.total_ml}ml</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-600 font-medium">Tap to buy</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
