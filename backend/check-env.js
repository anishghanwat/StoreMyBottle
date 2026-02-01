// Simple script to check environment variables
console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ?
    process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@') : 'NOT SET');
console.log('CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ?
    process.env.CLERK_SECRET_KEY.substring(0, 20) + '...' : 'NOT SET');
console.log('ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS || 'NOT SET');
console.log('LOG_LEVEL:', process.env.LOG_LEVEL || 'NOT SET');

// Test database connection
const { Pool } = require('pg');

async function testDB() {
    if (!process.env.DATABASE_URL) {
        console.log('\n❌ DATABASE_URL not set');
        return;
    }

    try {
        console.log('\n🔍 Testing database connection...');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Database connected successfully at:', result.rows[0].now);
        client.release();
        await pool.end();
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
    }
}

testDB();