# Test Vercel Deployment

## Your Backend URL
Replace with your actual Vercel URL: `https://store-my-bottle-mi7j.vercel.app`

## Test These Endpoints:

### 1. Health Check
```
GET https://your-backend-url.vercel.app/api/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-01T..."
}
```

### 2. Venues List
```
GET https://your-backend-url.vercel.app/api/venues
```
**Expected Response:**
```json
[
  {
    "id": "venue-id",
    "name": "Sample Venue",
    "location": "Sample Location"
  }
]
```

### 3. CORS Test
Open browser console on any website and run:
```javascript
fetch('https://your-backend-url.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

## If Tests Fail:

### 500 Internal Server Error
- Check environment variables are set correctly
- Check Vercel function logs in dashboard

### 404 Not Found
- Verify vercel.json routing configuration
- Check if build completed successfully

### CORS Errors
- Update ALLOWED_ORIGINS environment variable
- Include your frontend URLs

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check if Railway database is accessible

## Debugging:
1. Go to Vercel Dashboard → Functions tab
2. Click on your function to see logs
3. Look for error messages in real-time logs