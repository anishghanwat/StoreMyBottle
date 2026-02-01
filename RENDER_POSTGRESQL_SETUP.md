# Render PostgreSQL Setup Guide

## Why Render PostgreSQL?
- **Native Integration**: Same datacenter, no network issues
- **Reliable**: No IPv6 connectivity problems
- **Fast**: Internal network connection
- **Free Tier**: 90 days free, then $7/month

## Setup Steps

### 1. Create Render PostgreSQL Database
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Fill in details:
   - **Name**: `storemybottle-db`
   - **Database**: `storemybottle`
   - **User**: `storemybottle_user`
   - **Region**: Same as your backend service
   - **Plan**: Free (90 days)
4. Click "Create Database"

### 2. Get Database Connection Details
After creation, you'll see:
- **Internal Database URL**: `postgresql://storemybottle_user:password@dpg-xxxxx-a/storemybottle`
- **External Database URL**: `postgresql://storemybottle_user:password@dpg-xxxxx-a.oregon-postgres.render.com/storemybottle`

### 3. Update Backend Environment Variables
1. Go to your backend service → Environment
2. Update `DATABASE_URL` with the **Internal Database URL**
3. Save changes (will trigger redeploy)

### 4. Run Database Setup
After redeploy, use Render Shell:
```bash
node setup-production-db.js
```

Or manually run SQL:
```sql
-- Create tables and insert sample data
-- (Use the SQL from setup-production-db.js)
```

### 5. Test API Endpoints
```bash
curl https://storemybottle-backend.onrender.com/api/health
curl https://storemybottle-backend.onrender.com/api/venues
```

## Expected Results
```json
// Health check
{
  "status": "ok",
  "services": {
    "database": "connected"
  }
}

// Venues API
{
  "data": [
    {"id": 1, "name": "The Whiskey Bar"},
    {"id": 2, "name": "Club Paradise"}
  ]
}
```

## Advantages Over Supabase
- ✅ No IPv6 connectivity issues
- ✅ Same datacenter (faster)
- ✅ Native Render integration
- ✅ Reliable for MVP testing

## Timeline
- **Database Creation**: 2-3 minutes
- **Environment Update**: 1 minute
- **Redeploy**: 5-10 minutes
- **Database Setup**: 2 minutes
- **Total**: ~15 minutes

This should resolve all connectivity issues and get your MVP deployed!