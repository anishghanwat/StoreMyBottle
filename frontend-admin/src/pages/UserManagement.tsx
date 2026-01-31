// User Management Page (Admin)
// Admin can view and manage users

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

interface User {
    id: string;
    email: string;
    phone?: string;
    role: 'customer' | 'bartender' | 'admin';
    created_at: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAllUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, role: string) => {
        try {
            await apiService.updateUserRole(userId, role);
            setEditingUser(null);
            setNewRole('');
            loadUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user role');
        }
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setNewRole(user.role);
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setNewRole('');
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'bartender': return 'bg-blue-100 text-blue-800';
            case 'customer': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p>Loading users...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-500 text-white rounded min-h-[44px]"
                >
                    Back to Dashboard
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-sm text-red-600 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">All Users ({users.length})</h2>
                </div>

                {users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.email || 'No email'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {user.id.substring(0, 20)}...
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.phone || 'No phone'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingUser?.id === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={newRole}
                                                        onChange={(e) => setNewRole(e.target.value)}
                                                        className="text-sm border rounded px-2 py-1"
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="bartender">Bartender</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, newRole)}
                                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEdit}
                                                        className="text-xs bg-gray-500 text-white px-2 py-1 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {editingUser?.id !== user.id && (
                                                <button
                                                    onClick={() => startEdit(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit Role
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">Role Permissions</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li><strong>Customer:</strong> Can purchase bottles and redeem pegs</li>
                    <li><strong>Bartender:</strong> Can view pending payments and mark them as paid</li>
                    <li><strong>Admin:</strong> Full access to all features including user management</li>
                </ul>
            </div>
        </div>
    );
}