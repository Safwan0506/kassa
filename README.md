# Kassa -- Gestion de stock et facturation multi-boutiques

> Une application pour que les commercants arretent de gerer leur stock sur un cahier.

![Kassa Screenshot](docs/screenshots/placeholder.png)

---

## Le probleme

Des millions de commercants en Afrique gerent leur inventaire et leur facturation sur papier ou avec des tableurs fragiles. Les ruptures de stock sont decouvertes trop tard, les factures se perdent, et la vision consolidee entre plusieurs boutiques est inexistante.

**Kassa** est une plateforme web pensee pour ces commercants : simple, rapide, utilisable sur un telephone avec une connexion moyenne.

## Fonctionnalites

- **Multi-boutiques** : gerez plusieurs points de vente depuis un seul compte.
- **Gestion de stock** : entrees, sorties, alertes de stock bas, historique complet.
- **Facturation** : creation de factures, suivi des paiements, export PDF.
- **Tableau de bord** : chiffre d'affaires, produits les plus vendus, tendances.
- **Roles et permissions** : proprietaire, gerant, caissier -- chacun voit ce qui le concerne.
- **Multi-devise FCFA** : formatage natif en francs CFA.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| API | Java 21, Spring Boot 3, PostgreSQL 16, Flyway |
| Web | React, TypeScript, Vite, TanStack Query, Zod, Radix UI |
| Infra | Docker Compose, Caddy, GitHub Actions |

## Architecture

```
kassa/
  apps/
    api/          # API REST Spring Boot
    web/          # Frontend React + Vite
  infra/
    caddy/        # Reverse proxy
    docker-compose.yml
  docs/
    ARCHITECTURE.md
    DECISIONS.md
    screenshots/
```

Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) pour le schema complet.

## Demarrage rapide

### Prerequis

- Docker et Docker Compose
- Java 21 (pour le developpement local de l'API)
- Node.js 20+ (pour le developpement local du frontend)

### Lancer l'environnement complet

```bash
cd infra
docker compose up -d
```

L'application sera accessible sur `http://localhost`.

### Developpement local

**API :**

```bash
cd apps/api
./mvnw spring-boot:run
```

**Web :**

```bash
cd apps/web
npm install
npm run dev
```

## Tests

```bash
# API
cd apps/api
./mvnw test

# Web
cd apps/web
npm test
```

Couverture minimale ciblee : 70%.

## Securite

- Authentification par JWT (cookies HttpOnly).
- Hachage des mots de passe avec Argon2id.
- RBAC strict avec isolation par organisation.
- Rate limiting sur les endpoints sensibles.
- Headers de securite (CSP, HSTS) via Caddy.

Voir [SECURITY.md](SECURITY.md) pour le detail.

## Feuille de route

- [x] Phase 0 : Squelette du projet et CI
- [ ] Phase 1 : Authentification et gestion des organisations
- [ ] Phase 2 : Catalogue produits et gestion de stock
- [ ] Phase 3 : Facturation et paiements
- [ ] Phase 4 : Tableau de bord et rapports
- [ ] Phase 5 : Notifications et alertes
- [ ] Phase 6 : Export PDF et integration mobile

## Licence

MIT -- voir [LICENSE](LICENSE).

## Auteur

**Safwan Djazouli**

- GitHub : [https://github.com/Safwanmusic](https://github.com/SafwanMusic)
- LinkedIn : [https://linkedin.com/in/safwan-djazouli](https://linkedin.com/in/safwan-djazouli)
