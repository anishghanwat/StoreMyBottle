# Clerk Setup Instructions

## Current Status

✅ **Code Integration Complete**: All frontend and backend code has been updated to use Clerk
✅ **Frontend Apps**: Customer and Bartender apps have @clerk/react installed
⏳ **Backend**: @clerk/express needs to be installed (npm is currently offline)
⏳ **Admin App**: @clerk/react needs to be installed (npm is currently offline)

## Installation (When npm is online)

### Backend
```powershell
cd d:\StoreMyBottle\backend
npm install @clerk/express
```

### Admin App
```powershell
cd d:\StoreMyBottle\frontend-admin
npm install @clerk/react
```

## Clerk Dashboard Configuration

### Iteration 32: Enable Gmail OAuth ✅ (Manual Configuration Required)

**Steps:**
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Navigate to: **User & Authentication** → **Social Connections**
4. Find **Google** in the list
5. Click **Enable** button
6. Clerk handles OAuth automatically (no Google Cloud Console setup needed)
7. Save changes

**Status**: Code is ready, just needs manual enablement in dashboard

### Iteration 33: Enable Phone OTP ✅ (Manual Configuration Required)

**Steps:**
1. Go to: **User & Authentication** → **Phone**
2. Enable **Phone Number** authentication toggle
3. Configure SMS provider if needed (Clerk provides default)
4. Note: Free tier includes limited SMS (check current limits)
5. Save changes

**Status**: Code is ready, just needs manual enablement in dashboard

### Iteration 34: Enable Email OTP ✅ (Manual Configuration Required - Optional)

**Steps:**
1. Go to: **User & Authentication** → **Email**
2. Enable **Email OTP** toggle if desired
3. This is optional as Email/Password is already enabled by default
4. Save changes

**Status**: Code is ready, optional feature

### Configure Allowed Origins (Required for Testing)

**Steps:**
1. Go to: **Settings** → **Allowed Origins**
2. Add your frontend URLs (one per line):
   ```
   http://localhost:5173
   http://localhost:5174
   http://localhost:5175
   ```
   Or use the actual ports your apps run on
3. Click **Save**

**Note**: This is required for Clerk authentication to work in development

## Environment Variables

All environment variables are already configured:
- ✅ Backend `.env`: `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` set
- ✅ Frontend `.env` files: `VITE_CLERK_PUBLISHABLE_KEY` set

## Testing Authentication

Once packages are installed:

1. **Start backend server**
2. **Start frontend apps**
3. **Test login flows**:
   - Gmail OAuth
   - Phone OTP
   - Email/Password

## Code Integration Status

### Backend ✅
- Auth middleware updated to use Clerk
- Auth routes updated to sync users to database
- User sync service ready

### Frontend ✅
- Customer app: ClerkProvider integrated
- Bartender app: ClerkProvider integrated
- Admin app: ClerkProvider integrated (needs package)

## Next Steps

1. Install `@clerk/express` in backend (when npm is online)
2. Install `@clerk/react` in admin app (when npm is online)
3. Configure Clerk dashboard (Gmail OAuth, Phone OTP)
4. Test authentication flows
5. Test protected endpoints
