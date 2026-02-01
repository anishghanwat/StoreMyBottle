// Simple database connection test
const { Pool } = require('pg');

const dbUrl = process.env.DATABASE_URL;
console.log('Testing database connection...');
console.log('Database URL format:', dbUrl ? dbUrl.replace(/:[^:@]*@/, ':****@') : 'Not found');

// Parse the URL to see components
if (dbUrl) {
    try {
        const url = new URL(dbUrl);
        console.log('Host:', url.hostname);
        console.log('Port:', url.port);
        console.log('Database:', url.pathname.slice(1));
        console.log('Username:', url.username);
        console.log('Password length:', url.password ? url.password.length : 0);
    } catch (error) {
        console.error('URL parsing error:', error.message);
    }
}

// Test different connection configurations
const configs = [
    {
        name: 'Standard SSL',
        config: {
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false }
        }
    },
    {
        name: 'No SSL',
        config: {
            connectionString: dbUrl,
            ssl: false
        }
    },
    {
        name: 'Require SSL',
        config: {
            connectionString: dbUrl,
            ssl: { rejectUnauthorized: false, require: true }
        }
    }
];

async function testConfig(config) {
    const pool = new Pool(config.config);
    try {
        console.log(`\nTesting ${config.name}...`);
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Success:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.log('❌ Failed:', error.message);
        return false;
    } finally {
        await pool.end();
    }
}

async function main() {
    for (const config of configs) {
        const success = await testConfig(config);
        if (success) {
            console.log(`\n🎉 Working configuration: ${config.name}`);
            break;
        }
    }
}

main();