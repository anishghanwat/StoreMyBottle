# Manual Deployment Checklist

## ✅ Pre-Deployment
- [x] Code pushed to GitHub
- [x] vercel.json configured correctly
- [x] package.json has postinstall build script
- [x] TypeScript builds locally without errors

## 🔧 Vercel Dashboard Setup
- [ ] Environment variables added (see VERCEL_ENV_VARS.md)
- [ ] Project settings verified (see VERCEL_PROJECT_SETTINGS.md)
- [ ] Node.js version set to 18.x or latest
- [ ] Build command set to `npm run build`

## 🚀 Deployment
- [ ] Triggered manual redeploy
- [ ] Selected "Use existing Build Cache: No"
- [ ] Deployment completed successfully
- [ ] No build errors in logs

## 🧪 Testing
- [ ] Health endpoint responds: `/api/health`
- [ ] Venues endpoint responds: `/api/venues`
- [ ] CORS working for frontend domains
- [ ] Database connection successful
- [ ] No 404 errors on API routes

## 🔄 If Issues Found
- [ ] Check Vercel function logs
- [ ] Verify environment variables
- [ ] Check build logs for errors
- [ ] Test database connectivity
- [ ] Update CORS settings if needed

## ✅ Success Criteria
- [ ] Backend API responding on Vercel URL
- [ ] All endpoints working correctly
- [ ] Database queries successful
- [ ] Ready to update frontend URLs

## Next Steps After Backend Success
1. Update frontend environment variables with new backend URL
2. Deploy frontend apps to Vercel
3. Test complete user flows
4. Your MVP is live! 🎉