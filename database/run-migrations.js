// Migration runner script
// Uses Node.js pg library to run migrations

const fs = require('fs');
const path = require('path');

// Load pg from backend node_modules
const backendNodeModules = path.join(__dirname, '../backend/node_modules');
const pgPath = path.join(backendNodeModules, 'pg');
const dotenvPath = path.join(backendNodeModules, 'dotenv');

if (!fs.existsSync(pgPath)) {
  console.error('Error: pg module not found. Please install dependencies first:');
  console.error('  cd backend && npm install pg dotenv');
  process.exit(1);
}

const { Client } = require(pgPath);

// Load environment variables
try {
  if (fs.existsSync(dotenvPath)) {
    require(dotenvPath).config({ path: path.join(__dirname, '../backend/.env') });
  }
} catch (e) {
  console.warn('Warning: dotenv not available, using environment variables or defaults');
}

const DATABASE_NAME = 'storemybottle';
// Parse the DATABASE_URL to extract connection details
const defaultUrl = 'postgresql://postgres:root@localhost:5432/postgres';
const envUrl = process.env.DATABASE_URL || defaultUrl;

// Extract connection parts from URL
const urlMatch = envUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
let dbUrl;
if (urlMatch) {
  const [, user, password, host, port, db] = urlMatch;
  // For admin operations, connect to 'postgres' database
  const adminUrl = `postgresql://${user}:${password}@${host}:${port}/postgres`;
  // For migrations, connect to target database
  dbUrl = `postgresql://${user}:${password}@${host}:${port}/${DATABASE_NAME}`;
} else {
  // Fallback to default
  dbUrl = `postgresql://postgres:root@localhost:5432/${DATABASE_NAME}`;
  envUrl = defaultUrl;
}

async function runMigrations() {
  // First, connect to postgres database to create storemybottle if needed
  const adminClient = new Client({
    connectionString: urlMatch ? `postgresql://${urlMatch[1]}:${urlMatch[2]}@${urlMatch[3]}:${urlMatch[4]}/postgres` : defaultUrl
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await adminClient.connect();
    console.log('Connected to PostgreSQL');

    // Check if database exists
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [DATABASE_NAME]
    );

    if (dbCheck.rows.length === 0) {
      console.log(`Creating database ${DATABASE_NAME}...`);
      await adminClient.query(`CREATE DATABASE ${DATABASE_NAME}`);
      console.log(`Database ${DATABASE_NAME} created successfully`);
    } else {
      console.log(`Database ${DATABASE_NAME} already exists`);
    }

    await adminClient.end();

    // Now connect to the storemybottle database
    const client = new Client({
      connectionString: dbUrl
    });

    await client.connect();
    console.log(`Connected to database ${DATABASE_NAME}`);

    // Run migrations in order
    const migrations = [
      '001_create_users.sql',
      '002_create_venues.sql',
      '003_create_bottles.sql',
      '004_create_purchases.sql',
      '005_create_redemptions.sql'
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      console.log(`\nRunning migration: ${migrationFile}...`);
      
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await client.query(sql);
      console.log(`✓ ${migrationFile} completed`);
    }

    // Verify tables were created
    console.log('\nVerifying tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\nCreated tables:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await client.end();
    console.log('\n✅ All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runMigrations();
