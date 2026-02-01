// Production database setup script for Render
// This script will create tables and insert sample data

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production database setup...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL exists:', !!process.env.DATABASE_URL);

// Create connection pool with SSL for production
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
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

async function createTables() {
    const migrations = [
        {
            name: 'users',
            sql: `
                CREATE TABLE IF NOT EXISTS users (
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
                CREATE TABLE IF NOT EXISTS venues (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    address TEXT,
                    phone VARCHAR(20),
                    email VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        },
        {
            name: 'bottles',
            sql: `
                CREATE TABLE IF NOT EXISTS bottles (
                    id SERIAL PRIMARY KEY,
                    venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
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
            `
        },
        {
            name: 'purchases',
            sql: `
                CREATE TABLE IF NOT EXISTS purchases (
                    id SERIAL PRIMARY KEY,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    bottle_id INTEGER REFERENCES bottles(id) ON DELETE CASCADE,
                    pegs_purchased INTEGER NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    payment_status VARCHAR(50) DEFAULT 'pending',
                    payment_method VARCHAR(50),
                    qr_code TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `
        },
        {
            name: 'redemptions',
            sql: `
                CREATE TABLE IF NOT EXISTS redemptions (
                    id SERIAL PRIMARY KEY,
                    purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
                    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                    bottle_id INTEGER REFERENCES bottles(id) ON DELETE CASCADE,
                    pegs_redeemed INTEGER NOT NULL,
                    redeemed_by TEXT,
                    qr_code TEXT,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
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
        console.log('Inserting sample data...');

        // Insert sample venues
        await pool.query(`
            INSERT INTO venues (name, address, phone, email) VALUES
            ('The Whiskey Bar', '123 Main St, Mumbai', '+91-9876543210', 'info@whiskeybar.com'),
            ('Club Paradise', '456 Park Ave, Delhi', '+91-9876543211', 'contact@clubparadise.com')
            ON CONFLICT DO NOTHING;
        `);

        // Insert sample bottles
        await pool.query(`
            INSERT INTO bottles (venue_id, brand, type, size, price, pegs_total, pegs_remaining) VALUES
            (1, 'Royal Challenge', 'Whiskey', '750ml', 2500.00, 30, 30),
            (1, 'Blenders Pride', 'Whiskey', '750ml', 2200.00, 30, 30),
            (2, 'Grey Goose', 'Vodka', '750ml', 8000.00, 30, 30),
            (2, 'Absolut', 'Vodka', '750ml', 4500.00, 30, 30)
            ON CONFLICT DO NOTHING;
        `);

        console.log('✅ Sample data inserted successfully');
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

        await createTables();
        await insertSampleData();
        await verifySetup();

        console.log('🎉 Production database setup completed successfully!');
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run setup
main();