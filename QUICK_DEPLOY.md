# Quick Deployment Guide

## Issues Fixed ✅
- UUID package version updated to v10.0.0
- Package-lock.json regenerated
- Vercel configuration improved
- Railway configuration optimized

## Deploy Backend to Vercel (Recommended)

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   - `DATABASE_URL`: `postgresql://postgres:CtPPDVaHwTdWWlFMnRJlUAWjFCCHtcTi@switchyard.proxy.rlwy.net:56691/railway`
   - `CLERK_SECRET_KEY`: `sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6`
   - `CLERK_PUBLISHABLE_KEY`: `pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk`
   - `NODE_ENV`: `production`

4. **Test Backend**:
   ```bash
   curl https://your-backend-url.vercel.app/api/health
   ```

## Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create Web Service
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Environment Variables**: Same as above

## After Backend Deployment

1. **Update Frontend Environment Variables**:
   ```bash
   # In each frontend app (.env.production)
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

2. **Deploy Frontend Apps**:
   ```bash
   cd frontend-customer && vercel --prod
   cd frontend-bartender && vercel --prod
   cd frontend-admin && vercel --prod
   ```

3. **Update CORS in Backend**:
   Add your frontend URLs to `ALLOWED_ORIGINS` environment variable

## Test Everything
- Customer purchase flow
- Bartender QR scanning
- Admin panel functionality

Your StoreMyBottle MVP will be live! 🚀