// Production database migration script
// Run this after deploying to Railway to set up the database schema

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use Railway database URL from environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigrations() {
    try {
        console.log('🚀 Starting database migrations...');
        console.log('Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not found');

        // Get all migration files
        const migrationsDir = path.join(__dirname, '../database/migrations');
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`Found ${migrationFiles.length} migration files`);

        // Run each migration
        for (const file of migrationFiles) {
            console.log(`Running migration: ${file}`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            await pool.query(sql);
            console.log(`✅ Completed: ${file}`);
        }

        console.log('🎉 All migrations completed successfully!');

        // Verify tables were created
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('📋 Created tables:');
        result.rows.forEach(row => {
            console.log(`  - ${row.table_name}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run migrations
runMigrations();