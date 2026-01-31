#!/bin/bash

# StoreMyBottle Deployment Setup Script
# Run this script to prepare for deployment

echo "🚀 StoreMyBottle Deployment Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 Checking prerequisites..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - StoreMyBottle MVP ready for deployment"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository found"
fi

# Check if node_modules exist
echo "📦 Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "🔧 Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo "✅ Backend dependencies installed"
fi

if [ ! -d "frontend-customer/node_modules" ]; then
    echo "🔧 Installing customer app dependencies..."
    cd frontend-customer && npm install && cd ..
    echo "✅ Customer app dependencies installed"
fi

if [ ! -d "frontend-bartender/node_modules" ]; then
    echo "🔧 Installing bartender app dependencies..."
    cd frontend-bartender && npm install && cd ..
    echo "✅ Bartender app dependencies installed"
fi

if [ ! -d "frontend-admin/node_modules" ]; then
    echo "🔧 Installing admin app dependencies..."
    cd frontend-admin && npm install && cd ..
    echo "✅ Admin app dependencies installed"
fi

# Test builds
echo "🔨 Testing builds..."

echo "  Testing backend build..."
cd backend && npm run build
if [ $? -eq 0 ]; then
    echo "  ✅ Backend build successful"
else
    echo "  ❌ Backend build failed"
    exit 1
fi
cd ..

echo "  Testing frontend builds..."
cd frontend-customer && npm run build
if [ $? -eq 0 ]; then
    echo "  ✅ Customer app build successful"
else
    echo "  ❌ Customer app build failed"
    exit 1
fi
cd ..

cd frontend-bartender && npm run build
if [ $? -eq 0 ]; then
    echo "  ✅ Bartender app build successful"
else
    echo "  ❌ Bartender app build failed"
    exit 1
fi
cd ..

cd frontend-admin && npm run build
if [ $? -eq 0 ]; then
    echo "  ✅ Admin app build successful"
else
    echo "  ❌ Admin app build failed"
    exit 1
fi
cd ..

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy backend to Railway"
echo "3. Deploy frontend apps to Vercel"
echo "4. Configure environment variables"
echo "5. Run database migrations"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"