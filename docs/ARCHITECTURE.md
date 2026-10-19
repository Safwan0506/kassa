# Architecture -- Kassa

## Vue d'ensemble

Kassa suit une architecture monorepo avec separation claire entre l'API (backend), le frontend (web) et l'infrastructure.

```
kassa/
  apps/
    api/            # API REST -- Spring Boot 3, Java 21
    web/            # Frontend -- React, TypeScript, Vite
  infra/
    caddy/          # Reverse proxy et TLS
    docker-compose.yml
  docs/
  .github/workflows/
```

## Schema d'architecture

```mermaid
graph TB
    Client[Navigateur / Mobile]
    Caddy[Caddy - Reverse Proxy]
    Web[React SPA - Vite]
    API[Spring Boot API]
    DB[(PostgreSQL 16)]

    Client -->|HTTPS| Caddy
    Caddy -->|/api/*| API
    Caddy -->|/*| Web
    API -->|JDBC| DB
```

## Flux d'authentification

```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant DB as PostgreSQL

    C->>A: POST /api/auth/login (email, password)
    A->>DB: Verifier utilisateur
    A->>DB: Creer refresh token
    A-->>C: Set-Cookie (access_token, refresh_token)

    C->>A: GET /api/products (Cookie: access_token)
    A-->>C: 200 OK + donnees

    C->>A: POST /api/auth/refresh (Cookie: refresh_token)
    A->>DB: Rotation du refresh token
    A-->>C: Set-Cookie (nouveau access_token, nouveau refresh_token)
```

## Modele de donnees (simplifie)

```mermaid
erDiagram
    ORGANIZATION ||--o{ SHOP : possede
    ORGANIZATION ||--o{ USER_ROLE : contient
    USER ||--o{ USER_ROLE : a
    SHOP ||--o{ PRODUCT : vend
    SHOP ||--o{ INVOICE : emet
    INVOICE ||--o{ INVOICE_LINE : contient
    PRODUCT ||--o{ INVOICE_LINE : reference
    PRODUCT ||--o{ STOCK_MOVEMENT : suit

    ORGANIZATION {
        uuid id PK
        string name
        timestamp created_at
    }
    USER {
        uuid id PK
        string email UK
        string password_hash
        string full_name
    }
    SHOP {
        uuid id PK
        uuid organization_id FK
        string name
        string address
    }
    PRODUCT {
        uuid id PK
        uuid shop_id FK
        string name
        int quantity
        int price_fcfa
    }
```

## Decisions techniques

Voir [DECISIONS.md](DECISIONS.md) pour le journal des decisions d'architecture (ADR).

## Services Docker

| Service | Port interne | Description |
|---------|-------------|-------------|
| `db` | 5432 | PostgreSQL 16 |
| `api` | 8080 | API Spring Boot |
| `web` | 5173 | Serveur de dev Vite |
| `caddy` | 80, 443 | Reverse proxy |
