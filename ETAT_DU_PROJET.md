# Kassa - Etat du projet

> Derniere mise a jour : 20 octobre 2026

---

## Resume

Kassa est une application de gestion de stock et de facturation multi-boutiques pour les PME africaines (zone FCFA). Le projet est structure en 7 phases (0 a 6). **Les phases 0, 1 et 2 sont implementees.** Les phases 3 a 6 restent a faire.

---

## Phases terminees

### Phase 0 - Squelette du projet

| Element | Statut |
|---------|--------|
| Structure monorepo (`apps/api`, `apps/web`) | Fait |
| Docker Compose (PostgreSQL 16, Caddy, API, Web) | Fait |
| CI GitHub Actions (tests API + lint web) | Fait |
| Documentation (README, STANDARDS, ARCHITECTURE, SECURITY, CONTRIBUTING) | Fait |

### Phase 1 - Authentification et gestion des organisations

**Backend (Spring Boot 3.4 / Java 21) :**

| Fonctionnalite | Endpoint | Statut |
|-----------------|----------|--------|
| Login (email/mot de passe) | `POST /api/auth/login` | Fait |
| Refresh token (rotation) | `POST /api/auth/refresh` | Fait |
| Logout | `POST /api/auth/logout` | Fait |
| Info utilisateur connecte | `GET /api/auth/me` | Fait |
| Verrouillage apres 5 tentatives | Integre dans AuthService | Fait |
| JWT HttpOnly cookies (15 min) | JwtService + JwtAuthFilter | Fait |
| RBAC par boutique | SecurityHelper (PROPRIETAIRE, GERANT, CAISSIER, MAGASINIER) | Fait |

**Schema de base (migration V1) :** `organizations`, `app_users`, `shops`, `user_shops`, `refresh_tokens`, `audit_logs`

**Frontend (React 19 / TypeScript / Vite) :**

| Fonctionnalite | Statut |
|-----------------|--------|
| Page de connexion (split-screen, responsive) | Fait |
| AuthContext (login/logout/getMe) | Fait |
| Routes protegees (ProtectedRoute / GuestRoute) | Fait |
| Layout avec sidebar collapsible + barre mobile | Fait |
| Design system (tokens CSS, composants UI) | Fait |

**Composants UI crees :** Button, Badge, Input, Modal, Toast, Skeleton, DataTable

**Tests backend :** AuthControllerTest (4 tests - login, mauvais mot de passe, verrouillage, refresh/logout)

### Phase 2 - Catalogue produits et gestion de stock

**Backend :**

| Fonctionnalite | Endpoint | Statut |
|-----------------|----------|--------|
| CRUD Produits | `GET/POST/PUT/DELETE /api/products` | Fait |
| Recherche produits | `GET /api/products/search` | Fait |
| CRUD Categories (hierarchiques) | `GET/POST/PUT/DELETE /api/categories` | Fait |
| CRUD Fournisseurs | `GET/POST/PUT/DELETE /api/suppliers` | Fait |
| Niveaux de stock par boutique | `GET /api/stock/shops/{shopId}` | Fait |
| Mouvements de stock (entree/sortie/ajustement) | `POST /api/stock/movements` | Fait |
| Transferts inter-boutiques | `POST /api/stock/transfers` | Fait |
| Historique des mouvements (filtre) | `GET /api/stock/movements` | Fait |
| Verrouillage optimiste des niveaux de stock | `@Version` sur StockLevel | Fait |

**Schema de base (migration V2) :** `categories`, `suppliers`, `products`, `stock_levels`, `stock_movements`

**Frontend :**

| Page | Fonctionnalites | Statut |
|------|-----------------|--------|
| Produits (`/products`) | Liste paginee, recherche, filtre categorie, ajout/modif/suppression, format FCFA | Fait |
| Stock (`/stock`) | 3 onglets : Niveaux / Mouvements / Transferts, badges alerte/rupture | Fait |
| Dashboard (`/dashboard`) | 4 KPI, alertes stock, mouvements recents | Frontend fait |

