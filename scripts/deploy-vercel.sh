#!/bin/bash
set -e

echo "🚀 Déploiement Vercel - Frontend"
echo "=================================="
echo ""

# Check vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI non installé"
    echo "Installation: npm install -g vercel"
    exit 1
fi

echo "✓ Vercel CLI trouvé"
echo ""

# Build frontend
echo "📦 Building frontend..."
cd apps/web
npm run build
cd ../..

echo ""
echo "🔐 Authentification Vercel (une fois)"
echo "Vercel va ouvrir une page pour l'authentification..."
echo ""

# Deploy
echo "🚀 Déploiement en cours..."
vercel --prod --token=${VERCEL_TOKEN} \
  --name kassa \
  --build-env VITE_API_URL=https://kassa-api.onrender.com

echo ""
echo "✅ Frontend déployé sur Vercel!"
