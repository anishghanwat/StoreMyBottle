-- Migration: Create purchases table
-- Run this migration after 003_create_bottles.sql

CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bottle_id UUID NOT NULL REFERENCES bottles(id) ON DELETE RESTRICT,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
    payment_qr_code TEXT, -- QR code data for offline payment (should be encrypted)
    remaining_ml INTEGER NOT NULL DEFAULT 0, -- Starts at 0, set to bottle.total_ml when paid
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster user queries
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);

-- Create index on bottle_id for bottle queries
CREATE INDEX IF NOT EXISTS idx_purchases_bottle_id ON purchases(bottle_id);

-- Create index on payment_status for filtering pending payments
CREATE INDEX IF NOT EXISTS idx_purchases_payment_status ON purchases(payment_status) WHERE payment_status = 'pending';

-- Create index on venue_id for bartender queries
CREATE INDEX IF NOT EXISTS idx_purchases_venue_id ON purchases(venue_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_purchases_user_status ON purchases(user_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_purchases_venue_status ON purchases(venue_id, payment_status);

COMMENT ON TABLE purchases IS 'Bottle purchases by customers';
COMMENT ON COLUMN purchases.user_id IS 'Clerk user ID (string format)';
COMMENT ON COLUMN purchases.payment_status IS 'Payment status: pending (awaiting payment), paid (payment confirmed), cancelled';
COMMENT ON COLUMN purchases.payment_qr_code IS 'QR code data for offline payment (should be encrypted in production)';
COMMENT ON COLUMN purchases.remaining_ml IS 'Remaining milliliters available for redemption';
COMMENT ON COLUMN purchases.payment_qr_code IS 'QR code data for offline payment confirmation';
COMMENT ON COLUMN purchases.remaining_ml IS 'Remaining milliliters in the bottle (starts at 0, set to bottle.total_ml when paid)';
COMMENT ON COLUMN purchases.paid_at IS 'Timestamp when payment was confirmed by bartender';
