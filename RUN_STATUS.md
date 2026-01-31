# Run Status - StoreMyBottle

## Clerk package fix (loadClerkUiScript / ETARGET)
All three frontends use **`@clerk/clerk-react@^4.31.1`** (Core 1, 4.x). This avoids the `@clerk/react` 5.x / `@clerk/shared` mismatch (`loadClerkUiScript` not exported). Same API: `ClerkProvider`, `SignIn`, `SignUp`, `useAuth`. After pulling this change, reinstall and restart:
```powershell
cd d:\StoreMyBottle\frontend-customer
Remove-Item -Recurse -Force node_modules; Remove-Item package-lock.json
npm install
npm run dev
```
Repeat for `frontend-bartender` and `frontend-admin` if you use them.

### Backend Clerk (@clerk/express)
The backend uses **`@clerk/express`** for auth. Install and set env:
```powershell
cd d:\StoreMyBottle\backend
npm install
```
In `backend/.env` add (from [Clerk Dashboard → API keys](https://dashboard.clerk.com/~/api-keys)):
- `CLERK_SECRET_KEY=sk_...` (Secret key – required for backend)
- `CLERK_PUBLISHABLE_KEY=pk_...` (optional here; frontends use `VITE_CLERK_PUBLISHABLE_KEY`)
Restart the backend after installing so `/api/payments/pending` and other protected routes work.

### Bartender / Admin role (fix 403 Forbidden)
The backend reads role from the **database** (synced from Clerk). To access bartender routes (e.g. Pending Payments):

1. In [Clerk Dashboard](https://dashboard.clerk.com) → **Users** → select your user → **Public** → **Edit** → add `{ "role": "bartender" }` (valid JSON). **Click Save.**
2. Restart the backend (so role middleware changes apply), then **refresh** the Pending Payments page (F5 or **Retry**). The backend reads role from Clerk’s public metadata and allows access.

**Quick dev bypass:** In `backend/.env` add (use your Clerk user IDs):
```env
ALLOW_BARTENDER_USER_IDS=user_38tTAr60s9wOShjkRCKqrBv0Ndh
ALLOW_ADMIN_USER_IDS=user_38tTAr60s9wOShjkRCKqrBv0Ndh
```
Restart the backend. Those users can access bartender/admin routes without DB/Clerk role. Remove in production.

### Clear browser session (Clerk sign out)
- **In the app:** Use **Sign out** in the UI.  
  - **Bartender:** Pending Payments or Scan QR page → **Sign out** (next to Scan QR / Back).  
  - **Customer:** Select a Venue page → **Sign out** (top right when signed in).
- **Manually:**  
  - Chrome: DevTools (F12) → **Application** → **Storage** → **Clear site data** for `localhost:5173` / `5174` / `5175`.  
  - Or delete cookies for `localhost` and `clerk`-related domains.

### OAuth callback `authorization_invalid` (e.g. clerk.shared.lcl.dev)
If you see **"Unauthorized request"** / **`authorization_invalid`** on the OAuth callback page:

1. **Clerk Dashboard → Paths / Redirect URLs**  
   [Dashboard](https://dashboard.clerk.com) → your application → **Paths** (or **Settings** → **Redirect URLs**). Add every URL where your app runs after sign-in, for example:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5175`
   (and `http://127.0.0.1:5173` etc. if you use that). Save.

2. **Social connection (Google, GitHub, etc.)**  
   If you use “Sign in with Google” (or another provider), in Clerk go to **User & Authentication** → **Social connections** and ensure the provider is configured. In the **provider’s** app (e.g. Google Cloud Console, GitHub OAuth App), set the **Authorized redirect URI** to the exact callback URL Clerk shows (e.g. `https://<your-frontend-api>.clerk.accounts.dev/v1/oauth_callback` or the URL from Clerk’s setup instructions).

3. **Same app and keys**  
   Use one Clerk application and the same publishable/secret keys for all three frontends and the backend. Don’t mix dev/prod or different Clerk apps.

4. **Retry after fixing**  
   Clear site data or use **Sign out**, then sign in again so the OAuth flow runs with the updated redirect and provider settings.

### 404 on `/login/sso-callback`
Clerk redirects to `/login/sso-callback` after SSO (e.g. Google). All three frontends now have a route for `/login/sso-callback` that renders the Login page so Clerk can finish the flow. If you still see 404, restart the dev server.

---

## ✅ Verification Complete

### TypeScript
- **Backend**: ✅ Passes `tsc --noEmit` (one fix applied: `AuthRequest.user` type extended with `role`)
- **Frontend Customer**: ✅ Passes
- **Frontend Bartender**: ✅ Passes
- **Frontend Admin**: Not run (npm cache/offline); use `npx tsc --noEmit` when online

### Backend: **RUNNING** ✅
- **URL**: http://localhost:3000
- **Health**: http://localhost:3000/api/health → `{"status":"ok","db":"connected"}`
- **Process**: Started with `npx ts-node src/app.ts`
- **Note**: Minor experimental warning about `uuid` ES module – safe to ignore.

---

## ⚠️ Frontend Dev Servers

Frontends were started in the background but hit environment limits:

| App        | Status   | Reason |
|-----------|----------|--------|
| Customer  | EPERM    | Vite/esbuild `spawn EPERM` (common on Windows in automated runs) |
| Bartender | EPERM    | Same as customer |
| Admin     | Not found| `vite` not in PATH; use `npx vite` |

**Run the frontends yourself in separate terminals:**

```powershell
# Terminal 1 - Customer app
cd d:\StoreMyBottle\frontend-customer
npm run dev

# Terminal 2 - Bartender app  
cd d:\StoreMyBottle\frontend-bartender
npm run dev

# Terminal 3 - Admin app
cd d:\StoreMyBottle\frontend-admin
npx vite
```

Default Vite ports (if free):
- Customer: http://localhost:5173
- Bartender: http://localhost:5174 (or next free)
- Admin: http://localhost:5175 (or next free)

---

## Quick Test (Backend)

```powershell
# Health
Invoke-WebRequest -Uri http://localhost:3000/api/health -UseBasicParsing | Select -Expand Content

# Venues
Invoke-WebRequest -Uri http://localhost:3000/api/venues -UseBasicParsing | Select -Expand Content
```

Expected: `{"status":"ok","db":"connected"}` and `[]` for venues.

---

## Summary

| Component   | Status   | Action |
|------------|----------|--------|
| Backend    | ✅ Running | None – use http://localhost:3000 |
| TypeScript | ✅ OK     | Backend role type fixed |
| Customer   | ⏳ Manual | Run `npm run dev` in project folder |
| Bartender  | ⏳ Manual | Run `npm run dev` in project folder |
| Admin      | ⏳ Manual | Run `npx vite` in project folder |

**Backend is up and healthy. Start the three frontends in your own terminals to use the full app.**
