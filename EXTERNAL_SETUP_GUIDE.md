# External Setup Guide - StoreMyBottle MVP

This guide covers all the external setup steps needed to get the application running.

## Table of Contents

1. [Install Dependencies](#1-install-dependencies)
2. [Set Up PostgreSQL Database](#2-set-up-postgresql-database)
3. [Configure Clerk Authentication](#3-configure-clerk-authentication)
4. [Configure Environment Variables](#4-configure-environment-variables)
5. [Run Database Migrations](#5-run-database-migrations)
6. [Test the Setup](#6-test-the-setup)

---

## 1. Install Dependencies

### Prerequisites Check

First, ensure npm is not in offline mode:

**PowerShell:**
```powershell
# Check current status
npm config get offline

# If it returns 'true', set to false for this session:
$env:npm_config_offline='false'

# Or set globally (may require admin):
npm config set offline false
```

### Backend Dependencies

```powershell
cd d:\StoreMyBottle\backend

# Install production dependencies
npm install express dotenv pg uuid qrcode @clerk/express

# Install development dependencies
npm install -D typescript @types/node @types/express @types/pg @types/uuid @types/qrcode ts-node nodemon

# Verify installation
npm run type-check
```

### Frontend Dependencies

**Customer App:**
```powershell
cd d:\StoreMyBottle\frontend-customer
npm install
```

**Bartender App:**
```powershell
cd d:\StoreMyBottle\frontend-bartender
npm install
```

**Admin App:**
```powershell
cd d:\StoreMyBottle\frontend-admin
npm install
# Note: This will also install tailwindcss-animate which was added to package.json
```

---

## 2. Set Up PostgreSQL Database

### Install PostgreSQL (if not already installed)

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

### Create Database

Open **psql** (Command Line) or **pgAdmin** (GUI) and run:

```sql
CREATE DATABASE storemybottle;
```

**Using psql command line:**
```powershell
# Connect to PostgreSQL (enter password when prompted)
psql -U postgres

# Then run:
CREATE DATABASE storemybottle;

# Exit psql
\q
```

---

## 3. Configure Clerk Authentication

### Option A: Using Clerk MCP Server (Recommended)

If you have the Clerk MCP server available, use it to streamline setup.

### Option B: Manual Setup

1. **Create Clerk Account**
   - Go to: https://dashboard.clerk.com/
   - Sign up for a free account (10,000 MAU free tier)

2. **Create New Application**
   - Click "Create Application"
   - Name it: `StoreMyBottle` (or any name)
   - Choose authentication methods:
     - ✅ Email/Password (enabled by default)
     - ✅ Google OAuth (for Gmail login)
     - ✅ Phone Number (for Phone OTP)
     - ✅ Email OTP (optional)

3. **Get Your Keys**
   - Go to: **API Keys** section
   - Copy:
     - **Publishable Key** → You'll need this for frontend `.env` files
     - **Secret Key** → You'll need this for backend `.env` file

4. **Configure Allowed Origins**
   - Go to: **Settings** → **Allowed Origins**
   - Add your frontend URLs:
     - `http://localhost:5173` (Customer app - Vite default)
     - `http://localhost:5174` (Bartender app - if different port)
     - `http://localhost:5175` (Admin app - if different port)
   - Or use the port numbers your apps actually run on

5. **Enable Gmail OAuth** (if not already enabled)
   - Go to: **User & Authentication** → **Social Connections**
   - Enable "Google"
   - Clerk handles OAuth automatically (no Google Cloud Console setup needed)

6. **Enable Phone OTP** (if not already enabled)
   - Go to: **User & Authentication** → **Phone**
   - Enable Phone Number authentication
   - Note: Free tier includes limited SMS (check current limits)

---

## 4. Configure Environment Variables

### Backend Environment Variables

Edit `d:\StoreMyBottle\backend\.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/storemybottle
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Replace:**
- `YOUR_PASSWORD` with your PostgreSQL password
- `sk_test_...` with your Clerk Secret Key
- `pk_test_...` with your Clerk Publishable Key

### Frontend Environment Variables

**Customer App** - Create `d:\StoreMyBottle\frontend-customer\.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Bartender App** - Create `d:\StoreMyBottle\frontend-bartender\.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Admin App** - Create `d:\StoreMyBottle\frontend-admin\.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Note:** Use the same Clerk Publishable Key in all frontend apps.

---

## 5. Run Database Migrations

Run migrations in order using **psql**:

```powershell
# Navigate to project root
cd d:\StoreMyBottle

# Run each migration (enter PostgreSQL password when prompted)
psql -U postgres -d storemybottle -f database\migrations\001_create_users.sql
psql -U postgres -d storemybottle -f database\migrations\002_create_venues.sql
psql -U postgres -d storemybottle -f database\migrations\003_create_bottles.sql
psql -U postgres -d storemybottle -f database\migrations\004_create_purchases.sql
psql -U postgres -d storemybottle -f database\migrations\005_create_redemptions.sql
```

**Alternative: Using pgAdmin**
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on `storemybottle` database → **Query Tool**
4. Open each migration file and execute it

**Verify Migrations:**
```sql
-- Connect to database
psql -U postgres -d storemybottle

-- List all tables
\dt

-- You should see:
-- users
-- venues
-- bottles
-- purchases
-- redemptions
```

---

## 6. Test the Setup

### Test Backend

1. **Start the backend server:**
   ```powershell
   cd d:\StoreMyBottle\backend
   npm run dev
   ```

2. **Test health endpoint:**
   ```powershell
   curl http://localhost:3000/api/health
   ```
   
   Expected response:
   ```json
   {
     "status": "ok",
     "db": "connected"
   }
   ```

3. **Test basic endpoint:**
   ```powershell
   curl http://localhost:3000
   ```
   
   Expected response:
   ```json
   {
     "message": "StoreMyBottle API is running",
     "status": "ok"
   }
   ```

### Test Frontend Apps

**Customer App:**
```powershell
cd d:\StoreMyBottle\frontend-customer
npm run dev
```
- Open browser to the URL shown (usually `http://localhost:5173`)
- You should see the app load

**Bartender App:**
```powershell
cd d:\StoreMyBottle\frontend-bartender
npm run dev
```
- Open browser to the URL shown
- You should see the app load

**Admin App:**
```powershell
cd d:\StoreMyBottle\frontend-admin
npm run dev
```
- Open browser to the URL shown
- You should see the app load

### Test Database Connection

```powershell
# Test venues endpoint (should return empty array if no data)
curl http://localhost:3000/api/venues

# Expected: []
```

---

## Troubleshooting

### npm Install Fails

**Issue:** `npm error code ENOTCACHED` or network errors

**Solutions:**
1. Check npm offline mode: `npm config get offline` (should be `false`)
2. Clear npm cache: `npm cache clean --force`
3. Check internet connection
4. Try using a different network/VPN if behind corporate firewall

### PostgreSQL Connection Fails

**Issue:** `Error: connect ECONNREFUSED` or authentication errors

**Solutions:**
1. Verify PostgreSQL is running:
   ```powershell
   # Check if PostgreSQL service is running
   Get-Service -Name postgresql*
   ```
2. Verify DATABASE_URL format:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```
3. Check PostgreSQL is listening on port 5432
4. Verify username and password are correct

### Clerk Authentication Not Working

**Issue:** Frontend shows Clerk errors or authentication fails

**Solutions:**
1. Verify Clerk keys are correct in `.env` files
2. Check Allowed Origins in Clerk dashboard match your frontend URLs
3. Ensure `@clerk/react` is installed in frontend apps
4. Check browser console for specific error messages
5. Verify ClerkProvider is uncommented in frontend App.tsx files

### Database Migrations Fail

**Issue:** Migration errors or tables not created

**Solutions:**
1. Verify you're connected to the correct database
2. Check migration files are in correct order (001, 002, 003, etc.)
3. Some migrations use `IF NOT EXISTS` - safe to re-run
4. Check PostgreSQL logs for specific error messages

---

## Next Steps After Setup

Once everything is set up and tested:

1. **Seed Test Data** (optional):
   - Create some test venues and bottles for testing
   - You can do this via the Admin app once it's working

2. **Test Authentication Flow:**
   - Try logging in with Gmail OAuth
   - Try logging in with Phone OTP
   - Verify user is created in database

3. **Test Full Flow:**
   - Customer selects venue → selects bottle → creates account → makes payment
   - Bartender marks payment as paid
   - Customer sees bottle in "My Bottles"
   - Customer requests redemption → generates QR code
   - Bartender scans QR code → serves peg

4. **Continue Development:**
   - Follow the plan for remaining iterations
   - Test each feature as you build it

---

## Quick Reference Checklist

- [ ] npm offline mode disabled
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed (all 3 apps)
- [ ] PostgreSQL installed and running
- [ ] Database `storemybottle` created
- [ ] All 5 migrations run successfully
- [ ] Clerk account created
- [ ] Clerk keys obtained
- [ ] Backend `.env` configured
- [ ] Frontend `.env` files created (all 3 apps)
- [ ] Backend server starts without errors
- [ ] Health endpoint returns `"db": "connected"`
- [ ] All frontend apps start without errors
- [ ] Can access frontend apps in browser

---

## Support

If you encounter issues not covered here:

1. Check the error messages carefully
2. Review the relevant setup files:
   - `backend/SETUP.md`
   - `database/README.md`
   - `COMPLETE_ITERATION_STATUS.md`
3. Verify all environment variables are set correctly
4. Check that all services (PostgreSQL, backend) are running

Good luck! 🚀
