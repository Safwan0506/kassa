#!/bin/bash
set -e

clear
cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║         🚀 KASSA DEPLOYMENT - 100% FREE                        ║
║                   Vercel + Render                              ║
╚════════════════════════════════════════════════════════════════╝

This script will help you deploy Kassa in 3 steps.

EOF

read -p "Press Enter to continue..."

# Step 1: Push to GitHub
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ STEP 1: Push to GitHub                                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Pushing latest changes to GitHub..."
git add .
git commit -m "chore: ready for deployment" 2>/dev/null || echo "Already committed"
git push origin main
echo "✅ Pushed to GitHub!"
echo ""

# Step 2: Deploy Backend on Render
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ STEP 2: Deploy Backend on Render (FREE)                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Opening Render.com..."
echo ""
echo "📋 MANUAL STEPS (takes 5 min):"
echo ""
echo "1. Go to: https://render.com"
echo "2. Sign up with GitHub"
echo "3. Dashboard → New → Blueprint"
echo "4. Connect your repo (kassa)"
echo "5. Select render.yaml"
echo "6. Add JWT_SECRET (generate: openssl rand -base64 32)"
echo "7. Click 'Create Resources'"
echo "8. Wait for deployment (~10 min)"
echo "9. Copy the URL: https://kassa-api.onrender.com"
echo ""
read -p "Press Enter after Render deployment is complete..."

# Ask for backend URL
read -p "Paste your Render backend URL (https://...onrender.com): " BACKEND_URL

if [[ ! $BACKEND_URL =~ ^https:// ]]; then
    echo "❌ Invalid URL format"
    exit 1
fi

echo "✅ Backend URL saved: $BACKEND_URL"
echo ""

# Step 3: Deploy Frontend on Vercel
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║ STEP 3: Deploy Frontend on Vercel (FREE)                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Opening Vercel.com..."
echo ""
echo "📋 MANUAL STEPS (takes 3 min):"
echo ""
echo "1. Go to: https://vercel.com"
echo "2. Sign up with GitHub"
echo "3. New Project → Import"
echo "4. Select your repo (kassa)"
echo "5. Root Directory: apps/web"
echo "6. Add Environment Variable:"
echo "   Name: VITE_API_URL"
echo "   Value: $BACKEND_URL"
echo "7. Click 'Deploy'"
echo "8. Wait for deployment (~2 min)"
echo ""
read -p "Press Enter when Vercel deployment is complete..."

clear
cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║         ✅ DEPLOYMENT COMPLETE!                                ║
║                   100% FREE!                                   ║
╚════════════════════════════════════════════════════════════════╝

🎉 Your app is now live!

🔗 URLs:
   Frontend:  https://kassa.vercel.app
   Backend:   https://kassa-api.onrender.com
   API Docs:  https://kassa-api.onrender.com/swagger-ui.html

🔐 Login credentials:
   Email:     admin@kassa.local
   Password:  Admin123!

💰 Costs:
   Frontend:  $0
   Backend:   $0
   Database:  $0
   ─────────────
   TOTAL:     $0 ✅

⚡ Performance notes:
   • Vercel: Instant, global CDN
   • Render: May have 30s cold start (free tier)

📝 Next steps:
   1. Test login: https://kassa.vercel.app
   2. Try creating products, invoices, etc.
   3. Customize domain (optional)

🚀 Auto-redeploy on push:
   git push origin main

Questions? See DEPLOY_FREE.md

Happy deploying! 🎉

EOF
