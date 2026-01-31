// Debug Page - Test API connections
import { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { apiService } from '../services/api';

export default function Debug() {
    const [results, setResults] = useState<any>({});
    const [loading, setLoading] = useState<string | null>(null);
    const { isSignedIn, getToken } = useAuth();
    const { user } = useUser();

    const testAPI = async (endpoint: string, testFn: () => Promise<any>) => {
        setLoading(endpoint);
        try {
            const result = await testFn();
            setResults((prev: any) => ({ ...prev, [endpoint]: { success: true, data: result } }));
        } catch (error: any) {
            setResults((prev: any) => ({ ...prev, [endpoint]: { success: false, error: error.message } }));
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen p-4">
            <h1 className="text-2xl font-bold mb-6">API Debug Page</h1>

            {/* Authentication Status */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-bold mb-2">Authentication Status</h2>
                <p><strong>Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}</p>
                {user && (
                    <>
                        <p><strong>User ID:</strong> {user.id}</p>
                        <p><strong>Email:</strong> {user.primaryEmailAddress?.emailAddress || 'N/A'}</p>
                        <p><strong>Role:</strong> {user.publicMetadata?.role as string || 'Not set'}</p>
                    </>
                )}
                {!isSignedIn && (
                    <p className="text-red-600 mt-2">⚠️ You need to sign in to test protected endpoints</p>
                )}
            </div>

            <div className="space-y-4">
                <button
                    onClick={() => testAPI('venues', () => apiService.getVenues())}
                    disabled={loading === 'venues'}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                >
                    {loading === 'venues' ? 'Testing...' : 'Test Get Venues (Public)'}
                </button>

                <button
                    onClick={() => testAPI('bottles', () => apiService.getBottlesByVenue('5c1088ac-c0f3-497d-94fa-e741bb442930'))}
                    disabled={loading === 'bottles'}
                    className="w-full p-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                    {loading === 'bottles' ? 'Testing...' : 'Test Get Bottles (Public)'}
                </button>

                <button
                    onClick={() => testAPI('my-bottles', () => apiService.getMyBottles())}
                    disabled={loading === 'my-bottles' || !isSignedIn}
                    className="w-full p-3 bg-purple-600 text-white rounded-lg disabled:opacity-50"
                >
                    {loading === 'my-bottles' ? 'Testing...' : 'Test Get My Bottles (Protected)'}
                </button>

                <button
                    onClick={() => window.location.href = '/my-bottles'}
                    className="w-full p-3 bg-orange-600 text-white rounded-lg"
                >
                    Go to My Bottles Page
                </button>

                <button
                    onClick={() => testAPI('purchase', () => apiService.initiatePurchase('e63642bf-bd21-4c89-be0a-e5f130e2deca'))}
                    disabled={loading === 'purchase' || !isSignedIn}
                    className="w-full p-3 bg-red-600 text-white rounded-lg disabled:opacity-50"
                >
                    {loading === 'purchase' ? 'Testing...' : 'Test Initiate Purchase (Protected)'}
                </button>

                <button
                    onClick={() => testAPI('auth-test', async () => {
                        const token = await getToken();
                        console.log('Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
                        return {
                            hasToken: !!token,
                            tokenLength: token?.length || 0,
                            tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
                        };
                    })}
                    disabled={loading === 'auth-test'}
                    className="w-full p-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                    {loading === 'auth-test' ? 'Testing...' : 'Test Auth Token'}
                </button>

                <button
                    onClick={() => testAPI('api-token-test', async () => {
                        // Test if API service has token getter
                        const { setAuthTokenGetter } = await import('../services/api');
                        const token = await getToken();
                        console.log('Setting token getter with token:', token ? `${token.substring(0, 20)}...` : 'null');

                        // Re-set the token getter to ensure it's current
                        setAuthTokenGetter(() => getToken());

                        return {
                            tokenAvailable: !!token,
                            tokenSetInAPI: true,
                            tokenLength: token?.length || 0
                        };
                    })}
                    disabled={loading === 'api-token-test'}
                    className="w-full p-3 bg-yellow-600 text-white rounded-lg disabled:opacity-50"
                >
                    {loading === 'api-token-test' ? 'Testing...' : 'Test API Token Setup'}
                </button>

                <button
                    onClick={() => testAPI('manual-auth-test', async () => {
                        const token = await getToken();
                        if (!token) {
                            throw new Error('No token available');
                        }

                        const response = await fetch('http://localhost:3000/api/payments/initiate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ bottle_id: 'e63642bf-bd21-4c89-be0a-e5f130e2deca' })
                        });

                        if (!response.ok) {
                            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
                            throw new Error(`HTTP ${response.status}: ${error.error || 'Unknown error'}`);
                        }
                        return await response.json();
                    })}
                    disabled={loading === 'manual-auth-test' || !isSignedIn}
                    className="w-full p-3 bg-green-600 text-white rounded-lg disabled:opacity-50"
                >
                    {loading === 'manual-auth-test' ? 'Testing...' : 'Test Manual Auth Purchase'}
                </button>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Results:</h2>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                    {JSON.stringify(results, null, 2)}
                </pre>
            </div>
        </div>
    );
}