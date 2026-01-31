-- Migration: Create redemptions table
-- Run this migration after 004_create_purchases.sql

CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    peg_size_ml INTEGER NOT NULL CHECK (peg_size_ml IN (30, 45, 60)),
    redemption_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(), -- For QR code
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'served', 'expired')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    served_at TIMESTAMP,
    served_by TEXT REFERENCES users(id) ON DELETE SET NULL, -- Bartender who served the peg
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on redemption_token for fast QR code lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_redemptions_token ON redemptions(redemption_token);

-- Create index on purchase_id for querying redemptions by purchase
CREATE INDEX IF NOT EXISTS idx_redemptions_purchase_id ON redemptions(purchase_id);

-- Create index on user_id for user's redemption history
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON redemptions(user_id);

-- Create index on status for filtering pending redemptions
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status) WHERE status = 'pending';

-- Create index on expires_at for cleanup of expired redemptions
CREATE INDEX IF NOT EXISTS idx_redemptions_expires_at ON redemptions(expires_at);

-- Create index on served_by for bartender queries
CREATE INDEX IF NOT EXISTS idx_redemptions_served_by ON redemptions(served_by) WHERE served_by IS NOT NULL;

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_redemptions_user_status ON redemptions(user_id, status);

COMMENT ON TABLE redemptions IS 'Peg redemption requests from customers';
COMMENT ON COLUMN redemptions.user_id IS 'Clerk user ID (string format)';
COMMENT ON COLUMN redemptions.served_by IS 'Clerk user ID of bartender who served the peg';
COMMENT ON COLUMN redemptions.peg_size_ml IS 'Size of peg requested: 30, 45, or 60 milliliters';
COMMENT ON COLUMN redemptions.redemption_token IS 'Unique token for QR code scanning';
COMMENT ON COLUMN redemptions.status IS 'Redemption status: pending (awaiting service), served (completed), expired';
COMMENT ON COLUMN redemptions.expires_at IS 'QR code expiration time (24 hours from creation)';
