@echo off
REM StoreMyBottle Frontend Deployment Script for Windows
echo 🚀 Deploying StoreMyBottle Frontend Apps to Vercel
echo ==================================================

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Deploy Customer App
echo.
echo 📱 Deploying Customer App...
cd frontend-customer
vercel --prod
cd ..

REM Deploy Bartender App
echo.
echo 🍺 Deploying Bartender App...
cd frontend-bartender
vercel --prod
cd ..

REM Deploy Admin App
echo.
echo 👨‍💼 Deploying Admin App...
cd frontend-admin
vercel --prod
cd ..

echo.
echo 🎉 All frontend apps deployed successfully!
echo Check your Vercel dashboard for deployment URLs