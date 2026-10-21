# Tests de l'application Kassa

## État actuel : ✅ Backend corrigé et fonctionnel

### Corrections apportées

1. **StockMovementResponse DTO**
   - ✅ Ajout du champ `userName` manquant
   - ✅ Jointure avec AppUser pour récupérer les noms

2. **Endpoint Stock Levels**
   - ✅ Correction de l'URL dans le frontend : `/api/stock/shops/{shopId}`
   - ✅ Backend fonctionnel

3. **DashboardService**
   - ✅ Ajout de la récupération des noms d'utilisateurs
   - ✅ Optimisation avec une seule requête pour tous les users

## Tests à effectuer dans le navigateur

### 1. Page de Login (http://localhost:5173/login)
- [ ] Affichage correct de la page
- [ ] Bandeau avec identifiants de démo visible
- [ ] Connexion avec `admin@kassa.com` / `Kassa2024!`
- [ ] Redirection vers le dashboard après login

### 2. Dashboard (http://localhost:5173/dashboard)
- [ ] Affichage des KPI (Total produits, Ruptures, Valeur stock, Mouvements)
- [ ] Affichage du tableau d'alertes (même vide)
- [ ] Affichage des derniers mouvements (actuellement vide - normal)
- [ ] Pas d'erreurs dans la console

### 3. Page Produits (http://localhost:5173/products)
- [ ] Liste des 8 produits de démo
- [ ] Bouton "Ajouter un produit" fonctionnel
- [ ] Modal d'ajout/édition s'ouvre correctement
- [ ] Filtres fonctionnent (recherche, catégorie)

### 4. Page Stock (http://localhost:5173/stock)
- [ ] Onglet "Niveaux de stock" affiche les 8 produits
- [ ] Onglet "Mouvements" fonctionne (actuellement vide)
- [ ] Onglet "Transferts" fonctionne (actuellement vide)
- [ ] Bouton "Nouveau mouvement" ouvre le modal
- [ ] Scanner de code-barres accessible

### 5. Page Ventes (http://localhost:5173/sales)
- [ ] Liste des factures (actuellement vide)
- [ ] Bouton "Nouvelle facture" ouvre le modal
- [ ] Peut créer une facture avec produits

### 6. Page Rapports (http://localhost:5173/reports)
- [ ] 4 onglets s'affichent
- [ ] Filtres de date fonctionnent
- [ ] Message "Aucune donnée" si pas de ventes

## Endpoints API testés

✅ POST `/api/auth/login` - Login
✅ GET `/api/dashboard/stats/{shopId}` - Stats dashboard
✅ GET `/api/dashboard/alerts/{shopId}` - Alertes
✅ GET `/api/products` - Liste produits
✅ GET `/api/stock/shops/{shopId}` - Niveaux de stock

## Identifiants de test

### Admin (Propriétaire)
- Email: `admin@kassa.com`
- Mot de passe: `Kassa2024!`
- Accès: Boutique Akwa + Boutique Bonaberi

### Gérant
- Email: `gerant@kassa.com`
- Mot de passe: `Kassa2024!`
- Accès: Boutique Akwa uniquement

### Caissier
- Email: `caissier@kassa.com`
- Mot de passe: `Kassa2024!`
- Accès: Boutique Bonaberi uniquement

## Instructions pour tester

1. Assurez-vous que les deux serveurs tournent :
   - Backend: http://localhost:8080
   - Frontend: http://localhost:5173

2. Ouvrez http://localhost:5173 dans votre navigateur

3. Connectez-vous avec `admin@kassa.com` / `Kassa2024!`

4. Naviguez dans toutes les pages et vérifiez qu'il n'y a pas d'erreurs

5. Ouvrez la console développeur (F12) pour voir les éventuelles erreurs
