# End-to-End Testing Guide with Real Authentication

## 🧪 **TESTING OVERVIEW**

This guide will walk you through testing the complete StoreMyBottle system with real Clerk authentication enabled.

**Testing URLs:**
- **Customer App**: http://localhost:5173
- **Bartender App**: http://localhost:5174
- **Backend API**: http://localhost:3000

---

## 🔐 **STEP 1: SET UP TEST USERS**

### **Create Customer Test User**
1. Go to **http://localhost:5173**
2. You should see a sign-in page (not the venues page)
3. Click **"Sign Up"** or **"Create Account"**
4. Create a test customer account:
   - Email: `customer@test.com`
   - Password: `TestPassword123!`
5. Complete the sign-up process
6. ✅ **Expected**: Customer role should be automatically assigned
7. You should be redirected to `/venues` after successful sign-up

### **Create Bartender Test User**
1. Go to **http://localhost:5174**
2. You should see a sign-in page (not the pending payments page)
3. Click **"Sign Up"** or **"Create Account"**
4. Create a test bartender account:
   - Email: `bartender@test.com`
   - Password: `TestPassword123!`
5. Complete the sign-up process
6. ✅ **Expected**: Bartender role should be automatically assigned
7. You should be redirected to `/pending-payments` after successful sign-up

### **Verify Automatic Role Assignment**
1. Check browser console logs during sign-up
2. ✅ **Expected**: Should see "Setting [customer/bartender] role for new user..."
3. ✅ **Expected**: Should see "✅ [Customer/Bartender] role set successfully"
4. **Note**: Manual role setup in Clerk Dashboard is no longer required!

---

## 🧪 **STEP 2: TEST CUSTOMER FLOW**

### **Test 1: Authentication & Venue Access**
1. Go to **http://localhost:5173**
2. ✅ **Expected**: Should show sign-in page (not venues directly)
3. Sign in with customer account
4. ✅ **Expected**: Should redirect to venues page after sign-in
5. ✅ **Expected**: Should see "My Bottles" and "Debug" buttons in header

### **Test 2: Purchase Flow**
1. Click on a venue (e.g., "di mora")
2. ✅ **Expected**: Should show bottles for that venue
3. Click "Tap to buy" on a bottle
4. ✅ **Expected**: Should create purchase and show payment QR page
5. ✅ **Expected**: Should see QR code and payment instructions
6. ✅ **Expected**: Payment status should show "pending"

### **Test 3: My Bottles Access**
1. Click "View My Bottles" button on payment page
2. ✅ **Expected**: Should show empty bottles list (no paid bottles yet)
3. Or go back to venues and click "My Bottles" button
4. ✅ **Expected**: Should show "You don't have any bottles yet" message

---

## 🧪 **STEP 3: TEST BARTENDER FLOW**

### **Test 4: Bartender Authentication**
1. Go to **http://localhost:5174**
2. ✅ **Expected**: Should show sign-in page
3. Sign in with bartender account
4. ✅ **Expected**: Should redirect to pending payments page
5. ✅ **Expected**: Should see pending payments from customer purchases

### **Test 5: Payment Confirmation**
1. Should see pending payment from customer's purchase
2. ✅ **Expected**: Shows bottle name, venue, customer info
3. Click "✓ Mark as Paid (Payment Received)"
4. ✅ **Expected**: Payment should disappear from pending list
5. ✅ **Expected**: Should show success feedback

### **Test 6: QR Scanning Access**
1. Click "Scan QR" button
2. ✅ **Expected**: Should show camera interface
3. ✅ **Expected**: Should request camera permissions
4. Click "Start Camera"
5. ✅ **Expected**: Should activate camera for QR scanning

---

## 🧪 **STEP 4: TEST COMPLETE REDEMPTION FLOW**

### **Test 7: Customer Bottle Access After Payment**
1. Go back to customer app: **http://localhost:5173**
2. Click "My Bottles" button
3. ✅ **Expected**: Should now show the paid bottle
4. ✅ **Expected**: Should show remaining ML and progress bar
5. ✅ **Expected**: Should show "Redeem Peg" button

