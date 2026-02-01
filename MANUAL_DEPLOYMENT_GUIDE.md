# Manual Deployment Guide - StoreMyBottle MVP

## ✅ Current Status
- **Backend**: ✅ Deployed and working at `https://storemybottle-backend.onrender.com`
- **Database**: ✅ UUID schema working with Render PostgreSQL
- **Schema Fixes**: ✅ Committed and pushed to GitHub (commit: fb5ea0e)
- **Frontend**: ⏳ Ready for manual deployment

## 🚀 Manual Deployment Steps

### 1. Deploy Customer App
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your "store-my-bottle" project
3. Click "Deployments" tab
4. Click "Deploy" button (or "Redeploy" if available)
5. Select latest commit: `fb5ea0e - Fix frontend schema compatibility`
6. Wait for deployment to complete

### 2. Deploy Bartender App
1. In Vercel Dashboard, look for "store-my-bottle-bartender" project
2. If not exists, click "New Project" → Import from GitHub
3. Select `frontend-bartender` folder
4. Deploy with latest commit

### 3. Deploy Admin App
1. In Vercel Dashboard, look for "store-my-bottle-admin" project
2. If not exists, click "New Project" → Import from GitHub
3. Select `frontend-admin` folder
4. Deploy with latest commit

## 🔧 Environment Variables (if needed)
Make sure these are set in Vercel for each frontend app:

### Customer App
```
VITE_API_URL=https://storemybottle-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFr...
```

### Bartender App
```
VITE_API_URL=https://storemybottle-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFy...
BYPASS_AUTH=true
```

### Admin App
```
VITE_API_URL=https://storemybottle-backend.onrender.com
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFy...
BYPASS_AUTH=true
```

## 🎯 What the Schema Fix Resolves

### Before (Broken)
```javascript
// Frontend expected direct array
bottles.map(bottle => ...)  // ❌ TypeError: e.map is not a function

// Old schema fields
bottle.bottle_name  // ❌ undefined
bottle.remaining_ml // ❌ undefined
```

### After (Fixed)
```javascript
// Frontend now handles structured response
response.data.map(bottle => ...)  // ✅ Works correctly

// New schema fields
bottle.brand + ' ' + bottle.type  // ✅ "Johnnie Walker Black Label"
bottle.pegs_remaining            // ✅ 8
```

## 🧪 Testing After Deployment

### 1. Customer Flow Test
1. Go to deployed customer app URL
2. Login with Clerk
3. Select venue → Should load bottles
4. Select bottle → Should show purchase page
5. Go to "My Bottles" → Should show "No bottles yet" (no more errors!)

### 2. Backend API Test
Test the fixed API directly:
```bash
curl "https://storemybottle-backend.onrender.com/api/redemptions/my-bottles" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Expected response:
```json
{
  "data": [],
  "message": "User bottles retrieved successfully"
}
```

## 🎉 MVP Ready Checklist

After manual deployment:
- [ ] Customer app loads without errors
- [ ] Venue selection works
- [ ] Bottle selection works
- [ ] My Bottles page shows "No bottles yet" (not errors)
- [ ] Purchase flow works end-to-end
- [ ] Bartender app deploys successfully
- [ ] Admin app deploys successfully

## 🚀 Expected Deployment URLs
- **Customer**: `https://store-my-bottle-users.vercel.app`
- **Bartender**: `https://store-my-bottle-bartender.vercel.app`
- **Admin**: `https://store-my-bottle-admin.vercel.app`
- **Backend**: `https://storemybottle-backend.onrender.com` ✅

Once deployed, your MVP will be ready for market testing!