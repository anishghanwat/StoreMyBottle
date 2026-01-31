# Deploy Backend to Render

## Why Render?
- Perfect for Express.js backends
- No serverless complexity
- Always-on servers (no cold starts)
- Free tier available
- Built-in SSL certificates

## Step-by-Step Deployment

### 1. Go to Render
Visit: https://render.com/

### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub: `anishghanwat/StoreMyBottle`
3. **Important**: Set Root Directory to `backend`

### 3. Configure Service
```
Name: storemybottle-backend
Environment: Node
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm run start
Instance Type: Free
```

### 4. Environment Variables
Add these in Render dashboard:
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:CtPPDVaHwTdWWlFMnRJlUAWjFCCHtcTi@switchyard.proxy.rlwy.net:56691/railway
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
ALLOWED_ORIGINS=https://store-my-bottle-eqs5.vercel.app
LOG_LEVEL=info
```

### 5. Deploy
Click "Create Web Service" - Render will automatically deploy!

### 6. Test
Your backend will be available at:
`https://storemybottle-backend.onrender.com`

Test: `https://storemybottle-backend.onrender.com/api/health`

## Advantages
- ✅ Works exactly like your local development
- ✅ No configuration headaches
- ✅ Persistent database connections
- ✅ Real-time logs and monitoring
- ✅ Automatic SSL certificates