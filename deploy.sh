#!/bin/bash

# Grupo Omniprise Dashboard - Vercel Deployment Script
# Usage: ./deploy.sh

echo "🚀 Deploying Grupo Omniprise Dashboard to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy to production
echo "📤 Deploying to production..."
vercel --prod --yes --scope brs-projects-c425e547

echo ""
echo "✅ Deployment complete!"
echo "🌐 Dashboard: https://corporate-food-dashboard.vercel.app"
echo ""
echo "📊 Deployment Details:"
vercel ls --scope brs-projects-c425e547 | head -5
