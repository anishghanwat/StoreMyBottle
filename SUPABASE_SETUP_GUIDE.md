# Supabase Database Setup Guide

## Why Supabase?
- Free PostgreSQL database (500MB, 2 concurrent connections)
- Reliable for MVP testing
- Easy setup and management
- Built-in dashboard

## Setup Steps

### 1. Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Create new project

### 2. Get Database Connection String
1. Go to Project Settings → Database
2. Copy the connection string
3. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

### 3. Update Environment Variables
Replace DATABASE_URL in all environments:

**Backend (.env and .env.production):**
```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres
```

**Render Environment Variables:**
```
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:5432/postgres
```

### 4. Run Database Setup
```bash
node setup-production-db.js
```

## Alternative: Manual Table Creation
If you prefer, you can run SQL directly in Supabase dashboard:

```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Venues table
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bottles table
CREATE TABLE bottles (
    id SERIAL PRIMARY KEY,
    venue_id INTEGER REFERENCES venues(id) ON DELETE CASCADE,
    brand VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    size VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    pegs_total INTEGER DEFAULT 30,
    pegs_remaining INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases table
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    bottle_id INTEGER REFERENCES bottles(id) ON DELETE CASCADE,
    pegs_purchased INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Redemptions table
CREATE TABLE redemptions (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    bottle_id INTEGER REFERENCES bottles(id) ON DELETE CASCADE,
    pegs_redeemed INTEGER NOT NULL,
    redeemed_by TEXT,
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample data
INSERT INTO venues (name, address, phone, email) VALUES
('The Whiskey Bar', '123 Main St, Mumbai', '+91-9876543210', 'info@whiskeybar.com'),
('Club Paradise', '456 Park Ave, Delhi', '+91-9876543211', 'contact@clubparadise.com');

INSERT INTO bottles (venue_id, brand, type, size, price, pegs_total, pegs_remaining) VALUES
(1, 'Royal Challenge', 'Whiskey', '750ml', 2500.00, 30, 30),
(1, 'Blenders Pride', 'Whiskey', '750ml', 2200.00, 30, 30),
(2, 'Grey Goose', 'Vodka', '750ml', 8000.00, 30, 30),
(2, 'Absolut', 'Vodka', '750ml', 4500.00, 30, 30);
```

## Benefits for MVP
- Reliable uptime
- Free tier sufficient for testing
- Easy database management
- Can scale later if needed

## Next Steps After Setup
1. Update Render environment variables
2. Redeploy backend
3. Test API endpoints
4. Deploy frontend apps to Vercel