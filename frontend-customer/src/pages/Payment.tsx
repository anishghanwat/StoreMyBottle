// Payment Page - Mobile-First, QR-Optimized
// Customer sees QR code after purchase initiation

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import QRCode from 'qrcode';

interface Purchase {
  id: string;
  payment_qr_code: string | null;
  payment_status: string;
  bottle_name?: string;
  venue_name?: string;
}

export default function Payment() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!purchaseId) {
        setError('No purchase ID provided');
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.getPurchase(purchaseId);
        setPurchase(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching purchase:', err);

        // If purchase not found, try again after a short delay (might be timing issue)
        if (err instanceof Error && err.message.includes('not found')) {
          setTimeout(async () => {
            try {
              const response = await apiService.getPurchase(purchaseId);
              setPurchase(response);
              setError(null);
            } catch (retryErr) {
              console.error('Purchase still not found after retry:', retryErr);
              setError(retryErr instanceof Error ? retryErr.message : 'Failed to load purchase');
            }
          }, 2000);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load purchase');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [purchaseId]);

  // QR code display component
  // Note: QR code should be at least 200x200px for mobile scanning
  const QRCodeDisplay = ({ qrData }: { qrData: string }) => {
    const [qrImageUrl, setQrImageUrl] = useState<string>('');

    useEffect(() => {
      const generateQR = async () => {
        try {
          const url = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrImageUrl(url);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };

      generateQR();
    }, [qrData]);

    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          {qrImageUrl ? (
            <img
              src={qrImageUrl}
              alt="Payment QR Code"
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
        <p className="mt-4 text-sm text-gray-600 text-center">
          Show this QR code to the bartender
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment QR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!purchase || !purchase.payment_qr_code) {
    return (
      <div className="min-h-screen p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-yellow-800 font-semibold mb-2">Purchase Not Found</h2>
          <p className="text-yellow-600">The purchase could not be found or does not have a QR code.</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Payment QR Code</h1>

      {purchase.bottle_name && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800">{purchase.bottle_name}</h2>
          {purchase.venue_name && (
            <p className="text-blue-600 text-sm">at {purchase.venue_name}</p>
          )}
        </div>
      )}

      <div className="flex flex-col items-center">
        <QRCodeDisplay qrData={purchase.payment_qr_code} />

        <div className="mt-6 w-full">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${purchase.payment_status === 'paid'
              ? 'bg-green-100 text-green-800'
              : purchase.payment_status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
              }`}>
              {purchase.payment_status}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Payment Instructions:</strong>
            </p>
            <ol className="text-sm text-gray-600 space-y-2">
              <li>1. <strong>Show this QR code to the bartender</strong></li>
              <li>2. <strong>Pay the bartender directly</strong> (UPI, cash, or card)</li>
              <li>3. <strong>Wait for confirmation</strong> - bartender will mark payment as received</li>
              <li>4. <strong>Your virtual bottle will appear in "My Bottles"</strong></li>
            </ol>
            <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> No online payment required. Pay the bartender directly at the venue.
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/my-bottles')}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold"
            >
              View My Bottles
            </button>
            <button
              onClick={() => navigate('/venues')}
              className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold"
            >
              Browse More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
