# Quick Start Checklist - StoreMyBottle MVP

Follow this checklist in order to get your application running.

## ✅ Step 1: Fix npm Configuration (if needed)

```powershell
# Check if npm is in offline mode
npm config get offline

# If it returns 'true', fix it:
$env:npm_config_offline='false'
```

## ✅ Step 2: Install Backend Dependencies

```powershell
cd d:\StoreMyBottle\backend
npm install express dotenv pg uuid qrcode @clerk/express
npm install -D typescript @types/node @types/express @types/pg @types/uuid @types/qrcode ts-node nodemon
```

## ✅ Step 3: Install Frontend Dependencies

```powershell
# Customer App
cd d:\StoreMyBottle\frontend-customer
npm install

# Bartender App
cd d:\StoreMyBottle\frontend-bartender
npm install

# Admin App
cd d:\StoreMyBottle\frontend-admin
npm install
```

## ✅ Step 4: Install PostgreSQL

- Download from: https://www.postgresql.org/download/windows/
- Install with default settings
- Remember your `postgres` user password

## ✅ Step 5: Create Database

```sql
-- In psql or pgAdmin:
CREATE DATABASE storemybottle;
```

## ✅ Step 6: Run Database Migrations

```powershell
cd d:\StoreMyBottle
psql -U postgres -d storemybottle -f database\migrations\001_create_users.sql
psql -U postgres -d storemybottle -f database\migrations\002_create_venues.sql
psql -U postgres -d storemybottle -f database\migrations\003_create_bottles.sql
psql -U postgres -d storemybottle -f database\migrations\004_create_purchases.sql
psql -U postgres -d storemybottle -f database\migrations\005_create_redemptions.sql
```

## ✅ Step 7: Set Up Clerk Account

1. Go to: https://dashboard.clerk.com/
2. Create free account
3. Create new application
4. Enable: Email/Password, Google OAuth, Phone OTP
5. Copy your **Publishable Key** and **Secret Key**

## ✅ Step 8: Configure Backend Environment

Edit `d:\StoreMyBottle\backend\.env`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/storemybottle
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

## ✅ Step 9: Configure Frontend Environments

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

## ✅ Step 10: Test Backend

```powershell
cd d:\StoreMyBottle\backend
npm run dev
```

In another terminal:
```powershell
curl http://localhost:3000/api/health
```

Expected: `{"status":"ok","db":"connected"}`

## ✅ Step 11: Test Frontend Apps

```powershell
# Customer App
cd d:\StoreMyBottle\frontend-customer
npm run dev

# Bartender App (in new terminal)
cd d:\StoreMyBottle\frontend-bartender
npm run dev

# Admin App (in new terminal)
cd d:\StoreMyBottle\frontend-admin
npm run dev
```

Open each URL in your browser and verify they load.

---

## 🎉 You're Done!

For detailed instructions and troubleshooting, see: `EXTERNAL_SETUP_GUIDE.md`
