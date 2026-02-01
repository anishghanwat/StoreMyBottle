# Render Deployment Fix Guide

## Current Issue
- Frontend getting 500 Internal Server Error from backend
- Backend URL: https://storemybottle-backend.onrender.com/api/venues
- Likely cause: Render environment variables not updated with Supabase database

## Step-by-Step Fix

### 1. Update Render Environment Variables
Go to: https://dashboard.render.com

1. Find your "StoreMyBottle Backend" service
2. Click on it
3. Go to "Environment" tab
4. Update/Add these variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:FK9fYdA2DIgxfGWb@db.pazvvqgfrrzggmlqcizi.supabase.co:5432/postgres
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
ALLOWED_ORIGINS=https://storemybottle-backend.onrender.com,https://store-my-bottle-eqs5.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app,https://storemybottle-customer.vercel.app
LOG_LEVEL=info
```

### 2. Trigger Redeploy
- Should automatically redeploy after environment changes
- Or click "Manual Deploy" → "Deploy latest commit"

### 3. Test Health Check
After deployment completes, test:
```
https://storemybottle-backend.onrender.com/api/health
```

Should return:
```json
{
  "message": "StoreMyBottle API is running",
  "status": "ok",
  "services": {
    "database": "connected",
    "clerk": "configured"
  }
}
```

### 4. Test API Endpoints
```
https://storemybottle-backend.onrender.com/api/venues
https://storemybottle-backend.onrender.com/api/bottles
```

### 5. Check Environment (Optional)
If still having issues, you can run this in Render shell:
```bash
node check-env.js
```

## What Should Happen
1. ✅ Build should succeed (TypeScript errors fixed)
2. ✅ Database connection should work (Supabase URL)
3. ✅ API endpoints should return data
4. ✅ Frontend should load venues successfully

## If Still Having Issues

### Check Render Logs
1. Go to Render dashboard
2. Click on your service
3. Go to "Logs" tab
4. Look for database connection errors

### Common Issues
- **DATABASE_URL not updated**: Double-check the Supabase URL is correct
- **SSL issues**: Supabase requires SSL, should work automatically
- **CORS issues**: Make sure ALLOWED_ORIGINS includes your frontend URLs

### Alternative: Manual Database Setup
If database connection works but no data, run in Render shell:
```bash
node setup-production-db.js
```

## Expected Timeline
- Environment update: 2 minutes
- Redeploy: 5-10 minutes
- Testing: 2 minutes
- **Total**: ~15 minutes

The key is updating that DATABASE_URL environment variable in Render!