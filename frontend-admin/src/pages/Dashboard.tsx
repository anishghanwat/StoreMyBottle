// Admin Dashboard Page
// Displays statistics and overview

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface DashboardStats {
  users: { total: number };
  purchases: { total: number; paid: number; pending: number };
  redemptions: { total: number; served: number; pending: number };
  venues: { total: number };
  bottles: { total: number };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboard();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error: {error}</p>
        <button onClick={loadDashboard} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Users Card */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-3xl font-bold">{stats?.users.total || 0}</p>
        </div>

        {/* Purchases Card */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Purchases</h2>
          <p className="text-3xl font-bold">{stats?.purchases.total || 0}</p>
          <p className="text-sm text-muted-foreground">
            Paid: {stats?.purchases.paid || 0} | Pending: {stats?.purchases.pending || 0}
          </p>
        </div>

        {/* Redemptions Card */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Redemptions</h2>
          <p className="text-3xl font-bold">{stats?.redemptions.total || 0}</p>
          <p className="text-sm text-muted-foreground">
            Served: {stats?.redemptions.served || 0} | Pending: {stats?.redemptions.pending || 0}
          </p>
        </div>

        {/* Venues Card */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Venues</h2>
          <p className="text-3xl font-bold">{stats?.venues.total || 0}</p>
        </div>

        {/* Bottles Card */}
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Bottles</h2>
          <p className="text-3xl font-bold">{stats?.bottles.total || 0}</p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={() => navigate('/venues')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Manage Venues
        </button>
        <button
          onClick={() => navigate('/bottles')}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Manage Bottles
        </button>
        <button
          onClick={() => navigate('/users')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Manage Users
        </button>
      </div>
    </div>
  );
}
