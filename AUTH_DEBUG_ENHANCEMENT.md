# 🔍 Authentication Debug Enhancement

## 🐛 **CURRENT ISSUE**
**401 Unauthorized** on POST `/api/payments/initiate` despite user being signed in

### **Symptoms**
- ✅ User shows as signed in in Debug page
- ✅ User ID and email visible
- ✅ Public endpoints work (venues, bottles)
- ❌ Protected endpoints fail with 401 Unauthorized
- ❌ Clerk role assignment fails with 422

## 🔧 **DEBUG ENHANCEMENTS ADDED**

### **1. Enhanced Auth Token Test**
```typescript
// Before: Basic token check
return { hasToken: !!token, tokenLength: token?.length || 0 };

// After: Detailed token info with logging
console.log('Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
return { 
    hasToken: !!token, 
    tokenLength: token?.length || 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
};
```

### **2. API Token Setup Test**
```typescript
// New test to verify API service token getter
const { setAuthTokenGetter } = await import('../services/api');
const token = await getToken();
setAuthTokenGetter(() => getToken()); // Re-set to ensure current
return { 
    tokenAvailable: !!token,
    tokenSetInAPI: true,
    tokenLength: token?.length || 0
};
```

### **3. Manual Auth Purchase Test**
```typescript
// Direct fetch with manual Authorization header
const token = await getToken();
const response = await fetch('http://localhost:3000/api/payments/initiate', {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ bottle_id: 'e63642bf-bd21-4c89-be0a-e5f130e2deca' })
});
```

## 🧪 **DEBUGGING WORKFLOW**

### **Step 1: Test Auth Token**
- Click "Test Auth Token" button
- Check console for token preview
- Verify token length > 0

### **Step 2: Test API Token Setup**
- Click "Test API Token Setup" button
- Verify token getter is properly set in API service
- Check console logs for token setting

### **Step 3: Test Manual Auth**
- Click "Test Manual Auth Purchase" button
- This bypasses API service and manually includes auth header
- If this works, issue is in API service token handling
- If this fails, issue is in token validity or backend auth

### **Step 4: Compare Results**
- Compare "Test Initiate Purchase (Protected)" vs "Test Manual Auth Purchase"
- If manual works but API service doesn't, token getter issue
- If both fail, backend authentication issue

## 🔍 **POTENTIAL ROOT CAUSES**

### **1. AuthTokenSetup Timing Issue**
- AuthTokenSetup component may not be setting token getter properly
- Token getter may be set before user is fully authenticated

### **2. Token Getter Not Called**
- API service may not be calling authTokenGetter function
- Token may be null when API service tries to get it

### **3. Token Format Issue**
- Token may be in wrong format for backend
- Backend may expect different token structure

### **4. Backend Auth Middleware Issue**
- Clerk getAuth() may not be parsing token correctly
- Token validation may be failing silently

## 📊 **EXPECTED TEST RESULTS**

### **If Authentication is Working**
```json
{
  "auth-test": { "hasToken": true, "tokenLength": 1500, "tokenPreview": "eyJhbGciOiJSUzI1NiI..." },
  "api-token-test": { "tokenAvailable": true, "tokenSetInAPI": true, "tokenLength": 1500 },
  "manual-auth-test": { "success": true, "data": { "purchase": {...}, "qrCode": {...} } },
  "purchase": { "success": true, "data": { "purchase": {...}, "qrCode": {...} } }
}
```

### **If Token Getter Issue**
```json
{
  "auth-test": { "hasToken": true, "tokenLength": 1500, "tokenPreview": "eyJhbGciOiJSUzI1NiI..." },
  "api-token-test": { "tokenAvailable": true, "tokenSetInAPI": true, "tokenLength": 1500 },
  "manual-auth-test": { "success": true, "data": {...} },
  "purchase": { "success": false, "error": "HTTP 401: Unauthorized" }
}
```

### **If Backend Auth Issue**
```json
{
  "auth-test": { "hasToken": true, "tokenLength": 1500, "tokenPreview": "eyJhbGciOiJSUzI1NiI..." },
  "api-token-test": { "tokenAvailable": true, "tokenSetInAPI": true, "tokenLength": 1500 },
  "manual-auth-test": { "success": false, "error": "HTTP 401: Unauthorized" },
  "purchase": { "success": false, "error": "HTTP 401: Unauthorized" }
}
```

## 🚀 **NEXT STEPS**

1. **Run all debug tests** to identify where the authentication chain breaks
2. **Check console logs** for detailed token information
3. **Compare manual vs API service** results to isolate the issue
4. **Fix the identified root cause** (token getter, backend auth, etc.)
5. **Verify purchase flow** works end-to-end

The enhanced debug page now provides comprehensive authentication testing to pinpoint exactly where the auth flow is failing.