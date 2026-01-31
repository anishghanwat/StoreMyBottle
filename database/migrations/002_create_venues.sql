-- Migration: Create venues table
-- Run this migration after 001_create_users.sql

CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster searches
CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);

COMMENT ON TABLE venues IS 'Bars, clubs, and pubs where bottles are stored';
COMMENT ON COLUMN venues.name IS 'Name of the venue';
COMMENT ON COLUMN venues.address IS 'Physical address of the venue';

-- Seed some test venues (optional, for development)
-- INSERT INTO venues (name, address) VALUES
-- ('The Blue Bar', '123 Main Street, City'),
-- ('Club Nightlife', '456 Party Avenue, City'),
-- ('The Pub Corner', '789 Beer Street, City');
