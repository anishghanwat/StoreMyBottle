// Test direct user creation in the database to isolate the issue
const { Pool } = require('pg');

const DATABASE_URL = 'postgresql://storemybottle_user:wOOqgq9StaVvBRqqxAOeF7IbaE8LGw96@dpg-d5vhj67pm1nc73cjral0-a.oregon-postgres.render.com/storemybottle';

async function testDirectUserCreation() {
    console.log('🧪 Testing Direct User Creation in Database...\n');

    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        // Test 1: Check if user already exists
        const userId = 'user_38tTAr60s9wOShjkRCKqrBv0Ndh';
        console.log('1. Checking if user already exists...');

        const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);

        if (existingUser.rows.length > 0) {
            console.log('✅ User already exists in database:');
            console.log(JSON.stringify(existingUser.rows[0], null, 2));
            console.log('\n💡 This means the issue is not user creation - user already exists!');
            console.log('   The error might be in a different part of the payment flow.');
            return;
        }

        console.log('❌ User does not exist, attempting to create...');

        // Test 2: Try to create the user directly
        console.log('\n2. Testing user creation with unique email...');

        try {
            const newUser = await pool.query(
                `INSERT INTO users (id, email, role) VALUES ($1, $2, $3) RETURNING *`,
                [userId, `${userId}@clerk.temp`, 'customer']
            );

            console.log('✅ User created successfully:');
            console.log(JSON.stringify(newUser.rows[0], null, 2));

            // Clean up - delete the test user
            await pool.query('DELETE FROM users WHERE id = $1', [userId]);
            console.log('✅ Test user cleaned up');

        } catch (createError) {
            console.log('❌ User creation failed:');
            console.log('Error:', createError.message);
            console.log('Code:', createError.code);

            if (createError.code === '23505') {
                console.log('💡 This is a UNIQUE constraint violation');
                console.log('   Checking for existing users with similar email/phone...');

                const duplicates = await pool.query(
                    `SELECT * FROM users WHERE email LIKE '%@clerk.temp' OR phone IS NULL`
                );

                console.log(`Found ${duplicates.rows.length} users with temp emails or null phones`);
                if (duplicates.rows.length > 0) {
                    console.log('Sample:', JSON.stringify(duplicates.rows[0], null, 2));
                }
            }
        }

    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    } finally {
        await pool.end();
    }
}

testDirectUserCreation();