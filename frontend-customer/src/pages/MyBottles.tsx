// My Bottles Page - Mobile-First
// Customer sees their virtual bottles

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, type Bottle } from '../services/api';

// Extended interface for MyBottles response (includes joined data from backend)
interface MyBottle extends Bottle {
  bottle_name: string;
  venue_name: string;
  venue_address: string;
  remaining_ml: number;
  paid_at: string | null;
}

export default function MyBottles() {
  const [bottles, setBottles] = useState<MyBottle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadBottles();
  }, []);

  const loadBottles = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyBottles();
      setBottles(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/sign-in');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load bottles');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (purchaseId: string) => {
    navigate(`/redeem/${purchaseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading your bottles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={loadBottles}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">My Bottles</h1>

      {bottles.length === 0 ? (
        <div className="text-center py-8">
          <p>You don't have any bottles yet</p>
          <button
            onClick={() => navigate('/venues')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Browse Venues
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bottles.map((bottle) => {
            const percentage = (bottle.remaining_ml / bottle.total_ml) * 100;

            return (
              <div
                key={bottle.id}
                className="p-4 border rounded-lg"
              >
                <div className="mb-3">
                  <h2 className="text-xl font-semibold">{bottle.bottle_name}</h2>
                  <p className="text-gray-600 text-sm">{bottle.brand}</p>
                  <p className="text-gray-500 text-xs mt-1">{bottle.venue_name}</p>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Remaining</span>
                    <span className="font-semibold">{bottle.remaining_ml}ml / {bottle.total_ml}ml</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {bottle.remaining_ml > 0 && (
                  <button
                    onClick={() => handleRedeem(bottle.id)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold min-h-[44px]"
                  >
                    Redeem Peg
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
