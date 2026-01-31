# 🚀 StoreMyBottle MVP Deployment Guide

## 📋 **Prerequisites**
- [ ] GitHub account
- [ ] Railway account (free tier)
- [ ] Vercel account (free tier)
- [ ] Clerk account (for authentication)

## 🎯 **Deployment Steps**

### **Step 1: Push Code to GitHub**
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - StoreMyBottle MVP"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/storemybottle.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy Backend to Railway**

1. **Go to Railway.app** and sign up/login
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select your repository** → Choose `backend` folder
4. **Add PostgreSQL Database**:
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway will create a database and provide connection URL

5. **Set Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=[Railway will auto-populate this]
   CLERK_SECRET_KEY=sk_test_mwtWPkt87sn4ohmFLOqjUVrvsLXayY8g7Uq8F00GF6
   CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
   ALLOWED_ORIGINS=https://storemybottle-customer.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app
   ```

6. **Deploy**: Railway will automatically build and deploy
7. **Note your backend URL**: e.g., `https://backend-production-xxxx.up.railway.app`

### **Step 3: Run Database Migrations**

1. **Connect to Railway Database**:
   - Go to Railway dashboard → Your database service
   - Click "Connect" → Copy connection string
   
2. **Run migrations locally** (pointing to Railway DB):
   ```bash
   cd database
   # Update connection string in run-migrations.js to Railway DB
   node run-migrations.js
   
   # Add sample data
   cd ../backend
   # Update DATABASE_URL in init-sample-data.js to Railway DB
   node init-sample-data.js
   ```

### **Step 4: Deploy Frontend Apps to Vercel**

#### **4.1: Customer App**
1. **Go to Vercel.com** and sign up/login
2. **Import Project** → Select your GitHub repo
3. **Configure**:
   - Framework: Vite
   - Root Directory: `frontend-customer`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
   VITE_CLERK_SIGN_IN_URL=/sign-in
   VITE_CLERK_SIGN_UP_URL=/sign-up
   VITE_CLERK_AFTER_SIGN_IN_URL=/venues
   VITE_CLERK_AFTER_SIGN_UP_URL=/venues
   VITE_CLERK_DOMAIN=prime-mako-61.clerk.accounts.dev
   VITE_NODE_ENV=production
   ```

5. **Deploy**: Vercel will build and deploy
6. **Note your URL**: e.g., `https://storemybottle-customer.vercel.app`

#### **4.2: Bartender App**
1. **Import Project** → Same repo, different root directory
2. **Configure**:
   - Root Directory: `frontend-bartender`
   - Same build settings as customer app

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
   VITE_CLERK_SIGN_IN_URL=/sign-in
   VITE_CLERK_AFTER_SIGN_IN_URL=/pending-payments
   VITE_CLERK_DOMAIN=prime-mako-61.clerk.accounts.dev
   VITE_NODE_ENV=production
   ```

#### **4.3: Admin App**
1. **Import Project** → Same repo, root directory: `frontend-admin`
2. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_cHJpbWUtbWFrby02MS5jbGVyay5hY2NvdW50cy5kZXYk
   VITE_CLERK_SIGN_IN_URL=/sign-in
   VITE_CLERK_AFTER_SIGN_IN_URL=/dashboard
   VITE_CLERK_DOMAIN=prime-mako-61.clerk.accounts.dev
   VITE_NODE_ENV=production
   ```

### **Step 5: Configure Clerk for Production**

1. **Go to Clerk Dashboard**
2. **Update Allowed Origins**:
   - Add your Vercel URLs to allowed origins
   - Add Railway backend URL to allowed origins

3. **Test Authentication**:
   - Try signing up/in on each app
   - Verify role assignment works

### **Step 6: Final Testing**

1. **Test Complete Flow**:
   - [ ] Customer: Sign up → Select venue → Choose bottle → Generate QR
   - [ ] Bartender: Sign up → View pending payments → Mark as paid
   - [ ] Admin: Sign up → Manage venues/bottles/users

2. **Test on Mobile**:
   - [ ] All apps work on mobile browsers
   - [ ] QR scanning works on mobile

## 🎉 **Your MVP URLs**

After deployment, you'll have:
- **Customer App**: `https://storemybottle-customer.vercel.app`
- **Bartender App**: `https://storemybottle-bartender.vercel.app`
- **Admin Panel**: `https://storemybottle-admin.vercel.app`
- **Backend API**: `https://backend-production-xxxx.up.railway.app`

## 💰 **Cost Breakdown**
- **Railway**: $0/month (free tier)
- **Vercel**: $0/month (free tier)
- **Clerk**: $0/month (free tier up to 10k users)
- **Total**: **$0/month** for MVP testing!

## 🔧 **Post-Deployment**

1. **Monitor**: Check Railway/Vercel dashboards for errors
2. **Test**: Get real users to test the flow
3. **Iterate**: Based on user feedback
4. **Scale**: Upgrade to paid tiers when needed

## 🆘 **Troubleshooting**

### **Common Issues**:
- **CORS errors**: Check ALLOWED_ORIGINS in backend
- **Auth errors**: Verify Clerk configuration
- **Database errors**: Check Railway database connection
- **Build errors**: Check environment variables

### **Quick Fixes**:
- **Redeploy**: Push new commits to trigger redeployment
- **Logs**: Check Railway/Vercel logs for errors
- **Environment**: Double-check all environment variables

---

## 🚀 **Ready to Deploy?**

Follow these steps in order, and your StoreMyBottle MVP will be live within 2-3 hours!

**Need help?** Each platform has excellent documentation:
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Clerk Docs](https://clerk.com/docs)