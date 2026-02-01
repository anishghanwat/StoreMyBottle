// Production database setup script with proper UUID schema
const { Pool } = require('pg');

console.log('🚀 Starting production database setup with UUID schema...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL exists:', !!process.env.DATABASE_URL);

// Create connection pool with SSL for production
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    max: 10
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Database connected successfully at:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

async function dropExistingTables() {
    try {
        console.log('🗑️ Dropping existing tables...');

        // Drop tables in reverse dependency order
        await pool.query('DROP TABLE IF EXISTS redemptions CASCADE;');
        await pool.query('DROP TABLE IF EXISTS purchases CASCADE;');
        await pool.query('DROP TABLE IF EXISTS bottles CASCADE;');
        await pool.query('DROP TABLE IF EXISTS venues CASCADE;');
        await pool.query('DROP TABLE IF EXISTS users CASCADE;');

        console.log('✅ Existing tables dropped');
    } catch (error) {
        console.error('❌ Failed to drop tables:', error.message);
    }
}

async function enableUuidExtension() {
    try {
        console.log('🔧 Enabling UUID extension...');
        await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
        console.log('✅ UUID extension enabled');
    } catch (error) {
        console.error('❌ Failed to enable UUID extension:', error.message);
    }
}

async function createTables() {
    const migrations = [
        {
            name: 'users',
            sql: `
                CREATE TABLE users (
                    id TEXT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'customer',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        },
        {
            name: 'venues',
            sql: `
                CREATE TABLE venues (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    name VARCHAR(255) NOT NULL,
                    address TEXT,
                    phone VARCHAR(20),
                    email VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);
            `
        },
        {
            name: 'bottles',
            sql: `
                CREATE TABLE bottles (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
                    brand VARCHAR(255) NOT NULL,
                    type VARCHAR(100),
                    size VARCHAR(50),
                    price DECIMAL(10,2) NOT NULL,
                    pegs_total INTEGER DEFAULT 30,
                    pegs_remaining INTEGER DEFAULT 30,
                    status VARCHAR(50) DEFAULT 'available',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_bottles_venue_id ON bottles(venue_id);
            `
        },
        {
            name: 'purchases',
            sql: `
                CREATE TABLE purchases (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    bottle_id UUID REFERENCES bottles(id) ON DELETE CASCADE,
                    pegs_purchased INTEGER NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    payment_status VARCHAR(50) DEFAULT 'pending',
                    payment_method VARCHAR(50),
                    qr_code TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
                CREATE INDEX IF NOT EXISTS idx_purchases_bottle_id ON purchases(bottle_id);
            `
        },
        {
            name: 'redemptions',
            sql: `
                CREATE TABLE redemptions (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    bottle_id UUID REFERENCES bottles(id) ON DELETE CASCADE,
                    pegs_redeemed INTEGER NOT NULL,
                    redeemed_by TEXT,
                    qr_code TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                CREATE INDEX IF NOT EXISTS idx_redemptions_purchase_id ON redemptions(purchase_id);
                CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);
            `
        }
    ];

    for (const migration of migrations) {
        try {
            console.log(`Creating table: ${migration.name}`);
            await pool.query(migration.sql);
            console.log(`✅ Table ${migration.name} created successfully`);
        } catch (error) {
            console.error(`❌ Failed to create table ${migration.name}:`, error.message);
        }
    }
}

async function insertSampleData() {
    try {
        console.log('Inserting sample data with UUIDs...');

        // Insert sample venues and get their UUIDs
        const venueResult = await pool.query(`
            INSERT INTO venues (name, address, phone, email) VALUES
            ('The Whiskey Bar', '123 Main St, Mumbai', '+91-9876543210', 'info@whiskeybar.com'),
            ('Club Paradise', '456 Park Ave, Delhi', '+91-9876543211', 'contact@clubparadise.com')
            RETURNING id, name;
        `);

        console.log('✅ Venues inserted:');
        venueResult.rows.forEach(venue => {
            console.log(`  - ${venue.name}: ${venue.id}`);
        });

        const venue1Id = venueResult.rows[0].id;
        const venue2Id = venueResult.rows[1].id;

        // Insert sample bottles with venue UUIDs
        const bottleResult = await pool.query(`
            INSERT INTO bottles (venue_id, brand, type, size, price, pegs_total, pegs_remaining) VALUES
            ($1, 'Royal Challenge', 'Whiskey', '750ml', 2500.00, 30, 30),
            ($1, 'Blenders Pride', 'Whiskey', '750ml', 2200.00, 30, 30),
            ($2, 'Grey Goose', 'Vodka', '750ml', 8000.00, 30, 30),
            ($2, 'Absolut', 'Vodka', '750ml', 4500.00, 30, 30)
            RETURNING id, brand, venue_id;
        `, [venue1Id, venue2Id]);

        console.log('✅ Bottles inserted:');
        bottleResult.rows.forEach(bottle => {
            console.log(`  - ${bottle.brand}: ${bottle.id} (venue: ${bottle.venue_id})`);
        });

    } catch (error) {
        console.error('❌ Failed to insert sample data:', error.message);
    }
}

async function verifySetup() {
    try {
        console.log('Verifying database setup...');

        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('📋 Created tables:');
        tables.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

        const venueCount = await pool.query('SELECT COUNT(*) FROM venues');
        const bottleCount = await pool.query('SELECT COUNT(*) FROM bottles');

        console.log(`📊 Data counts:`);
        console.log(`  - Venues: ${venueCount.rows[0].count}`);
        console.log(`  - Bottles: ${bottleCount.rows[0].count}`);

        // Show actual venue UUIDs for frontend reference
        const venues = await pool.query('SELECT id, name FROM venues ORDER BY name');
        console.log('🏢 Venue UUIDs for frontend:');
        venues.rows.forEach(venue => {
            console.log(`  - ${venue.name}: ${venue.id}`);
        });

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

async function main() {
    try {
        const connected = await testConnection();
        if (!connected) {
            console.error('Cannot proceed without database connection');
            process.exit(1);
        }

        await enableUuidExtension();
        await dropExistingTables();
        await createTables();
        await insertSampleData();
        await verifySetup();

        console.log('🎉 Production database setup with UUIDs completed successfully!');
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run setup
main();