### **Test 8: Redemption QR Generation**
1. Click "Redeem Peg" on a bottle
2. ✅ **Expected**: Should show peg size selection (30ml, 45ml, 60ml)
3. Select a peg size (e.g., 45ml)
4. Click "Get QR Code"
5. ✅ **Expected**: Should generate redemption QR code
6. ✅ **Expected**: Should show QR code with instructions

### **Test 9: QR Code Scanning**
1. Go to bartender app: **http://localhost:5174**
2. Click "Scan QR"
3. Click "Start Camera"
4. Scan the redemption QR code from customer app
5. ✅ **Expected**: Should successfully scan and serve the peg
6. ✅ **Expected**: Should show success message with ML amount
7. ✅ **Expected**: Should deduct ML from customer's bottle

---

## 🧪 **STEP 5: TEST AUTOMATIC ROLE ASSIGNMENT**

### **Test 10: Customer Role Auto-Assignment**
1. Create a new customer account at **http://localhost:5173**
2. ✅ **Expected**: Should automatically get 'customer' role
3. Check browser console for role assignment logs
4. ✅ **Expected**: Should see "✅ Customer role set successfully"

### **Test 11: Bartender Role Auto-Assignment**
1. Create a new bartender account at **http://localhost:5174**
2. ✅ **Expected**: Should automatically get 'bartender' role
3. Check browser console for role assignment logs
4. ✅ **Expected**: Should see "✅ Bartender role set successfully"

### **Test 12: Role-Based Access Control**
1. As customer, try to access: **http://localhost:5174**
2. ✅ **Expected**: Should be able to sign in but get permission errors
3. As bartender, try to access customer features
4. ✅ **Expected**: Should have appropriate access controls

---

## 🧪 **STEP 6: TEST ROLE-BASED ACCESS CONTROL**

---

## 🚨 **EXPECTED RESULTS SUMMARY**

### **✅ Authentication Working:**
- Sign-in required for all protected pages
- Proper redirects after authentication
- Role-based access control enforced

### **✅ Customer Flow Working:**
- Venue browsing → Bottle selection → Purchase → Payment QR
- My Bottles access after payment confirmation
- Redemption QR generation

### **✅ Bartender Flow Working:**
- Pending payments view
- Payment confirmation
- QR code scanning and redemption processing

### **✅ Security Working:**
- API endpoints protected
- Role-based permissions enforced
- Proper error handling for unauthorized access

---

## 🐛 **TROUBLESHOOTING**

### **If Sign-In Doesn't Work:**
- Check Clerk publishable key in .env files
- Verify Clerk app configuration
- Check browser console for errors

### **If Role Access Fails:**
- Verify role is set in Clerk public metadata
- Restart backend after role changes
- Check backend logs for role sync errors

### **If QR Codes Don't Work:**
- Check camera permissions
- Verify QR code generation in customer app
- Test with different browsers

---

## 📊 **TESTING CHECKLIST**

- [ ] Customer sign-up and sign-in
- [ ] Bartender sign-up and sign-in  
- [ ] **Automatic role assignment** (customer and bartender)
- [ ] Venue and bottle browsing
- [ ] Purchase initiation and QR generation
- [ ] Payment confirmation by bartender
- [ ] My Bottles access with paid bottles
- [ ] Redemption QR generation
- [ ] QR code scanning and ML deduction
- [ ] Role-based access control
- [ ] API security verification

---

## 🎉 **SUCCESS CRITERIA**

The system passes end-to-end testing when:
1. ✅ All authentication flows work correctly
2. ✅ **Automatic role assignment works for both apps**
3. ✅ Role-based access control is enforced
4. ✅ Complete purchase flow works end-to-end
5. ✅ QR code generation and scanning work
6. ✅ ML tracking and deduction work correctly
7. ✅ All security measures are active

**Ready for production deployment when all tests pass!** 🚀