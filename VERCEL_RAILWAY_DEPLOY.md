




# 🚀 Déployer Kassa en 10 minutes

Vercel (Frontend) + Railway (Backend)

---

## **Étape 1: Préparer votre repo GitHub** ✅

```bash
git push origin main
```

Votre repo est prêt! Le commit de configuration a déjà été poussé.

---

## **Étape 2: Déployer le Backend sur Railway** (5 min)

### 2.1 Créer un compte Railway
1. Aller sur https://railway.app
2. Sign up avec GitHub
3. Autoriser Railway à accéder à vos repos

### 2.2 Créer un nouveau projet
1. Dashboard → **New Project**
2. **Deploy from GitHub**
3. Chercher et sélectionner: `kassa`
4. Cliquer **Deploy**

### 2.3 Ajouter PostgreSQL
1. Dans le projet, cliquer **+ Add**
2. Sélectionner **Database → PostgreSQL**
3. Railway crée automatiquement la DB

### 2.4 Configurer les variables d'environnement

Dans le service Spring Boot (pas PostgreSQL), aller à l'onglet **Variables**:

```
APP_ENV = prod
JWT_SECRET = <générer avec: openssl rand -base64 32>
CORS_ORIGINS = https://kassa.vercel.app
```

*(Les variables DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD sont créées automatiquement par Railway)*

### 2.5 Attendre le build et deployment
- Railway build l'API automatiquement
- Voir les logs dans **Deployments**
- Une fois prêt, tu auras une URL du type: `https://kassa-api.up.railway.app`
- Copier cette URL!

---

## **Étape 3: Déployer le Frontend sur Vercel** (3 min)

### 3.1 Créer un compte Vercel
1. Aller sur https://vercel.com
2. Sign up avec GitHub
3. Autoriser Vercel à accéder à vos repos

### 3.2 Créer un nouveau projet
1. Dashboard → **New Project**
2. Importer depuis GitHub: `kassa`
3. Cliquer **Import**

### 3.3 Configurer le build
Vercel devrait auto-détecter, mais vérifie:
- **Framework Preset**: Vite
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3.4 Ajouter la variable d'environnement
Dans **Environment Variables**, ajouter:

```
VITE_API_URL = https://kassa-api.up.railway.app
```

*(Remplacer par l'URL Railway que tu as copié!)*

### 3.5 Déployer
Cliquer **Deploy** et attendre (~2-3 min)

Une fois fait, tu auras une URL: `https://kassa.vercel.app`

---

## **🎉 C'est prêt!**

### URLs:
- **Frontend**: https://kassa.vercel.app
- **Backend API**: https://kassa-api.up.railway.app
- **Swagger Docs**: https://kassa-api.up.railway.app/swagger-ui.html

### Connexion:
```
Email: admin@kassa.local
Password: Admin123!
```

---

## **Troubleshooting**

### Erreur CORS lors du login
- Vérifier que `CORS_ORIGINS` dans Railway inclut ton domaine Vercel
- Format: `https://kassa.vercel.app` (avec HTTPS)

### API inaccessible
- Vérifier que Railway build est complété (Deployments → voir les logs)
- Vérifier que PostgreSQL est créé et connecté

### Build Vercel échoue
- Vérifier les logs Vercel
- S'assurer que `VITE_API_URL` est défini

---

## **Redéployer après un changement**

Tout est automatique! Juste fais:
```bash
git push origin main
```

Vercel et Railway vont automatiquement redéployer la dernière version.

---

## **Personnaliser le domaine**

### Vercel
1. Project Settings → Domains
2. Ajouter un domaine personnalisé

### Railway
1. Project Settings → Domain
2. Ajouter un domaine personnalisé ou alias

---

## **Coûts**

- **Vercel**: Gratuit (hobby projects)
- **Railway**: $5/mois (premier mois gratuit avec crédits)
- **Total**: ~$5/mois (très économique! 💰)

---

**Besoin d'aide?**
- [Docs Vercel](https://vercel.com/docs)
- [Docs Railway](https://docs.railway.app)
