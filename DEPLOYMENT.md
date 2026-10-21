# 🚀 Déploiement Kassa sur Vercel + Railway

## Architecture

- **Frontend**: Vercel (React + Vite)
- **Backend**: Railway (Spring Boot)
- **Base de données**: Railway PostgreSQL

## Prérequis

- Compte [Vercel](https://vercel.com)
- Compte [Railway](https://railway.app)
- GitHub repo connecté

## 1. Déployer le Backend sur Railway

### Étape 1: Créer un projet Railway
```bash
# Accéder à https://railway.app
# Créer un nouveau projet
# Sélectionner "Deploy from GitHub"
# Choisir ce repo
```

### Étape 2: Configurer PostgreSQL
```bash
# Dans Railway, ajouter un service PostgreSQL
# Les variables seront automatiquement disponibles:
# - DATABASE_URL
# - POSTGRES_HOST
# - POSTGRES_PORT
# - POSTGRES_USER
# - POSTGRES_PASSWORD
# - POSTGRES_DB
```

### Étape 3: Définir les variables d'environnement

Dans Railway, ajouter les variables:
```
APP_ENV=prod
JWT_SECRET=<générer une clé sécurisée 32 bytes>
CORS_ORIGINS=https://<ton-domaine-vercel>.vercel.app
DB_HOST=${{ POSTGRES_HOST }}
DB_PORT=${{ POSTGRES_PORT }}
DB_NAME=${{ POSTGRES_DB }}
DB_USER=${{ POSTGRES_USER }}
DB_PASSWORD=${{ POSTGRES_PASSWORD }}
```

### Étape 4: Mapper les variables automatiquement

Railway détecte le Dockerfile et build automatiquement.
Le JAR sera créé lors du build et lancé automatiquement.

**URL du backend**: `https://<railway-domain>.up.railway.app`

## 2. Déployer le Frontend sur Vercel

### Étape 1: Connecter le repo sur Vercel
```bash
# Accéder à https://vercel.com/dashboard
# Cliquer "New Project"
# Importer depuis GitHub
# Choisir ce repo
```

### Étape 2: Configurer les paramètres

- **Framework Preset**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Étape 3: Définir les variables d'environnement

```
VITE_API_URL=https://<railway-backend-url>
```

### Étape 4: Déployer

Vercel va automatiquement:
1. Build le frontend
2. Uploader les assets sur CDN
3. Configurer les routes

## 3. Configuration du Frontend

Le frontend récupère l'URL de l'API via:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
```

Mettez à jour `apps/web/src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
```

## Variables d'Environnement

### Railway (Backend)
```
APP_ENV=prod
JWT_SECRET=<clé-sécurisée>
CORS_ORIGINS=https://<vercel-domain>.vercel.app
DB_HOST=<auto>
DB_PORT=<auto>
DB_NAME=<auto>
DB_USER=<auto>
DB_PASSWORD=<auto>
```

### Vercel (Frontend)
```
VITE_API_URL=https://<railway-backend>.up.railway.app
```

## URLs de Production

- **Frontend**: https://kassa.vercel.app (ou ton domaine)
- **Backend**: https://<nom-projet>.up.railway.app
- **API Docs**: https://<nom-projet>.up.railway.app/swagger-ui.html

## Troubleshooting

### CORS Error
- Vérifier `CORS_ORIGINS` dans Railway
- Inclure le domaine Vercel complet

### Erreur de base de données
- Vérifier les variables DATABASE_URL ou DB_*
- Vérifier la connectivité PostgreSQL dans Railway

### Build échoue
- Vérifier les logs Railway et Vercel
- Vérifier Java 21 / Maven dans Dockerfile

## Mise à Jour

Pour updater l'application après un push:
- **Vercel**: Re-déploie automatiquement lors d'un push
- **Railway**: Re-déploie automatiquement lors d'un push

## Coûts

- **Vercel**: Gratuit pour hobby projects
- **Railway**: $5/mois minimum ($0 si utilisé <100h)
- **PostgreSQL Railway**: Inclus dans les crédits gratuits ($5/mois)

---

**Questions?** Voir la [documentation Railway](https://docs.railway.app/) et [Vercel](https://vercel.com/docs)
