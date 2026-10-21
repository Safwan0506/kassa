# 📦 Options de Déploiement Kassa

## **Option 1: 100% GRATUIT** ⭐ (Recommandé)

**Vercel (Frontend) + Render (Backend + DB)**

- ✅ Frontend: Gratuit (Vercel)
- ✅ Backend: Gratuit (Render)
- ✅ Base de données: Gratuit (PostgreSQL Render)
- ⚠️ Backend peut dormir après 15 min (cold start ~30s)

**[👉 LIRE: DEPLOY_FREE.md](DEPLOY_FREE.md)** ← Déploie ici!

---

## **Option 2: Petit coût** ($5/mois)

**Vercel (Frontend) + Railway (Backend + DB)**

- ✅ Frontend: Gratuit (Vercel)
- 💰 Backend: $5/mois (Railway)
- 💰 Base de données: Inclus
- ⚡ Toujours actif, pas de cold start

**[Docs complets: DEPLOYMENT.md](DEPLOYMENT.md)**

---

## **Comparaison rapide**

| Feature | GRATUIT (Render) | $5/mois (Railway) |
|---------|------------------|-------------------|
| Frontend (Vercel) | ✅ Gratuit | ✅ Gratuit |
| Backend | ✅ Gratuit | 💰 $5/mois |
| Base de données | ✅ Gratuit (100MB) | 💰 Inclus |
| Uptime | ✅ 99% | ✅ 99.9% |
| Performance | ⚠️ Cold start 30s | ⚡ Toujours prêt |
| Idéal pour | Demo, prototype | Production |
| **Coût total** | **$0/mois** | **~$5/mois** |

---

## 🚀 Commencer

### Le plus rapide (gratuit):
```
Lire DEPLOY_FREE.md
→ Railway (Backend + DB)
→ Vercel (Frontend)
→ 10 min, $0
```

### Besoin de plus de puissance:
```
Lire DEPLOYMENT.md
→ Railway (Backend + DB)
→ Vercel (Frontend)
→ 10 min, $5/mois
```

---

## 📝 Checklist de déploiement

### ✅ Avant de déployer
- [ ] Code commité sur main
- [ ] `.env` configuré localement
- [ ] Tests passent (si applicable)
- [ ] Frontend build: `npm run build` ✓
- [ ] Backend build: `mvn package` ✓

### ✅ Choisir ton option
- [ ] Gratuit → Render
- [ ] Payant → Railway

### ✅ Déployer
- [ ] Créer compte (Vercel + Render/Railway)
- [ ] Connecter GitHub
- [ ] Config variables env
- [ ] Deploy!
- [ ] Test: Accéder à l'app

### ✅ Après déploiement
- [ ] Login avec test credentials
- [ ] Naviguer l'app
- [ ] Vérifier API en arrière-plan
- [ ] Tester une création de données

---

## 🔗 Ressources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)

---

**Questions?** Vérifiez les guides correspondants ou ouvrez un issue!
