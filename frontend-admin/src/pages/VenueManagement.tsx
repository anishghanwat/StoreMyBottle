// Venue Management Page (Admin)
// Admin can create/edit venues

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface Venue {
  id: string;
  name: string;
  address: string;
  created_at?: string;
}

export default function VenueManagement() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const navigate = useNavigate();

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
      setError(err instanceof Error ? err.message : 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await apiService.updateVenue(editingVenue.id, formData);
      } else {
        await apiService.createVenue(formData);
      }
      setShowForm(false);
      setEditingVenue(null);
      setFormData({ name: '', address: '' });
      loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save venue');
    }
  };

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({ name: venue.name, address: venue.address });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVenue(null);
    setFormData({ name: '', address: '' });
  };

  const handleDelete = async (venue: Venue) => {
    if (!confirm(`Are you sure you want to delete "${venue.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteVenue(venue.id);
      loadVenues();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete venue');
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading venues...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Venue Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-500 text-white rounded min-h-[44px]"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded min-h-[44px]"
          >
            Add Venue
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {editingVenue ? 'Edit Venue' : 'Add New Venue'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
              >
                {editingVenue ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {venues.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No venues found</p>
        ) : (
          venues.map((venue) => (
            <div key={venue.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{venue.name}</h3>
                <p className="text-sm text-gray-600">{venue.address}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(venue)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(venue)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg min-h-[44px]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
