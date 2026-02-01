// Test payment API with actual auth token
const API_URL = 'https://storemybottle-backend.onrender.com';

async function testPaymentWithAuth() {
    console.log('🧪 Testing Payment API with Auth Token...\n');

    try {
        // Test with a mock auth token to see the actual error
        console.log('Testing payment initiation with mock auth...');

        const paymentResponse = await fetch(`${API_URL}/api/payments/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer mock_token_to_trigger_auth_flow'
            },
            body: JSON.stringify({
                bottle_id: '71ce7400-0bf7-4ae9-8b53-153e25176fbc' // Known bottle ID
            })
        });

        const paymentData = await paymentResponse.json();
        console.log(`Response status: ${paymentResponse.status}`);
        console.log(`Response: ${JSON.stringify(paymentData, null, 2)}`);

        if (paymentData.error && paymentData.error.includes('sync user data')) {
            console.log('❌ OLD CODE STILL RUNNING - Backend not updated yet');
            console.log('   Render deployment may still be in progress');
        } else if (paymentData.error && paymentData.error.includes('Token validation failed')) {
            console.log('✅ NEW CODE RUNNING - User sync fix deployed');
            console.log('   Error is now about token validation, not user sync');
        } else {
            console.log('🤔 Unexpected response - checking deployment status');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testPaymentWithAuth();