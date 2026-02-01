// Debug the authentication flow between frontend and backend
const API_URL = 'https://storemybottle-backend.onrender.com';

async function debugAuthFlow() {
    console.log('🔍 Debugging Authentication Flow...\n');

    try {
        // Test 1: Check if backend is receiving requests properly
        console.log('1. Testing basic connectivity...');
        const healthResponse = await fetch(`${API_URL}/`);
        const healthData = await healthResponse.text();
        console.log(`✅ Backend responding: ${healthResponse.status}`);

        // Test 2: Check CORS headers
        console.log('\n2. Testing CORS headers...');
        const corsResponse = await fetch(`${API_URL}/api/venues`, {
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://store-my-bottle-users.vercel.app',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'authorization,content-type'
            }
        });
        console.log(`CORS preflight: ${corsResponse.status}`);

        // Test 3: Test with various auth header formats
        console.log('\n3. Testing different auth header formats...');

        const testCases = [
            { name: 'No auth header', headers: {} },
            { name: 'Empty Bearer token', headers: { 'Authorization': 'Bearer ' } },
            { name: 'Invalid Bearer token', headers: { 'Authorization': 'Bearer invalid_token' } },
            { name: 'Malformed auth header', headers: { 'Authorization': 'invalid_format' } }
        ];

        for (const testCase of testCases) {
            console.log(`\n   Testing: ${testCase.name}`);

            const response = await fetch(`${API_URL}/api/payments/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': 'https://store-my-bottle-users.vercel.app',
                    ...testCase.headers
                },
                body: JSON.stringify({
                    bottle_id: '71ce7400-0bf7-4ae9-8b53-153e25176fbc'
                })
            });

            const data = await response.json();
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${data.error}`);

            // Check if we're getting the old "sync user data" error
            if (data.error && data.error.includes('sync user data')) {
                console.log('   ❌ OLD CODE STILL RUNNING - User sync error detected');
            } else if (data.error && data.error.includes('Unauthorized')) {
                console.log('   ✅ NEW CODE RUNNING - Proper auth error');
            }
        }

        console.log('\n4. Summary:');
        console.log('   If you see "sync user data" errors above, the deployment is still pending.');
        console.log('   If you see "Unauthorized" errors, the fix is deployed but auth needs debugging.');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugAuthFlow();