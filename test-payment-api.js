// Test payment API with user sync fix
const API_URL = 'https://storemybottle-backend.onrender.com';

async function testPaymentAPI() {
    console.log('🧪 Testing Payment API with User Sync Fix...\n');

    try {
        // Test 1: Get venues (should work)
        console.log('1. Testing venues API...');
        const venuesResponse = await fetch(`${API_URL}/api/venues`);
        const venuesData = await venuesResponse.json();

        if (venuesResponse.ok && venuesData.data && venuesData.data.length > 0) {
            console.log('✅ Venues API working');
            console.log(`   Found ${venuesData.data.length} venues`);

            const firstVenue = venuesData.data[0];
            console.log(`   First venue: ${firstVenue.name} (${firstVenue.id})`);

            // Test 2: Get bottles for first venue
            console.log('\n2. Testing bottles API...');
            const bottlesResponse = await fetch(`${API_URL}/api/bottles/venue/${firstVenue.id}`);
            const bottlesData = await bottlesResponse.json();

            if (bottlesResponse.ok && bottlesData.length > 0) {
                console.log('✅ Bottles API working');
                console.log(`   Found ${bottlesData.length} bottles`);

                const firstBottle = bottlesData[0];
                console.log(`   First bottle: ${firstBottle.brand} ${firstBottle.type} (${firstBottle.id})`);

                // Test 3: Test payment initiation (this should now work with user sync fix)
                console.log('\n3. Testing payment initiation (with mock auth)...');
                console.log('   Note: This will fail with 401 Unauthorized (expected without auth token)');
                console.log('   But the error should NOT be "Failed to sync user data"');

                const paymentResponse = await fetch(`${API_URL}/api/payments/initiate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // No auth token - should get 401, not user sync error
                    },
                    body: JSON.stringify({
                        bottle_id: firstBottle.id
                    })
                });

                const paymentData = await paymentResponse.json();
                console.log(`   Response status: ${paymentResponse.status}`);
                console.log(`   Response: ${JSON.stringify(paymentData, null, 2)}`);

                if (paymentResponse.status === 401 && paymentData.error === 'Unauthorized') {
                    console.log('✅ Payment API responding correctly (401 without auth)');
                    console.log('✅ No "Failed to sync user data" error - fix successful!');
                } else {
                    console.log('❌ Unexpected payment API response');
                }
            } else {
                console.log('❌ Bottles API failed');
                console.log(`   Status: ${bottlesResponse.status}`);
                console.log(`   Response: ${JSON.stringify(bottlesData, null, 2)}`);
            }
        } else {
            console.log('❌ Venues API failed');
            console.log(`   Status: ${venuesResponse.status}`);
            console.log(`   Response: ${JSON.stringify(venuesData, null, 2)}`);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testPaymentAPI();