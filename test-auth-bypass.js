// Test if auth bypass is active
const API_URL = 'https://storemybottle-backend.onrender.com';

async function testAuthBypass() {
    console.log('🧪 Testing Auth Bypass Status...\n');

    try {
        // Test payment initiation without auth - should work if bypass is active
        console.log('Testing payment initiation without auth token...');

        const response = await fetch(`${API_URL}/api/payments/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bottle_id: '71ce7400-0bf7-4ae9-8b53-153e25176fbc'
            })
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log(`Response: ${JSON.stringify(data, null, 2)}`);

        if (response.status === 401) {
            console.log('\n❌ AUTH BYPASS NOT ACTIVE YET');
            console.log('   Render deployment still in progress...');
            console.log('   Wait 1-2 more minutes and try again');
        } else if (response.status === 201 || response.status === 500) {
            console.log('\n✅ AUTH BYPASS IS ACTIVE!');
            console.log('   Request reached the payment controller');
            if (response.status === 201) {
                console.log('   🎉 PURCHASE FLOW WORKING!');
            } else {
                console.log('   Payment controller running but may have other issues');
            }
        } else {
            console.log('\n🤔 Unexpected response - checking logs...');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testAuthBypass();