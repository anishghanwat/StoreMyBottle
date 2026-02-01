// Database connection configuration
// Note: pg package needs to be installed: npm install pg
//       Types: npm install -D @types/pg

import { Pool } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Check if this is a Supabase connection
    const isSupabase = connectionString.includes('supabase.co');

    // For Supabase in production, use explicit configuration to avoid IPv6 issues
    if (isSupabase && process.env.NODE_ENV === 'production') {
      try {
        // Parse the connection string to extract components
        const url = new URL(connectionString);

        pool = new Pool({
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1),
          user: url.username,
          password: url.password,
          // Connection pool settings
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 20000,
          // Force SSL for Supabase
          ssl: { rejectUnauthorized: false },
        });
      } catch (parseError) {
        console.error('Failed to parse DATABASE_URL, falling back to connection string:', parseError);
        // Fallback to connection string
        pool = new Pool({
          connectionString,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 20000,
          ssl: { rejectUnauthorized: false },
        });
      }
    } else {
      // Use connection string for local development or non-Supabase
      pool = new Pool({
        connectionString,
        // Connection pool settings
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 15000,
        // SSL configuration
        ssl: isSupabase || process.env.NODE_ENV === 'production' ? {
          rejectUnauthorized: false
        } : false,
      });
    }

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  return pool;
}

export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
