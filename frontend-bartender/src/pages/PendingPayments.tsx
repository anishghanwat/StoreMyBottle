// Pending Payments Page - Mobile-First, One-Handed Optimized
// Bartender sees list of pending payments

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, type PendingPayment } from '../services/api';
import { SignOutButton } from '../components/SignOutButton';

export default function PendingPayments() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPayments();
    // Refresh every 5 seconds to get new pending payments
    const interval = setInterval(loadPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPendingPayments();
      setPayments(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unauthorized')) {
        navigate('/sign-in');
      } else if (err instanceof Error && err.message.includes('Forbidden')) {
        setError(err.message + ' Set your role to bartender in Clerk Dashboard → User → Public metadata → { "role": "bartender" }');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load payments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (purchaseId: string) => {
    try {
      await apiService.markPaymentPaid(purchaseId);
      // Remove from list
      setPayments(payments.filter(p => p.id !== purchaseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark payment as paid');
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div>Loading pending payments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Pending Payments</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/scan')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
          >
            Scan QR
          </button>
          <SignOutButton />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => loadPayments()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <p>No pending payments</p>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="p-4 border rounded-lg"
            >
              <div className="mb-3">
                <h2 className="text-lg font-semibold">{payment.bottle_name}</h2>
                <p className="text-sm text-gray-600">{payment.brand}</p>
                <p className="text-xs text-gray-500 mt-1">{payment.venue_name}</p>
                {payment.user_email && (
                  <p className="text-xs text-gray-500">Customer: {payment.user_email}</p>
                )}
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium">Total: {payment.total_ml}ml</p>
                <p className="text-xs text-gray-500">
                  Ordered: {new Date(payment.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800 font-medium">⚠️ Payment Required</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Customer will pay you directly (UPI/cash/card). Mark as paid after receiving payment.
                </p>
              </div>

              <button
                onClick={() => handleMarkPaid(payment.id)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold min-h-[44px]"
              >
                ✓ Mark as Paid (Payment Received)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
