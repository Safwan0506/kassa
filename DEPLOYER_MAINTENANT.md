# 🚀 DÉPLOYER KASSA MAINTENANT (10 min)

## Étape 1: Backend sur Render ⚙️ (5 min)

### 1. Ouvrir Render
👉 https://render.com

### 2. Sign up avec GitHub
- Cliquer "Sign Up"
- GitHub → Autoriser Render

### 3. Créer Blueprint
- Dashboard → **New** → **Blueprint**
- Choisir votre repo: `kassa`

### 4. Configurer
- Render détecte automatiquement `render.yaml`
- Vérifier:
  - ✅ Service: kassa-api (Java)
  - ✅ Database: PostgreSQL

### 5. Variables d'environnement
- Aller à **Environment**
- Ajouter:
  ```
  JWT_SECRET = <générer avec: openssl rand -base64 32>
  ```
  Copier-coller une clé générée!

### 6. Déployer
- Cliquer **Create Resources**
- ⏱️ Attendre ~10 minutes...

### 7. Copier l'URL
Quand c'est fait, tu vois:
```
https://kassa-api.onrender.com
```
**Copie cette URL!** Tu en auras besoin pour Vercel.

---

## Étape 2: Frontend sur Vercel ✨ (3 min)

### 1. Ouvrir Vercel
👉 https://vercel.com

### 2. Sign up avec GitHub
- Cliquer "Continue with GitHub"
- Autoriser Vercel

### 3. Créer projet
- Dashboard → **Add New** → **Project**
- **Import Git Repository**
- Chercher: `kassa`
- Cliquer **Import**

### 4. Configurer build
Vercel devrait auto-détecter:
- ✅ Framework: Vite
- ✅ Root Directory: `apps/web`
- ✅ Build Command: `npm run build`
- ✅ Output: `dist`

### 5. Ajouter variable
- **Environment Variables**
- Ajouter:
  ```
  VITE_API_URL = https://kassa-api.onrender.com
  ```
  (Remplacer avec ton URL Render!)

### 6. Déployer
- Cliquer **Deploy**
- ⏱️ Attendre ~2 minutes...

### 7. C'est fait! 🎉
Une fois déployé:
```
https://kassa.vercel.app
```

---

## 🎉 C'EST PRÊT!

### Accéder à Kassa
👉 https://kassa.vercel.app

### Identifiants de test
```
Email:    admin@kassa.local
Mot de passe: Admin123!
```

### URLs utiles
```
Frontend:      https://kassa.vercel.app
Backend API:   https://kassa-api.onrender.com
API Docs:      https://kassa-api.onrender.com/swagger-ui.html
```

### Coûts
```
Total: $0/mois 🎉
```

---

## ⚠️ Troubleshooting

### Erreur CORS au login?
- S'assurer que `VITE_API_URL` est correct dans Vercel
- Doit être: `https://kassa-api.onrender.com` (avec HTTPS)

### Backend lent (30s)?
- Normal! Free tier Render "cold start"
- Après, c'est rapide

### Build Render échoue?
- Vérifier les logs (Deployments tab)
- Vérifier JWT_SECRET est set

---

## 📝 Redéployer plus tard

Juste push:
```bash
git push origin main
```

Vercel et Render vont auto-redéployer! 🚀

---

**Questions?** Voir [DEPLOY_FREE.md](DEPLOY_FREE.md) pour plus de détails.