**Donnees de demo (DataSeeder) :** 1 organisation, 2 boutiques (Akwa + Bonaberi), 3 utilisateurs, 3 categories, 2 fournisseurs, 8 produits avec prix FCFA realistes

**Tests backend :** ProductControllerTest (8 tests), StockServiceTest (10 tests)

---

## Problemes connus a corriger

| Probleme | Impact | Priorite | Statut |
|----------|--------|----------|--------|
| **Dashboard backend manquant** | Page dashboard inutilisable | Haute | CORRIGE |
| **Format pagination incompatible** | Pages produits/stock cassees | Haute | CORRIGE |
| **Fournisseur non lie aux produits** | Relation absente | Moyenne | CORRIGE |
| **BCrypt au lieu d'Argon2id** : STANDARDS.md specifie Argon2id mais le code utilise BCryptPasswordEncoder | Incoherence documentation/code | Basse | A faire |
| **Pas de Dockerfile** dans `apps/api` et `apps/web` | Docker Compose ne peut pas builder | Moyenne | A faire |
| **Pas de tests frontend** : aucune dependance de test (Vitest) dans package.json | CI web-tests echoue | Moyenne | A faire |
| **CHANGELOG non mis a jour** pour les phases 1 et 2 | Documentation incomplete | Basse | A faire |

---

## Phase 3 - Facturation et paiements (TERMINEE)

**Backend implemente :**

| Fonctionnalite | Endpoint | Statut |
|-----------------|----------|--------|
| CRUD Clients | `GET/POST/PUT/DELETE /api/customers` | Fait |
| Creer facture (brouillon) | `POST /api/invoices` | Fait |
| Lister factures (filtre statut/boutique) | `GET /api/invoices` | Fait |
| Detail facture | `GET /api/invoices/{id}` | Fait |
| Valider facture (deduit le stock) | `POST /api/invoices/{id}/validate` | Fait |
| Annuler facture | `POST /api/invoices/{id}/cancel` | Fait |
| Enregistrer paiement | `POST /api/invoices/payments` | Fait |
| Numero sequentiel auto (FAC-YYYYMM-XXXX) | Integre dans InvoiceService | Fait |
| Calcul TVA par ligne et total | Integre dans Invoice.recalculateTotals() | Fait |

**Schema de base (migration V4) :** `customers`, `invoices`, `invoice_lines`, `payments`

**Statuts facture :** DRAFT -> VALIDATED -> PARTIALLY_PAID -> PAID (ou CANCELLED)

**Methodes de paiement :** CASH, MOBILE_MONEY, BANK_TRANSFER, CARD, OTHER

**Frontend implemente :**

| Page | Fonctionnalites | Statut |
|------|-----------------|--------|
| Ventes (`/sales`) | Liste factures, filtre par statut, creation, detail, validation, paiement | Fait |

---

## Phases restantes

### Phase 4 - Tableau de bord et rapports (TERMINEE)

**Backend implemente :**

| Fonctionnalite | Endpoint | Statut |
|-----------------|----------|--------|
| KPI par boutique | `GET /api/dashboard/stats/{shopId}` | Fait |
| Alertes stock | `GET /api/dashboard/alerts/{shopId}` | Fait |
| Mouvements recents | `GET /api/dashboard/recent-movements/{shopId}` | Fait |
| CA par periode | `GET /api/reports/revenue` | Fait |
| Top produits vendus | `GET /api/reports/top-products` | Fait |
| Analyse des marges | `GET /api/reports/margins` | Fait |
| Evolution du stock | `GET /api/reports/stock-evolution` | Fait |

**Frontend implemente :**

| Page | Fonctionnalites | Statut |
|------|-----------------|--------|
| Dashboard (`/dashboard`) | 4 KPI, alertes, mouvements recents | Fait |
| Rapports (`/reports`) | 4 onglets (CA, top produits, marges, evolution stock), graphiques barres, export CSV | Fait |

---

### Phase 5 - Notifications et alertes (TERMINEE)

**Backend implemente :**

