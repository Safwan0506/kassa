#!/bin/bash
set -e

echo "🚀 Kassa Deployment Script"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Prerequisites:${NC}"
echo "✓ Vercel CLI installed (npm install -g vercel)"
echo "✓ Railway CLI installed (npm install -g @railway/cli)"
echo "✓ GitHub repo connected"
echo ""

echo -e "${BLUE}Step 1: Push to GitHub${NC}"
git add .
git commit -m "chore: deployment configuration" || echo "No changes to commit"
git push origin main
echo -e "${GREEN}✓ Pushed to GitHub${NC}"
echo ""

echo -e "${BLUE}Step 2: Deploy Backend to Railway${NC}"
echo "Visit: https://railway.app/dashboard"
echo "1. Create new project"
echo "2. Connect GitHub repo"
echo "3. Configure PostgreSQL service"
echo "4. Set environment variables (see DEPLOYMENT.md)"
echo ""

echo -e "${BLUE}Step 3: Deploy Frontend to Vercel${NC}"
echo "Visit: https://vercel.com/dashboard"
echo "1. Import project from GitHub"
echo "2. Select 'apps/web' as root directory"
echo "3. Set VITE_API_URL environment variable"
echo ""

echo -e "${GREEN}✓ Configuration complete!${NC}"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"
