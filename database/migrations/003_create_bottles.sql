-- Migration: Create bottles table
-- Run this migration after 002_create_venues.sql

CREATE TABLE IF NOT EXISTS bottles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    total_ml INTEGER NOT NULL CHECK (total_ml > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on venue_id for faster queries
CREATE INDEX IF NOT EXISTS idx_bottles_venue_id ON bottles(venue_id);

-- Create index on is_active for filtering active bottles
CREATE INDEX IF NOT EXISTS idx_bottles_is_active ON bottles(is_active) WHERE is_active = true;

COMMENT ON TABLE bottles IS 'Bottles available for purchase at each venue';
COMMENT ON COLUMN bottles.venue_id IS 'Foreign key to venues table';
COMMENT ON COLUMN bottles.name IS 'Name of the bottle (e.g., "Johnnie Walker Black Label")';
COMMENT ON COLUMN bottles.brand IS 'Brand name (e.g., "Johnnie Walker")';
COMMENT ON COLUMN bottles.price IS 'Purchase price in local currency';
COMMENT ON COLUMN bottles.total_ml IS 'Total milliliters in the bottle';
COMMENT ON COLUMN bottles.is_active IS 'Whether the bottle is currently available for purchase';
