# Render Environment Variables Update

## Steps to Update Render with Supabase Database

### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com
- Find your "StoreMyBottle Backend" service
- Click on it

### 2. Update Environment Variables
Go to "Environment" tab and update/add these variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:FK9fYdA2DIgxfGWb@db.pazvvqgfrrzggmlqcizi.supabase.co:5432/postgres
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
ALLOWED_ORIGINS=https://storemybottle-backend.onrender.com,https://store-my-bottle-eqs5.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app,https://storemybottle-customer.vercel.app
LOG_LEVEL=info
```

### 3. Trigger Redeploy
- The service should automatically redeploy after environment changes
- Or manually trigger redeploy from "Manual Deploy" section

### 4. Run Database Setup (After Deploy)
Once the service is running, you can run the database setup via Render's shell:
```bash
node setup-production-db.js
```

### 5. Test API Endpoints
After successful deployment:
- https://storemybottle-backend.onrender.com/api/venues
- https://storemybottle-backend.onrender.com/api/bottles

## What's Fixed
- ✅ TypeScript CORS errors resolved
- ✅ Supabase database connection working
- ✅ Database tables and sample data ready
- ✅ Code pushed to GitHub

## Next Steps After Render Update
1. Wait for Render redeploy to complete
2. Test backend API endpoints
3. Deploy frontend apps to Vercel
4. Test complete application flow