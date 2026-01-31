# Retry Railway Deployment

## Issues We Fixed
- ✅ UUID package updated to v10.0.0
- ✅ Package-lock.json regenerated
- ✅ Build process optimized
- ✅ Removed serverless complexity

## Deploy to Railway

### 1. Create New Service
1. Go to https://railway.app/
2. Delete old service (if exists)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select: `anishghanwat/StoreMyBottle`

### 2. Configure Service
- **Root Directory**: `backend` (IMPORTANT!)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

### 3. Environment Variables
Railway should auto-detect from your existing setup:
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:CtPPDVaHwTdWWlFMnRJlUAWjFCCHtcTi@switchyard.proxy.rlwy.net:56691/railway
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
ALLOWED_ORIGINS=https://store-my-bottle-eqs5.vercel.app
```

### 4. Deploy
Railway will automatically deploy from your GitHub repo.

### 5. Test
Your backend will be at: `https://your-service.up.railway.app`

## If DNS Issues Persist
Railway has been having domain resolution problems. If you get DNS errors, use Render instead.