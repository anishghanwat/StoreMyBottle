# 🔧 Environment Variables Setup

## 📋 **Railway Backend Environment Variables**

Copy these to your Railway project settings:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=[Railway will auto-populate this]
CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
```

**After getting your Vercel URLs, add:**
```bash
ALLOWED_ORIGINS=https://storemybottle-customer.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app
```

## 📋 **Vercel Frontend Environment Variables**

### **Customer App (frontend-customer)**
```bash
VITE_API_URL=https://your-backend-url.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
VITE_CLERK_AFTER_SIGN_IN_URL=/venues
VITE_CLERK_AFTER_SIGN_UP_URL=/venues
VITE_CLERK_DOMAIN=prime-mako-61.clerk.accounts.dev
VITE_NODE_ENV=production
```

### **Bartender App (frontend-bartender)**
```bash
VITE_API_URL=https://your-backend-url.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_AFTER_SIGN_IN_URL=/pending-payments
VITE_CLERK_DOMAIN=prime-mako-61.clerk.accounts.dev
VITE_NODE_ENV=production
```

### **Admin App (frontend-admin)**
```bash
VITE_API_URL=https://your-backend-url.railway.app
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
VITE_CLERK_DOMAIN=prime-mako-61.clerk.accounts.dev
VITE_NODE_ENV=production
```

## 🔧 **How to Set Environment Variables**

### **Railway**
1. Go to your Railway project
2. Click on your backend service
3. Go to "Variables" tab
4. Add each variable one by one

### **Vercel**
1. Go to your Vercel project
2. Go to "Settings" → "Environment Variables"
3. Add each variable for "Production" environment
4. Redeploy after adding variables

## 🔐 **Security Notes**

- ⚠️ **Never commit .env files** to git
- ✅ **Use test keys for MVP** (as shown above)
- 🔄 **Rotate to production keys** when ready for real users
- 🛡️ **Keep secret keys secure** and never share them

## 📝 **Variable Explanations**

- **DATABASE_URL**: PostgreSQL connection string (Railway auto-populates)
- **CLERK_SECRET_KEY**: Server-side Clerk authentication key
- **CLERK_PUBLISHABLE_KEY**: Client-side Clerk authentication key
- **ALLOWED_ORIGINS**: CORS allowed origins (your frontend URLs)
- **VITE_API_URL**: Backend API URL for frontend apps
- **VITE_CLERK_DOMAIN**: Your Clerk domain for authentication

## 🔄 **After Deployment**

1. **Test all apps** with the new environment variables
2. **Verify authentication** works across all apps
3. **Check CORS** - make sure frontend can call backend
4. **Test database** - ensure migrations ran successfully