# Deploy StoreMyBottle Backend to Render

## Why Render?
- More straightforward for Node.js backends
- No configuration conflicts
- Always-on servers (no cold starts)
- Built-in PostgreSQL support

## Step-by-Step Deployment

### 1. Go to Render Dashboard
Visit: https://render.com/

### 2. Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `https://github.com/anishghanwat/StoreMyBottle`

### 3. Configure Service Settings
- **Name**: `storemybottle-backend`
- **Root Directory**: `backend`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Instance Type**: `Free` (for MVP testing)

### 4. Add Environment Variables
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:CtPPDVaHwTdWWlFMnRJlUAWjFCCHtcTi@switchyard.proxy.rlwy.net:56691/railway
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
ALLOWED_ORIGINS=https://store-my-bottle-eqs5.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app
LOG_LEVEL=info
```

### 5. Deploy
Click "Create Web Service" - Render will automatically deploy from your GitHub repo.

### 6. Test Backend
Once deployed, test the health endpoint:
```
https://your-service-name.onrender.com/api/health
```

## Advantages of Render
- ✅ No configuration conflicts
- ✅ Always-on servers
- ✅ Automatic deployments from GitHub
- ✅ Built-in SSL certificates
- ✅ Easy environment variable management

## After Backend Deployment
1. Update frontend apps with new backend URL
2. Deploy frontend apps to Vercel
3. Test complete flow

Your backend will be live at: `https://storemybottle-backend.onrender.com`