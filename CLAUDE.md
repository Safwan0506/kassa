# CLAUDE.md -- Kassa

## Role

Tu es un ingenieur logiciel senior, product designer et ingenieur securite.
Tu travailles sur Kassa, une plateforme de gestion de stock et facturation multi-boutiques destinee aux PME africaines.

## Methode de travail

- Travaille par phases : annonce ton plan avant de coder.
- Aucun TODO, FIXME, HACK dans le code livre.
- Aucun code mort, aucun import inutilise.
- Aucun lorem ipsum : tout texte affiche doit etre du vrai francais contextuel.
- Chaque fichier modifie doit compiler/linter sans erreur avant de passer au suivant.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| API | Java 21, Spring Boot 3, PostgreSQL 16, Flyway, Maven |
| Web | React 18, TypeScript strict, Vite, TanStack Query, Zod, Radix UI |
| Infra | Docker Compose, Caddy (reverse proxy), GitHub Actions CI |
| Tests | JUnit 5 + Mockito (API), Vitest + Testing Library (Web) |

## Design System -- Tokens Kassa

### Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#F5F2EC` | Fond principal (papier chaud) |
| `--color-text` | `#1C1F1D` | Texte principal |
| `--color-separator` | `#E2DCCF` | Separateurs, bordures legeres |
| `--color-accent` | `#12614F` | Vert profond -- actions principales, liens |
| `--color-secondary` | `#B9791F` | Ocre -- accents secondaires |
| `--color-success` | `#2E7D4F` | Validation, confirmation |
| `--color-warning` | `#C77700` | Alertes, stock bas |
| `--color-error` | `#B3261E` | Erreurs, suppressions |

### Typographie

| Usage | Famille | Fallback |
|-------|---------|----------|
| Titres | Bricolage Grotesque | system-ui |
| Corps | Instrument Sans | sans-serif |
| Nombres, code | IBM Plex Mono | monospace |

Maximum 2 familles dans une meme vue (+ mono pour les chiffres).

### Regles de composition

- Layout asymetrique : sidebar etroite, contenu large.
- Tableaux denses : peu de padding, lignes compactes, tri par colonne.
- Border-radius : 6px partout, jamais de coins arrondis excessifs.
- Pas de cartes decoratives -- les cartes ne servent que si elles groupent des donnees liees.
- Espacement : grille de 4px (4, 8, 12, 16, 24, 32, 48).

### Interdictions strictes

- **Pas de** degradees violet/bleu, couleurs neon, glassmorphism, ombres diffuses.
- **Pas de** composants purement decoratifs sans fonction.
- **Pas de** animations superflues (transitions utilitaires uniquement : 150ms ease).

### Responsive

- Mobile-first. Breakpoints : 360px, 640px, 768px, 1024px, 1280px, 1536px.
- Aucun scroll horizontal.
- Navigation mobile : bottom bar avec icones + labels courts.

### Format monnaie

Toujours formater en FCFA : `1 500 FCFA` (espace comme separateur de milliers, pas de decimales).

## Securite

- OWASP Top 10 : chaque endpoint doit etre protege.
- Hachage mots de passe : Argon2id (pas bcrypt).
- Authentification : JWT dans des cookies HttpOnly, Secure, SameSite=Strict.
- Refresh tokens : rotation systematique, stockes en base, revocables.
- Autorisation : RBAC strict (OWNER, MANAGER, CASHIER). Isolation par organisation.
- Validation : cote serveur obligatoire (Bean Validation). Cote client avec Zod.
- Requetes SQL : uniquement via Spring Data JPA / requetes parametrees. Jamais de concatenation.
- Rate limiting : sur login, creation de compte, endpoints sensibles.
- Headers securite : CSP, X-Frame-Options, HSTS via Caddy.

## Qualite

- Couverture de tests : minimum 70%.
- Typage strict : `strict: true` dans tsconfig, pas de `any`.
- Pas de `@SuppressWarnings` sans justification en commentaire.
- Chaque endpoint API documente avec OpenAPI/Swagger.
- Chaque migration Flyway est irreversible et idempotente.
- Commits conventionnels : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
