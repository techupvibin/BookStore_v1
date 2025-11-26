#!/bin/bash

echo "🔍 Frontend Build Debug Script"
echo "================================"

echo "📦 Checking Node.js version..."
node --version
npm --version

echo "📁 Checking current directory..."
pwd
ls -la

echo "📋 Checking package.json..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    echo "📦 Dependencies:"
    npm list --depth=0
else
    echo "❌ package.json not found"
    exit 1
fi

echo "🗂️ Checking node_modules..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    echo "📦 Checking react-scripts..."
    npm list react-scripts
else
    echo "❌ node_modules directory not found"
    echo "🔄 Installing dependencies..."
    npm install --legacy-peer-deps --force
fi

echo "🔧 Setting build environment variables..."
export DISABLE_ESLINT_PLUGIN=true
export GENERATE_SOURCEMAP=false
export CI=false
export NODE_ENV=production
export SKIP_PREFLIGHT_CHECK=true
export FAST_REFRESH=false

echo "🚀 Attempting build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output:"
    ls -la build/
else
    echo "❌ Build failed!"
    echo "🔍 Checking for common issues..."
    
    echo "📦 Checking for missing dependencies..."
    npm audit --audit-level=moderate
    
    echo "🧹 Cleaning and reinstalling..."
    rm -rf node_modules package-lock.json
    npm install --legacy-peer-deps --force
    
    echo "🚀 Retrying build..."
    npm run build
fi
