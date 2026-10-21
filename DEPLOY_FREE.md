# 🚀 Déployer Kassa GRATUITEMENT en 10 minutes

**100% GRATUIT** - Vercel (Frontend) + Render (Backend + DB)

---

## **Étape 1: Préparer votre repo GitHub** ✅

```bash
git push origin main
```

Votre repo est prêt!

---

## **Étape 2: Déployer le Backend sur Render** (5 min)

### 2.1 Créer un compte Render
1. Aller sur https://render.com
2. Sign up avec GitHub
3. Autoriser Render à accéder à vos repos

### 2.2 Créer un nouveau Blueprint
1. Dashboard → **New +** → **Blueprint**
2. Connecter votre GitHub (kassa repo)
3. Render va détecter automatiquement `render.yaml`

### 2.3 Configurer le Blueprint
1. Cliquer sur le fichier `render.yaml`
2. Render va montrer:
   - ✓ Service: kassa-api (Java)
   - ✓ Database: PostgreSQL 16 (gratuit)
   - ✓ Variables d'env pré-configurées

### 2.4 Ajouter le JWT_SECRET
Dans les **Environment Variables**:
```
JWT_SECRET = <générer avec: openssl rand -base64 32>
```

### 2.5 Déployer
Cliquer **Create Resources** et attendre (~5-10 min)

Render va:
- ✓ Créer la base de données PostgreSQL
- ✓ Build l'API avec Maven
- ✓ Déployer le JAR
- ✓ Connecter tout automatiquement

**Copier l'URL** du service: `https://kassa-api.onrender.com`

---

## **Étape 3: Déployer le Frontend sur Vercel** (3 min)

### 3.1 Créer un compte Vercel
1. Aller sur https://vercel.com
2. Sign up avec GitHub
3. Autoriser Vercel à accéder à vos repos

### 3.2 Créer un nouveau projet
1. Dashboard → **Add New** → **Project**
2. **Import Git Repository**
3. Chercher et importer: `kassa`
4. Cliquer **Import**

### 3.3 Configurer le build
Vercel devrait auto-détecter, mais vérifie:
- **Framework**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.4 Ajouter la variable d'environnement
Dans **Environment Variables**:

```
VITE_API_URL = https://kassa-api.onrender.com
```

*(Remplacer par l'URL Render que tu as copié!)*

### 3.5 Déployer
Cliquer **Deploy** et attendre (~2 min)

Tu auras une URL: `https://kassa.vercel.app`

---

## **🎉 C'est prêt! GRATUIT!**

### URLs:
- **Frontend**: https://kassa.vercel.app (Vercel - gratuit)
- **Backend API**: https://kassa-api.onrender.com (Render - gratuit)
- **API Docs**: https://kassa-api.onrender.com/swagger-ui.html
- **Base de données**: PostgreSQL Render (gratuit)

### Connexion:
```
Email: admin@kassa.local
Password: Admin123!
```

---

## **⚠️ Limitations du gratuit (Render)**

### Service (Backend)
- Peut "s'endormir" après 15 minutes d'inactivité
- Au 1er requête après, ça met ~30 sec à redémarrer
- **Solution**: Le site garde ça transparent, l'utilisateur voit juste un délai

### Base de données
- 100 MB de stockage (plus que suffisant pour un démo)
- Limite de connexions: ok
- **Gratuit à jamais**: oui!

---

## **Redéployer après un changement**

Tout est automatique! Juste fais:
```bash
git push origin main
```

Vercel et Render vont automatiquement redéployer.

---

## **Upgrade plus tard (si besoin)**

Si tu veux plus tard:
- **Render** (Backend): Pay-as-you-go (~$7/mois pour un service pro)
- **Vercel** (Frontend): Reste gratuit (ou Pro si besoin: $20/mois)

Mais le gratuit suffit amplement pour démarrer!

---

## **Troubleshooting**

### Erreur CORS au login
- Vérifier `CORS_ORIGINS` dans Render
- Format: `https://kassa.vercel.app` (avec HTTPS)

### Backend lent (30 sec au démarrage)
- Normal! C'est le "cold start" du tier gratuit Render
- Après, c'est rapide

### Build échoue sur Render
- Vérifier les logs Render (Logs tab)
- Vérifier que Java 21 est utilisé (déjà configuré)

### Erreur BASE DE DONNÉES sur Vercel
- S'assurer que render.yaml a crée la DB
- Vérifier dans Render Dashboard que PostgreSQL existe

---

## **Coûts finaux**

| Service | Coût |
|---------|------|
| Vercel Frontend | **$0** |
| Render Backend | **$0** |
| PostgreSQL Render | **$0** |
| **TOTAL** | **$0** |

✅ **Complètement gratuit!**

---

**Besoin d'aide?**
- [Docs Render](https://render.com/docs)
- [Docs Vercel](https://vercel.com/docs)

