// Production sample data initialization script
// Run this after migrations to add initial venues and bottles

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initSampleData() {
    try {
        console.log('🚀 Initializing sample data for production...');

        // Check if venues exist
        const venuesResult = await pool.query('SELECT COUNT(*) FROM venues');
        const venueCount = parseInt(venuesResult.rows[0].count);

        if (venueCount === 0) {
            console.log('Adding sample venues...');

            // Add sample venues
            const venue1 = await pool.query(
                'INSERT INTO venues (name, address) VALUES ($1, $2) RETURNING *',
                ['Demo Bar & Lounge', '123 Main Street, Downtown']
            );

            const venue2 = await pool.query(
                'INSERT INTO venues (name, address) VALUES ($1, $2) RETURNING *',
                ['Rooftop Terrace', '456 High Street, Uptown']
            );

            console.log('✅ Sample venues added');

            // Add sample bottles for venue 1
            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue1.rows[0].id, 'Premium Whiskey', 'Jack Daniels', 2500, 750, true]
            );

            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue1.rows[0].id, 'Premium Vodka', 'Grey Goose', 3000, 750, true]
            );

            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue1.rows[0].id, 'Premium Gin', 'Hendricks', 2800, 750, true]
            );

            // Add sample bottles for venue 2
            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue2.rows[0].id, 'Single Malt', 'Macallan 12', 4500, 750, true]
            );

            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue2.rows[0].id, 'Premium Rum', 'Captain Morgan', 2000, 750, true]
            );

            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue2.rows[0].id, 'Craft Beer Selection', 'Local Brewery', 1500, 500, true]
            );

            console.log('✅ Sample bottles added successfully!');

            // Show summary
            const finalVenues = await pool.query('SELECT COUNT(*) FROM venues');
            const finalBottles = await pool.query('SELECT COUNT(*) FROM bottles');

            console.log(`📊 Summary:`);
            console.log(`  - Venues: ${finalVenues.rows[0].count}`);
            console.log(`  - Bottles: ${finalBottles.rows[0].count}`);

        } else {
            console.log(`Found ${venueCount} venues, skipping sample data creation.`);
        }

        console.log('🎉 Sample data initialization complete!');
    } catch (error) {
        console.error('❌ Error initializing sample data:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initSampleData();