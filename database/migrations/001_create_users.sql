-- Migration: Create users table
-- Run this migration manually or via migration script

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Clerk user ID (not UUID)
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'bartender', 'admin')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;

-- Create index on phone for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- Create index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

COMMENT ON TABLE users IS 'User accounts synced from Clerk authentication';
COMMENT ON COLUMN users.id IS 'Clerk user ID (string format, not UUID)';
COMMENT ON COLUMN users.role IS 'User role for authorization';
COMMENT ON COLUMN users.email IS 'User email (nullable, can use phone instead)';
COMMENT ON COLUMN users.phone IS 'User phone number (nullable, can use email instead)';
COMMENT ON COLUMN users.role IS 'User role: customer, bartender, or admin';
