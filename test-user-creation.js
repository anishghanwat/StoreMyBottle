// Test user creation to debug the database constraint issue
const API_URL = 'https://storemybottle-backend.onrender.com';

async function testUserCreation() {
    console.log('🧪 Testing User Creation Issue...\n');

    try {
        // Test the specific user ID that's failing
        const userId = 'user_38tTAr60s9wOShjkRCKqrBv0Ndh';

        console.log('1. Testing if user already exists...');

        // Try to get user bottles (this will show if user exists)
        const bottlesResponse = await fetch(`${API_URL}/api/redemptions/my-bottles`, {
            headers: {
                'Authorization': 'Bearer mock_token_for_testing'
            }
        });

        const bottlesData = await bottlesResponse.json();
        console.log(`My bottles response: ${bottlesResponse.status}`);
        console.log(`Response: ${JSON.stringify(bottlesData, null, 2)}`);

        if (bottlesData.error && bottlesData.error.includes('create user record')) {
            console.log('\n❌ User creation is failing');
            console.log('Possible causes:');
            console.log('1. UNIQUE constraint violation on email/phone (both NULL)');
            console.log('2. Database connection issue');
            console.log('3. Missing required fields');

            console.log('\n💡 Solution: Update user creation to handle NULL constraints properly');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testUserCreation();