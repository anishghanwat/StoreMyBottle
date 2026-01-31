// Sample data initialization script
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/storemybottle'
});

async function initSampleData() {
    try {
        console.log('Initializing sample data...');

        // Check if venues exist
        const venuesResult = await pool.query('SELECT COUNT(*) FROM venues');
        const venueCount = parseInt(venuesResult.rows[0].count);

        if (venueCount === 0) {
            console.log('Adding sample venues...');

            // Add sample venues
            const venue1 = await pool.query(
                'INSERT INTO venues (name, address) VALUES ($1, $2) RETURNING *',
                ['The Blue Bar', '123 Main Street, Downtown']
            );

            const venue2 = await pool.query(
                'INSERT INTO venues (name, address) VALUES ($1, $2) RETURNING *',
                ['Rooftop Lounge', '456 High Street, Uptown']
            );

            console.log('Sample venues added:', venue1.rows[0], venue2.rows[0]);

            // Add sample bottles for venue 1
            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue1.rows[0].id, 'Premium Whiskey', 'Jack Daniels', 2500, 750, true]
            );

            await pool.query(
                'INSERT INTO bottles (venue_id, name, brand, price, total_ml, is_active) VALUES ($1, $2, $3, $4, $5, $6)',
                [venue1.rows[0].id, 'Premium Vodka', 'Grey Goose', 3000, 750, true]
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

            console.log('Sample bottles added successfully!');
        } else {
            console.log(`Found ${venueCount} venues, skipping sample data creation.`);
        }

        console.log('Sample data initialization complete!');
    } catch (error) {
        console.error('Error initializing sample data:', error);
    } finally {
        await pool.end();
    }
}

initSampleData();