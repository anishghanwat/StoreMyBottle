#!/bin/bash

# StoreMyBottle Vercel Deployment Script

echo "🚀 Deploying StoreMyBottle to Vercel..."

# Deploy Backend
echo "📦 Deploying Backend..."
cd backend
npx vercel --prod --confirm
BACKEND_URL=$(npx vercel ls | grep backend | head -1 | awk '{print $2}')
echo "✅ Backend deployed to: https://$BACKEND_URL"

# Deploy Customer App
echo "👤 Deploying Customer App..."
cd ../frontend-customer
# Update environment with new backend URL
echo "VITE_API_URL=https://$BACKEND_URL" > .env.production
npx vercel --prod --confirm
CUSTOMER_URL=$(npx vercel ls | grep customer | head -1 | awk '{print $2}')
echo "✅ Customer App deployed to: https://$CUSTOMER_URL"

# Deploy Bartender App
echo "🍺 Deploying Bartender App..."
cd ../frontend-bartender
echo "VITE_API_URL=https://$BACKEND_URL" > .env.production
npx vercel --prod --confirm
BARTENDER_URL=$(npx vercel ls | grep bartender | head -1 | awk '{print $2}')
echo "✅ Bartender App deployed to: https://$BARTENDER_URL"

# Deploy Admin App
echo "⚙️ Deploying Admin App..."
cd ../frontend-admin
echo "VITE_API_URL=https://$BACKEND_URL" > .env.production
npx vercel --prod --confirm
ADMIN_URL=$(npx vercel ls | grep admin | head -1 | awk '{print $2}')
echo "✅ Admin App deployed to: https://$ADMIN_URL"

echo ""
echo "🎉 Deployment Complete!"
echo "📱 Customer App: https://$CUSTOMER_URL"
echo "🍺 Bartender App: https://$BARTENDER_URL"
echo "⚙️ Admin App: https://$ADMIN_URL"
echo "🔧 Backend API: https://$BACKEND_URL"
echo ""
echo "⚠️ Don't forget to:"
echo "1. Update CORS settings in backend with these URLs"
echo "2. Test all endpoints"
echo "3. Update Clerk redirect URLs"