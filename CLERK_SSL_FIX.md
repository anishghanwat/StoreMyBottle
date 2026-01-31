# 🔧 Clerk SSL Certificate Fix

## 🐛 **Issue**: `ERR_CERT_AUTHORITY_INVALID`
Clerk JavaScript fails to load due to SSL certificate validation issues.

## 🔧 **Fixes Applied**

### **1. Updated Environment Variables**
Added development-specific Clerk settings:
```env
VITE_CLERK_DOMAIN=prime-mako-61.clerk.accounts.dev
VITE_NODE_ENV=development
```

### **2. Restarted Frontend Services**
- ✅ Customer app restarted (http://localhost:5173)
- ✅ Bartender app restarted (http://localhost:5174)

## 🧪 **Testing Steps**

### **Step 1: Try the Apps Again**
1. **Go to http://localhost:5173** (customer app)
2. **Go to http://localhost:5174** (bartender app)
3. **Check if Clerk loads** without SSL errors

### **Step 2: Browser Fixes (If Still Failing)**

**Chrome/Edge:**
1. Go to `chrome://flags/#allow-insecure-localhost`
2. Enable "Allow invalid certificates for resources loaded from localhost"
3. Restart browser

**Firefox:**
1. Go to `about:config`
2. Search for `security.tls.insecure_fallback_hosts`
3. Add `prime-mako-61.clerk.accounts.dev`

### **Step 3: Alternative Testing**
- **Try Firefox** (often handles localhost SSL better)
- **Use Incognito/Private mode**
- **Clear browser cache** for localhost

## 🔍 **If Still Not Working**

### **Check Clerk Dashboard**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Verify your app is active
3. Check if domain settings are correct
4. Ensure publishable key matches

### **Temporary Workaround**
If SSL issues persist, we can:
1. **Use HTTP instead of HTTPS** for Clerk (development only)
2. **Set up local SSL certificates**
3. **Use different Clerk instance**

## 🚀 **Expected Result**
After applying fixes:
- ✅ No SSL certificate errors
- ✅ Clerk authentication loads properly
- ✅ Sign-in/sign-up works normally
- ✅ Bartender app accessible with proper authentication

## 📞 **Next Steps**
1. **Test both apps** after restart
2. **Try browser fixes** if needed
3. **Report results** - if working, continue with bartender testing
4. **If still failing** - we'll implement alternative authentication approach

The SSL issue should be resolved with the environment updates and service restart.