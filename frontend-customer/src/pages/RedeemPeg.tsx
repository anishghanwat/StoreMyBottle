// Redeem Peg Page - Mobile-First
// Customer can select peg size and get QR code

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import QRCode from 'qrcode';

interface MyBottle {
  id: string;
  brand: string;
  type: string;
  size: string;
  venue_name: string;
  pegs_remaining: number;
  pegs_total: number;
}

type PegSize = 30 | 45 | 60;

export default function RedeemPeg() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const [bottle, setBottle] = useState<MyBottle | null>(null);
  const [selectedPegSize, setSelectedPegSize] = useState<PegSize | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBottle();
  }, [purchaseId]);

  const loadBottle = async () => {
    try {
      setLoading(true);
      const bottles = await apiService.getMyBottles();
      const found = bottles.find((b) => b.id === purchaseId);
      if (found) {
        setBottle(found);
      } else {
        setError('Bottle not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bottle');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedPegSize || !purchaseId) return;

    try {
      setLoading(true);
      const result = await apiService.requestRedemption(purchaseId, selectedPegSize);
      setQrCode(result.qrCode.data);

      // Generate QR code image
      const qrImageUrl = await QRCode.toDataURL(result.qrCode.data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrImageUrl(qrImageUrl);

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request redemption');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !qrCode) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (error && !bottle) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={() => navigate('/my-bottles')}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg"
        >
          Back to My Bottles
        </button>
      </div>
    );
  }

  if (qrCode) {
    return (
      <div className="min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-6">Redemption QR Code</h1>

        <div className="flex flex-col items-center">
          {/* QR Code Display - actual QR code */}
          <div className="bg-white p-4 rounded-lg mb-4 shadow-lg">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Redemption QR Code"
                className="w-[200px] h-[200px]"
              />
            ) : (
              <div className="w-[200px] h-[200px] border-2 border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-xs text-center text-gray-500 p-2">
                  Generating QR Code...
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 text-center mb-4">
            Show this QR code to the bartender to get your {selectedPegSize}ml peg
          </p>

          <button
            onClick={() => navigate('/my-bottles')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg min-h-[44px]"
          >
            Back to My Bottles
          </button>
        </div>
      </div>
    );
  }

  const pegSizes: PegSize[] = [30, 45, 60];
  // const availableSizes = pegSizes.filter(size => bottle && bottle.remaining_ml >= size);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Redeem Peg</h1>

      {bottle && (
        <>
          <div className="mb-6 p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">{bottle.brand} {bottle.type}</h2>
            <p className="text-sm text-gray-600">
              Remaining: {bottle.pegs_remaining} pegs / {bottle.pegs_total} total
            </p>
            <p className="text-sm text-gray-500">{bottle.venue_name}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Select Peg Size</h3>
            <div className="space-y-3">
              {pegSizes.map((size) => {
                // For now, assume each peg is equivalent to 1 unit, so we can redeem if we have pegs remaining
                const isAvailable = bottle.pegs_remaining > 0;
                const isSelected = selectedPegSize === size;

                return (
                  <button
                    key={size}
                    onClick={() => isAvailable && setSelectedPegSize(size)}
                    disabled={!isAvailable}
                    className={`w-full p-4 border-2 rounded-lg text-left min-h-[60px] ${isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : isAvailable
                        ? 'border-gray-300 active:bg-gray-100'
                        : 'border-gray-200 bg-gray-100 opacity-50'
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">{size}ml</span>
                      {!isAvailable && (
                        <span className="text-xs text-red-600">No pegs remaining</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleRedeem}
            disabled={!selectedPegSize || loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold min-h-[44px] disabled:opacity-50"
          >
            {loading ? 'Generating QR...' : 'Get QR Code'}
          </button>
        </>
      )}
    </div>
  );
}
