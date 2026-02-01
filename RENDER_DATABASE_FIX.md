# Render Database Fix Guide

## Current Issue
- Backend deployed to Render: https://storemybottle-backend.onrender.com
- Getting 500 Internal Server Error due to database connection issues
- Railway database authentication failing

## Steps to Fix

### 1. Update Render Environment Variables
Go to Render dashboard → StoreMyBottle Backend → Environment

Update these variables:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:SeVLzeKFggmXhriCkWZCuuxWIxuJLwsD@hopper.proxy.rlwy.net:53413/railway
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
ALLOWED_ORIGINS=https://storemybottle-backend.onrender.com,https://store-my-bottle-eqs5.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app,https://storemybottle-customer.vercel.app
LOG_LEVEL=info
```

### 2. Run Database Migrations on Render
After updating environment variables, trigger a redeploy and then run:
```bash
node run-migrations.js
```

### 3. Test API Endpoints
- GET /api/venues - Should return venues
- GET /api/bottles - Should return bottles
- POST /api/auth/verify - Should verify authentication

## Alternative: Use Different Database
If Railway continues to fail, consider:
1. Create new Railway database
2. Use Render's PostgreSQL addon
3. Use Supabase free tier

## Status
- ✅ Backend code deployed to Render
- ❌ Database connection failing
- ❌ Environment variables need update
- ❌ Database migrations need to run