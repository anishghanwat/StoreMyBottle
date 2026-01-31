# 🧪 Customer Purchase Flow Testing Guide

## ✅ **SYSTEM STATUS: READY FOR TESTING**

All services are running:
- ✅ **Backend**: http://localhost:3000 (API responding)
- ✅ **Customer App**: http://localhost:5173 
- ✅ **Bartender App**: http://localhost:5174
- ✅ **Database**: Connected with sample data

## 🧪 **TESTING STEPS**

### **Phase 1: Debug Page API Testing**

1. **Go to http://localhost:5173/debug**
2. **Sign in with Clerk** (if not already signed in)
3. **Test each button in order:**

   **a) Test Get Venues (Public)**
   - ✅ Expected: Success with 2 venues (The Blue Bar, Rooftop Lounge)
   
   **b) Test Get Bottles (Public)**  
   - ✅ Expected: Success with bottles for The Blue Bar
   
   **c) Test Auth Token**
   - ✅ Expected: Shows token with length > 1000
   - ✅ Expected: Token preview starts with "eyJ..."
   
   **d) Test Initiate Purchase (Protected)**
   - ✅ Expected: Success with purchase object + QR code
   - ✅ Expected: Purchase has status "pending"
   - ✅ Expected: QR code data is generated
   
   **e) Test Get My Bottles (Protected)**
   - ✅ Expected: Empty array initially (no paid bottles yet)

### **Phase 2: Complete User Journey Testing**

1. **Go to http://localhost:5173** (main app)
2. **Sign up/Sign in** with Clerk
3. **Browse Venues:**
   - ✅ Expected: See "The Blue Bar" and "Rooftop Lounge"
   - ✅ Expected: Click on venue shows bottles
   
4. **Select Bottle:**
   - ✅ Expected: See bottles with prices (Premium Whiskey, Premium Vodka, etc.)
   - ✅ Expected: "Tap to buy" button works
   
5. **Purchase Flow:**
   - ✅ Expected: Click "Tap to buy" → Redirects to payment page
   - ✅ Expected: Payment page shows QR code
   - ✅ Expected: Shows bottle details and price
   - ✅ Expected: "View My Bottles" button available
   
6. **My Bottles:**
   - ✅ Expected: Shows purchased bottle (after payment confirmed)
   - ✅ Expected: Shows remaining ML and progress bar
   - ✅ Expected: "Redeem Peg" button available

### **Phase 3: Backend Verification**

Check backend logs for:
- ✅ **User sync**: "User synced from Clerk: user_xxxxx"
- ✅ **Purchase creation**: Successful purchase records
- ✅ **QR generation**: QR service working
- ✅ **No errors**: Clean request/response logs

## 🔍 **TROUBLESHOOTING GUIDE**

### **If Debug Tests Fail:**

**Auth Token Test Fails:**
- Check if signed in to Clerk
- Refresh page and try again
- Check browser console for errors

**Purchase Test Fails:**
- Check backend logs for errors
- Verify user was synced to database
- Check if bottle ID exists

**My Bottles Test Fails:**
- Normal if no purchases made yet
- Should work after successful purchase

### **If User Journey Fails:**

**Venues Don't Load:**
- Check backend is running (http://localhost:3000/api/venues)
- Check browser network tab for API errors

**Purchase Fails:**
- Check authentication status
- Verify backend user sync
- Check browser console for errors

**QR Code Doesn't Show:**
- Check if QR libraries are installed
- Verify purchase was created successfully
- Check browser console for QR generation errors

## 📊 **SUCCESS CRITERIA**

### **✅ Phase 1 Success (Debug Page):**
```json
{
  "venues": { "success": true, "data": [2 venues] },
  "bottles": { "success": true, "data": [bottles array] },
  "auth-test": { "hasToken": true, "tokenLength": 1500+ },
  "purchase": { "success": true, "data": { "purchase": {...}, "qrCode": {...} } }
}
```

### **✅ Phase 2 Success (User Journey):**
- User can browse venues ✅
- User can select bottles ✅  
- User can initiate purchase ✅
- QR code displays correctly ✅
- My Bottles shows purchases ✅

### **✅ Phase 3 Success (Backend):**
- No authentication errors ✅
- User sync working ✅
- Purchase creation working ✅
- QR generation working ✅

## 🚀 **NEXT STEPS AFTER TESTING**

### **If All Tests Pass:**
- ✅ Customer flow is complete
- ✅ Move to bartender app testing
- ✅ Test complete redemption cycle

### **If Tests Fail:**
- 🔧 Debug specific failures
- 🔧 Fix identified issues
- 🔧 Re-test until passing

## 📝 **TESTING CHECKLIST**

- [ ] Debug page - All API tests pass
- [ ] User journey - Complete flow works
- [ ] QR codes - Generate and display correctly
- [ ] Authentication - No 401/403 errors
- [ ] User sync - Backend creates users automatically
- [ ] Purchase creation - Database records created
- [ ] My Bottles - Shows user's purchases

**Ready to test! Start with the Debug page at http://localhost:5173/debug**