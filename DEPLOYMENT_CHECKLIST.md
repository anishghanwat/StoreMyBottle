# ✅ StoreMyBottle MVP Deployment Checklist

## 📋 **Pre-Deployment**

### **Code Preparation**
- [ ] All development bypasses disabled
- [ ] Environment variables configured
- [ ] Build scripts working locally
- [ ] Git repository initialized
- [ ] .gitignore configured properly

### **Accounts Setup**
- [ ] GitHub account ready
- [ ] Railway account created (free tier)
- [ ] Vercel account created (free tier)
- [ ] Clerk account configured

## 🚀 **Deployment Steps**

### **Step 1: Push to GitHub**
```bash
# If not already done
git init
git add .
git commit -m "StoreMyBottle MVP ready for deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/storemybottle.git
git branch -M main
git push -u origin main
```
- [ ] Code pushed to GitHub
- [ ] Repository is public or accessible to Railway/Vercel

### **Step 2: Deploy Backend to Railway**
- [ ] Railway project created
- [ ] GitHub repository connected
- [ ] PostgreSQL database added
- [ ] Environment variables set (see ENVIRONMENT_SETUP.md)
- [ ] Backend deployed successfully
- [ ] Health check endpoint responding: `/api/health`
- [ ] Backend URL noted: `https://backend-production-xxxx.up.railway.app`

### **Step 3: Database Setup**
- [ ] Database migrations run:
  ```bash
  DATABASE_URL="your-railway-db-url" node database/run-migrations-production.js
  ```
- [ ] Sample data added:
  ```bash
  DATABASE_URL="your-railway-db-url" node backend/init-sample-data-production.js
  ```
- [ ] Database tables verified in Railway dashboard

### **Step 4: Deploy Frontend Apps to Vercel**

#### **Customer App**
- [ ] Vercel project created
- [ ] GitHub repo connected (root: `frontend-customer`)
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible: `https://storemybottle-customer.vercel.app`

#### **Bartender App**
- [ ] Vercel project created
- [ ] GitHub repo connected (root: `frontend-bartender`)
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible: `https://storemybottle-bartender.vercel.app`

#### **Admin App**
- [ ] Vercel project created
- [ ] GitHub repo connected (root: `frontend-admin`)
- [ ] Environment variables set
- [ ] Build successful
- [ ] App accessible: `https://storemybottle-admin.vercel.app`

### **Step 5: Update CORS Configuration**
- [ ] Railway backend environment updated with frontend URLs:
  ```
  ALLOWED_ORIGINS=https://storemybottle-customer.vercel.app,https://storemybottle-bartender.vercel.app,https://storemybottle-admin.vercel.app
  ```
- [ ] Backend redeployed with new CORS settings

### **Step 6: Configure Clerk for Production**
- [ ] Clerk dashboard accessed
- [ ] Allowed origins updated with all app URLs
- [ ] Authentication tested on all apps

## 🧪 **Testing Checklist**

### **Backend API Testing**
- [ ] Health check: `GET /api/health`
- [ ] Venues endpoint: `GET /api/venues`
- [ ] Authentication working
- [ ] Database queries working

### **Customer App Testing**
- [ ] App loads without errors
- [ ] Sign up/login works
- [ ] Can browse venues
- [ ] Can select bottles
- [ ] QR code generation works
- [ ] Mobile responsive

### **Bartender App Testing**
- [ ] App loads without errors
- [ ] Sign up/login works
- [ ] Role assignment to 'bartender' works
- [ ] Can view pending payments
- [ ] QR scanning works (test with camera)
- [ ] Can mark payments as paid

### **Admin App Testing**
- [ ] App loads without errors
- [ ] Sign up/login works
- [ ] Role assignment to 'admin' works
- [ ] Dashboard shows statistics
- [ ] Can manage venues (CRUD)
- [ ] Can manage bottles (CRUD)
- [ ] Can manage user roles

### **End-to-End Flow Testing**
- [ ] Customer: Sign up → Browse → Purchase → Generate QR
- [ ] Bartender: Sign up → View pending → Mark as paid
- [ ] Admin: Sign up → Manage venues/bottles → View analytics

### **Mobile Testing**
- [ ] All apps work on mobile browsers
- [ ] QR scanning works on mobile
- [ ] Touch interactions work properly
- [ ] Responsive design looks good

## 🎯 **Post-Deployment**

### **Documentation**
- [ ] Update README.md with live URLs
- [ ] Document any deployment issues encountered
- [ ] Create user guide for testing

### **Monitoring**
- [ ] Railway dashboard bookmarked
- [ ] Vercel dashboards bookmarked
- [ ] Error monitoring set up (optional)

### **User Testing Preparation**
- [ ] Test user accounts created
- [ ] Demo data available
- [ ] Feedback collection method ready

## 🚨 **Troubleshooting**

### **Common Issues**
- **CORS errors**: Check ALLOWED_ORIGINS in backend
- **Auth errors**: Verify Clerk configuration and keys
- **Database errors**: Check Railway database connection
- **Build errors**: Verify environment variables

### **Quick Fixes**
- **Redeploy**: Push new commits to trigger redeployment
- **Logs**: Check Railway/Vercel logs for detailed errors
- **Environment**: Double-check all environment variables
- **Cache**: Clear browser cache and try again

## 🎉 **Success Criteria**

Your MVP is successfully deployed when:
- [ ] All 4 services are live and accessible
- [ ] Complete user flow works end-to-end
- [ ] No critical errors in logs
- [ ] Mobile experience is functional
- [ ] Ready for user testing

## 📞 **Support**

If you encounter issues:
1. Check the logs in Railway/Vercel dashboards
2. Verify all environment variables are set correctly
3. Test locally first to isolate deployment issues
4. Refer to platform documentation:
   - [Railway Docs](https://docs.railway.app/)
   - [Vercel Docs](https://vercel.com/docs)
   - [Clerk Docs](https://clerk.com/docs)

---

**🎯 Goal**: Get your StoreMyBottle MVP live for user testing within 2-3 hours!