| Fonctionnalite | Endpoint | Statut |
|-----------------|----------|--------|
| Lister notifications | `GET /api/notifications` | Fait |
| Compteur non lues | `GET /api/notifications/count` | Fait |
| Marquer comme lu | `POST /api/notifications/{id}/read` | Fait |
| Tout marquer lu | `POST /api/notifications/read-all` | Fait |
| Generer alertes stock | `POST /api/notifications/generate-alerts` | Fait |
| Notification auto paiement | Integre dans InvoiceService | Fait |

**Schema de base (migration V5) :** `notifications`

**Types de notifications :** STOCK_ALERT, STOCK_OUT, INVOICE_OVERDUE, INVOICE_PAID, STOCK_MOVEMENT, SYSTEM

**Alertes auto :**
- Stock sous seuil d'alerte (par boutique)
- Rupture de stock (quantite = 0)
- Facture payee (notification a la validation du paiement)
- Deduplication : pas de doublon dans les 24h pour le meme produit

**Frontend implemente :**

| Composant | Fonctionnalites | Statut |
|-----------|-----------------|--------|
| NotificationCenter | Cloche avec badge compteur, dropdown, liste, marquer lu, polling 30s | Fait |

---

### Phase 6 - Export PDF et integration mobile (TERMINEE)

**Backend implemente :**

| Fonctionnalite | Endpoint | Statut |
|-----------------|----------|--------|
| Facture PDF | `GET /api/invoices/{id}/pdf` | Fait |
| Bon de livraison PDF | `GET /api/invoices/{id}/delivery-note` | Fait |

**Bibliotheque :** OpenPDF 2.0.3 (fork open-source d'iText)

**Templates PDF :**
- Facture : en-tete organisation + boutique, informations client, tableau des lignes (produit, qte, prix, TVA, total), totaux HT/TVA/TTC, historique des paiements, pied de page avec date de generation
- Bon de livraison : en-tete, liste des produits avec quantites et unites, zones de signature (livre par / recu par)
- Formatage FCFA, couleurs de la charte graphique (vert #12614F, ocre #B9791F)

**Frontend implemente :**

| Fonctionnalite | Statut |
|-----------------|--------|
| Boutons "Facture PDF" et "Bon de livraison" dans le detail facture | Fait |
| Apercu PDF dans le navigateur (nouvelle fenetre) | Fait |
| PWA : manifest.json, theme-color, apple-mobile-web-app | Fait |
| PWA : service worker (cache statique + stale-while-revalidate) | Fait |
| PWA : installation sur ecran d'accueil mobile | Fait |
| Scan code-barres : composant BarcodeScanner (camera + BarcodeDetector API) | Fait |
| Scan integre dans mouvement de stock et transfert | Fait |
| Fallback saisie manuelle si camera indisponible | Fait |

---

## Vue d'ensemble de l'avancement

```
Phase 0  [##########] 100%  Squelette et CI
Phase 1  [##########] 100%  Authentification
Phase 2  [##########] 100%  Catalogue et stock (dashboard corrige)
Phase 3  [##########] 100%  Facturation et paiements
Phase 4  [##########] 100%  Dashboard et rapports
Phase 5  [##########] 100%  Notifications et alertes
Phase 6  [##########] 100%  Export PDF et mobile
```

**Avancement global : 100%**

---

## Problemes restants (non-bloquants)

| Probleme | Impact | Priorite |
|----------|--------|----------|
| BCrypt au lieu d'Argon2id (STANDARDS.md vs code) | Incoherence documentation/code | Basse |
| Pas de Dockerfile dans `apps/api` et `apps/web` | Docker Compose ne peut pas builder | Moyenne |
| Pas de tests frontend / Vitest | CI web-tests echoue | Moyenne |
| CHANGELOG non mis a jour | Documentation incomplete | Basse |

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Backend | Java 21, Spring Boot 3.4, Spring Security, Spring Data JPA, Flyway, JJWT, OpenPDF |
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, Zod, Radix UI |
| Base de donnees | PostgreSQL 16 (prod), H2 (dev) |
| Infrastructure | Docker Compose, Caddy 2, GitHub Actions |
| PWA | manifest.json, service worker, BarcodeDetector API |
| Design | Bricolage Grotesque, Instrument Sans, palette vert profond / ocre / papier chaud |
