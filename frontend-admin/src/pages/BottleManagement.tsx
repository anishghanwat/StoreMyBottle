// Bottle Management Page (Admin)
// Admin can create/edit bottles

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface Venue {
  id: string;
  name: string;
  address: string;
}

interface Bottle {
  id: string;
  venue_id: string;
  name: string;
  brand: string;
  price: number;
  total_ml: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function BottleManagement() {
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBottle, setEditingBottle] = useState<Bottle | null>(null);
  const [formData, setFormData] = useState({
    venue_id: '',
    name: '',
    brand: '',
    price: '',
    total_ml: '',
    is_active: true,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const data = await apiService.getVenues();
      setVenues(data);
    } catch (err) {
      console.error('Error loading venues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const loadBottles = async () => {
    if (venues.length === 0) {
      return;
    }

    try {
      setLoading(true);
      const allBottles: Bottle[] = [];
      for (const venue of venues) {
        try {
          const venueBottles = await apiService.getBottlesByVenue(venue.id);
          allBottles.push(...venueBottles);
        } catch (err) {
          console.error(`Error loading bottles for venue ${venue.id}:`, err);
        }
      }
      setBottles(allBottles);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bottles');
    } finally {
      setLoading(false);
    }
  };

  // Reload bottles when venues are loaded
  useEffect(() => {
    if (venues.length > 0) {
      loadBottles();
    }
  }, [venues.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        venue_id: formData.venue_id,
        name: formData.name,
        brand: formData.brand,
        price: parseFloat(formData.price),
        total_ml: parseInt(formData.total_ml),
        is_active: formData.is_active,
      };
      if (editingBottle) {
        await apiService.updateBottle(editingBottle.id, body);
      } else {
        await apiService.createBottle(body);
      }
      setShowForm(false);
      setEditingBottle(null);
      setFormData({
        venue_id: '',
        name: '',
        brand: '',
        price: '',
        total_ml: '',
        is_active: true,
      });
      loadBottles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bottle');
    }
  };

  const handleEdit = (bottle: Bottle) => {
    setEditingBottle(bottle);
    setFormData({
      venue_id: bottle.venue_id,
      name: bottle.name,
      brand: bottle.brand,
      price: bottle.price.toString(),
      total_ml: bottle.total_ml.toString(),
      is_active: bottle.is_active,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBottle(null);
    setFormData({
      venue_id: '',
      name: '',
      brand: '',
      price: '',
      total_ml: '',
      is_active: true,
    });
  };

  const handleDelete = async (bottle: Bottle) => {
    if (!confirm(`Are you sure you want to delete "${bottle.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteBottle(bottle.id);
      loadBottles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bottle');
    }
  };

  const getVenueName = (venueId: string): string => {
    const venue = venues.find(v => v.id === venueId);
    return venue ? venue.name : 'Unknown Venue';
  };

  if (loading && venues.length === 0) {
    return (
      <div className="p-4">
        <p>Loading bottles...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bottle Management</h1>
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
            Add Bottle
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
            {editingBottle ? 'Edit Bottle' : 'Add New Bottle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <select
                value={formData.venue_id}
                onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                required
                disabled={!!editingBottle}
                className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
              >
                <option value="">Select a venue</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
              {editingBottle && (
                <p className="text-xs text-gray-500 mt-1">Venue cannot be changed after creation</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Johnnie Walker Black Label"
                className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                required
                placeholder="e.g., Johnnie Walker"
                className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total ML</label>
                <input
                  type="number"
                  min="1"
                  value={formData.total_ml}
                  onChange={(e) => setFormData({ ...formData, total_ml: e.target.value })}
                  required
                  placeholder="750"
                  className="w-full px-3 py-2 border rounded-lg min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-sm font-medium">Active (available for purchase)</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
              >
                {editingBottle ? 'Update' : 'Create'}
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
        {bottles.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No bottles found</p>
        ) : (
          bottles.map((bottle) => (
            <div key={bottle.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{bottle.name}</h3>
                    {!bottle.is_active && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Brand:</span> {bottle.brand} |{' '}
                    <span className="font-medium">Venue:</span> {getVenueName(bottle.venue_id)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Price:</span> ₹{bottle.price.toFixed(2)} |{' '}
                    <span className="font-medium">Size:</span> {bottle.total_ml} mL
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(bottle)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bottle)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg min-h-[44px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
