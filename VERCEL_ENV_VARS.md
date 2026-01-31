# Vercel Environment Variables

## Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Find your project: `store-my-bottle-mi7j` or similar
3. Go to Settings → Environment Variables

## Add These Variables:

### Production Environment Variables
```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:CtPPDVaHwTdWWlFMnRJlUAWjFCCHtcTi@switchyard.proxy.rlwy.net:56691/railway
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
ALLOWED_ORIGINS=https://store-my-bottle-eqs5.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app
LOG_LEVEL=info
```

## Important Notes:
- Set Environment to: **Production**
- Make sure each variable is on a separate line
- No quotes needed around values
- Click "Save" after adding each variable

## After Adding Variables:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Select "Use existing Build Cache: No"
4. Click "Redeploy"

This will trigger a fresh deployment with your environment variables.